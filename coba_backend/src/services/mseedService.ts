import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { env } from '../config/env'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const require = createRequire(import.meta.url)
const WDataMseed = require('w-data-mseed')

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

interface WaveformData {
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
  private fileIndex: Map<string, MseedFileInfo[]> = new Map()
  private indexBuilt: boolean = false
  private waveformCache: Map<string, Promise<WaveformData | null>> = new Map()

  constructor(dataPath?: string) {
    // Prefer explicit env, then a mounted /data/mseed, then local data/mseed
    const fallbackMounted = '/data/mseed'
    const fallbackLocal = path.join(process.cwd(), 'data', 'mseed')
    const resolvedPath =
      dataPath ??
      env.mseedPath ??
      (fs.existsSync(fallbackMounted) ? fallbackMounted : fallbackLocal)

    this.dataPath = resolvedPath
  }

  /**
   * Build an index of all available MiniSEED files
   * Maps station IDs to file information for quick lookups
   */
  async buildIndex(): Promise<void> {
    console.log('[MseedService] Building file index...')
    this.fileIndex.clear()

    try {
      // Read all date folders (2023-12-20, 2024-01-01, etc.)
      const dateFolders = await readdir(this.dataPath)

      for (const dateFolder of dateFolders) {
        const datePath = path.join(this.dataPath, dateFolder)
        const dateStat = await stat(datePath)

        if (!dateStat.isDirectory()) continue

        // Read MiniSEED files directly in date folder (no time segments)
        const files = await readdir(datePath)

        for (const file of files) {
          if (!file.endsWith('.mseed')) continue

          // Parse filename: YYYYMMDD_STATIONCODE.mseed (e.g., 20231220_PPL04.mseed)
          const parts = file.replace('.mseed', '').split('_')
          if (parts.length !== 2) {
            console.warn(`[MseedService] Unexpected filename format: ${file}`)
            continue
          }

          const dateString = parts[0]  // YYYYMMDD
          const station = parts[1]     // PPL04, TCH02, TCH04

          // Create index entries for each standard channel
          // New files contain all channels in one file
          const standardChannels = ['DPZ', 'DPN', 'DPE']
          for (const channel of standardChannels) {
            const fileInfo: MseedFileInfo = {
              filePath: path.join(datePath, file),
              station,
              network: 'PPL',  // Network is PPL for all
              channel,
              date: dateFolder,
              timeSegment: 'full-day'  // No time segments in new format
            }

            // Index by network.station.channel
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
      console.log('[MseedService] Available stations:', Array.from(new Set(
        Array.from(this.fileIndex.keys()).map(k => k.split('.')[1])
      )))
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

    // For now, just use the first available file
    // TODO: Implement time-based file selection
    const fileInfo = files[0]

    const loadPromise = (async () => {
      try {
        console.log(`[MseedService] Reading file: ${fileInfo.filePath} for station ${station}`)

        // Parse MiniSEED using w-data-mseed
        const results = await WDataMseed(fileInfo.filePath)

        if (!results || results.length === 0) {
          console.log(`[MseedService] No records found in ${fileInfo.filePath}`)
          return null
        }

        // Find the matching channel in results
        const channelResult = results.find((r: any) => {
          const sidParts = r.data?.heads?.SID?.split('_')
          if (sidParts && sidParts.length >= 4) {
            const resultChannel = sidParts[3] // HNE, HNN, HNZ, etc.
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

        // Calculate end time: start_time + (sample_count / sample_rate) seconds
        const durationSeconds = sampleCount / samplingRate
        const endTime = new Date(startTime.getTime() + durationSeconds * 1000)

        const waveformData: WaveformData = {
          station: station,
          network: network,
          channel: channel,
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
