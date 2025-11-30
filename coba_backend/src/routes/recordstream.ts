import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { mseedService } from '../services/mseedService'

export const recordStreamRouter = Router()

recordStreamRouter.get('/get', requireAuth, async (req, res) => {
  try {
    const { year, network, station, channel, starttime, endtime } = req.query

    if (!year || !network || !station || !channel || !starttime || !endtime) {
      return res.status(400).json({
        status: false,
        message: 'year, network, station, channel, starttime, endtime are required'
      })
    }

    const requestedChannel = String(channel)
    const normalizedChannel = requestedChannel.endsWith('HZ') ? 'DPZ' : requestedChannel

    const start = new Date(String(starttime))
    const end = new Date(String(endtime))

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      return res.status(400).json({
        status: false,
        message: 'invalid starttime/endtime'
      })
    }

    const waveformData = await mseedService.getWaveformData(
      String(network),
      String(station),
      normalizedChannel
    )

    // If we don't have data for this station/channel, respond with an empty waveform
    if (!waveformData) {
      return res.json({
        data: {
          time_start: start.toISOString(),
          time_end: end.toISOString(),
          sampling_rate: 0,
          delta: 1,
          location: '00',
          npts: 0,
          station: String(station),
          network: String(network),
          channel: String(channel),
          waveform: []
        }
      })
    }

    const durationSeconds = (end.getTime() - start.getTime()) / 1000
    const totalSamples = waveformData.waveform.length
    const samplesForWindow = Math.max(1, Math.floor(durationSeconds / waveformData.delta))
    const windowSamples = Math.min(totalSamples, samplesForWindow)

    const slice = waveformData.waveform.slice(0, windowSamples)

    return res.json({
      data: {
        time_start: start.toISOString(),
        time_end: end.toISOString(),
        sampling_rate: waveformData.sampling_rate,
        delta: waveformData.delta,
        location: waveformData.location,
        npts: slice.length,
        station: String(station),
        network: String(network),
        channel: requestedChannel,
        waveform: slice
      }
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[recordstream] error:', err)
    return res.status(500).json({
      status: false,
      message: 'failed to read record stream'
    })
  }
})
