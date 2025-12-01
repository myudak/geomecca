import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { env } from '../config/env'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const require = createRequire(import.meta.url)
// w-data-mseed is Windows-only; guard the import
const WDataMseed = process.platform === 'win32' ? require('w-data-mseed') : null
const isMseedSupported = !!WDataMseed

// Linux fallback parser (miniSEED V2) via seisplotjs (simple encoding support)
let miniseed: any | null = null
let seedcodec: any | null = null
if (!isMseedSupported) {
  try {
    const sp = require('seisplotjs')
    miniseed = sp.miniseed
    seedcodec = sp.seedcodec
  } catch (err) {
    console.warn('[MseedService] Failed to load seisplotjs for Linux parsing fallback:', err)
  }
}

const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)

interface MseedFileInfo {
  filePath: string
  station: string
  network: string
  channel: string
  date: string
  timeSegment: string
}

export interface WaveformData {
  station: string
  network: string
  channel: string
  location: string
  starttime: Date
  endtime: Date
  sampling_rate: number
  delta: number
  npts: number
  waveform: number[]
}

class MseedService {
  private readonly dataPath: string
  public fileIndex: Map<string, MseedFileInfo[]> = new Map()
  private indexBuilt: boolean = false
  private waveformCache: Map<string, Promise<WaveformData | null>> = new Map()

  constructor(dataPath?: string) {
    // If env is set, use it; otherwise default to data/mseed relative to cwd
    const resolvedPath = env.mseedPath
      ? env.mseedPath
      : path.join(process.cwd(), 'data', 'mseed')

    this.dataPath = dataPath ?? resolvedPath
  }

  /**
   * Build an index of all available MiniSEED files
   * Maps station IDs to file information for quick lookups
   */
  async buildIndex(): Promise<void> {
    console.log('[MseedService] Building file index...')
    this.fileIndex.clear()

    try {
      const dateFolders = await readdir(this.dataPath)

      for (const dateFolder of dateFolders) {
        const datePath = path.join(this.dataPath, dateFolder)
        const dateStat = await stat(datePath)
        if (!dateStat.isDirectory()) continue

        const files = await readdir(datePath)
        for (const file of files) {
          if (!file.endsWith('.mseed')) continue

          const parts = file.replace('.mseed', '').split('_')
          if (parts.length !== 2) {
            console.warn(`[MseedService] Unexpected filename format: ${file}`)
            continue
          }

          const station = parts[1]
          const standardChannels = ['DPZ', 'DPN', 'DPE']
          for (const channel of standardChannels) {
            const fileInfo: MseedFileInfo = {
              filePath: path.join(datePath, file),
              station,
              network: 'PPL',
              channel,
              date: dateFolder,
              timeSegment: 'full-day'
            }
            const key = `PPL.${station}.${channel}`
            if (!this.fileIndex.has(key)) {
              this.fileIndex.set(key, [])
            }
            this.fileIndex.get(key)!.push(fileInfo)
          }
        }
      }

      this.indexBuilt = true
      console.log(`[MseedService] Index built with ${this.fileIndex.size} unique station/channel combinations`)
      console.log(
        '[MseedService] Available stations:',
        Array.from(new Set(Array.from(this.fileIndex.keys()).map((k) => k.split('.')[1])))
      )
    } catch (error) {
      console.error('[MseedService] Error building index:', error)
      throw error
    }
  }

  /**
   * Get waveform data for a specific station/channel
   */
  async getWaveformData(network: string, station: string, channel: string): Promise<WaveformData | null> {
    if (!this.indexBuilt) {
      await this.buildIndex()
    }

    const key = `${network}.${station}.${channel}`

    if (this.waveformCache.has(key)) {
      return this.waveformCache.get(key)!
    }

    const files = this.fileIndex.get(key)
    if (!files || files.length === 0) {
      console.log(`[MseedService] No files found for key=${key} under ${this.dataPath}`)
      return null
    }

    const fileInfo = files[0]

    const loadPromise = (async () => {
      try {
        // Windows path: use w-data-mseed
        if (isMseedSupported) {
          console.log(`[MseedService] Reading file: ${fileInfo.filePath} for station ${station}`)
          const results = await WDataMseed(fileInfo.filePath)

          if (!results || results.length === 0) {
            console.log(`[MseedService] No records found in ${fileInfo.filePath}`)
            return null
          }

          const channelResult = results.find((r: any) => {
            const sidParts = r.data?.heads?.SID?.split('_')
            if (sidParts && sidParts.length >= 4) {
              const resultChannel = sidParts[3]
              return resultChannel.includes(fileInfo.channel)
            }
            return false
          })

          const pickResult = channelResult?.data ?? results[0]?.data
          if (!pickResult) {
            console.log(`[MseedService] No valid data in ${fileInfo.filePath}`)
            return null
          }

          const heads = pickResult.heads
          const records = pickResult.records

          const startTime = new Date(heads.start_time)
          const samplingRate = parseFloat(heads.sample_rate_hz)
          const sampleCount = parseInt(heads.sample_count)

          const durationSeconds = sampleCount / samplingRate
          const endTime = new Date(startTime.getTime() + durationSeconds * 1000)

          const waveformData: WaveformData = {
            station,
            network,
            channel,
            location: '00',
            starttime: startTime,
            endtime: endTime,
            sampling_rate: samplingRate,
            delta: 1 / samplingRate,
            npts: records.length,
            waveform: records
          }

          console.log(`[MseedService] Successfully read ${records.length} samples from ${fileInfo.filePath}`)
          return waveformData
        }

        // Linux fallback: use seisplotjs for limited encodings (e.g., encoding 3)
        if (!miniseed || !seedcodec) {
          console.warn('[MseedService] seisplotjs not available; cannot parse MiniSEED on this platform')
          return null
        }

        console.log(`[MseedService] Reading file (fallback): ${fileInfo.filePath} for station ${station}`)
        const raw = fs.readFileSync(fileInfo.filePath)
        const ab = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength)
        const records = miniseed.parseDataRecords(ab)

        const matched = records.filter(
          (r: any) => r.header.chanCode && r.header.chanCode.toUpperCase().includes(channel.toUpperCase())
        )
        if (!matched.length) {
          console.log(`[MseedService] No matching channel records in ${fileInfo.filePath} for ${channel}`)
          return null
        }

        const samples: number[] = []
        let startTime: Date | null = null
        let endTime: Date | null = null
        let samplingRate = 0

        for (const rec of matched) {
          const enc = rec.header.encoding
          const little = !!rec.header.littleEndian
          const view = new DataView(rec.data.buffer, rec.data.byteOffset, rec.data.byteLength)
          let decoded: number[] = []

          // Support common encodings: 3 = 32-bit int, 1 = 16-bit
          if (enc === 3) {
            for (let i = 0; i < rec.header.numSamples; i++) {
              decoded.push(view.getInt32(i * 4, little))
            }
          } else if (enc === 1) {
            for (let i = 0; i < rec.header.numSamples; i++) {
              decoded.push(view.getInt16(i * 2, little))
            }
          } else {
            console.warn(`[MseedService] Unsupported encoding ${enc} in fallback parser`)
            continue
          }

          samples.push(...decoded)
          if (!startTime) {
            startTime = rec.header.startTime.toJSDate()
          }
          endTime = rec.header.endTime.toJSDate()
          samplingRate = rec.header.sampleRate
        }

        if (!samples.length || !startTime || !endTime) {
          return null
        }

        const waveformData: WaveformData = {
          station,
          network,
          channel,
          location: '00',
          starttime: startTime,
          endtime: endTime,
          sampling_rate: samplingRate,
          delta: 1 / samplingRate,
          npts: samples.length,
          waveform: samples
        }

        console.log(`[MseedService] Fallback parsed ${samples.length} samples from ${fileInfo.filePath}`)
        return waveformData
      } catch (error) {
        console.error(`[MseedService] Error reading ${fileInfo.filePath}:`, error)
        return null
      }
    })()

    this.waveformCache.set(key, loadPromise)
    return loadPromise
  }

  /**
   * Get available stations
   */
  async getAvailableStations(): Promise<string[]> {
    if (!this.indexBuilt) {
      await this.buildIndex()
    }
    return Array.from(this.fileIndex.keys())
  }
}

// Export singleton instance
export const mseedService = new MseedService()
