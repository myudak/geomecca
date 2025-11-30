import { randomUUID } from 'crypto'
import { Server as HTTPServer } from 'http'
import { Server as IOServer } from 'socket.io'
import { WebSocketServer, WebSocket } from 'ws'
import { mseedService } from '../services/mseedService'

interface StationWaveForm {
  date: string
  starttime: string
  endtime: string
  sampling_rate: number
  delta: number
  location: string
  npts: number
  station: string
  network: string
  channel: string
  expiration_timestamp: number
  waveform: number[]
}

interface SimulatedWaveformState {
  station: string
  network: string
  channel: string
  location: string
  sampling_rate: number
  delta: number
  npts: number
  waveform: number[]
  originalStart: Date
  originalEnd: Date
  windowSamples: number
  lastIndex: number
  lastTimestamp: number
}

const WINDOW_SECONDS = 30 * 60 // 30 minutes
const simulationStates = new Map<string, SimulatedWaveformState>()

const parseChannelName = (channelName: string) => {
  const parts = channelName.split('.')

  const network = parts[0] || 'PPL'
  const station = parts[1] || 'PPL01'
  const location = parts[2] || '00'
  // Typical format: NETWORK.STATION.LOCATION.CHANNEL
  const channel = parts[3] || parts[2] || 'DPZ'

  return { network, station, location, channel }
}

const getOrCreateSimulationState = async (
  key: string,
  network: string,
  station: string,
  channel: string,
  location: string
): Promise<SimulatedWaveformState | null> => {
  if (simulationStates.has(key)) {
    return simulationStates.get(key)!
  }

  try {
    // Local MiniSEED archive stores vertical component as DPZ; map BHZ/SHZ -> DPZ.
    const effectiveChannel = channel.endsWith('HZ') ? 'DPZ' : channel

    const waveformData = await mseedService.getWaveformData(network, station, effectiveChannel)

    if (!waveformData) {
      console.log(`[SocketServer] No MiniSEED data found for ${key}, returning empty waveform`)
      return null
    }

    const { waveform, delta, sampling_rate, npts, starttime, endtime } = waveformData

    if (!waveform.length || !npts) {
      console.log(`[SocketServer] MiniSEED for ${key} has no samples, returning empty waveform`)
      return null
    }

    const windowSamples = Math.max(1, Math.min(npts, Math.floor(WINDOW_SECONDS / delta)))
    const now = Date.now()

    const state: SimulatedWaveformState = {
      station,
      network,
      channel: effectiveChannel,
      location,
      sampling_rate,
      delta,
      npts,
      waveform,
      originalStart: starttime,
      originalEnd: endtime,
      windowSamples,
      lastIndex: windowSamples - 1,
      lastTimestamp: now
    }

    simulationStates.set(key, state)
    console.log(`[SocketServer] Initialized simulation state for ${key} with ${npts} samples`)

    return state
  } catch (error) {
    console.error(`[SocketServer] Error initializing simulation state for ${key}:`, error)
    return null
  }
}

const buildRealtimeWindow = (state: SimulatedWaveformState): StationWaveForm => {
  const nowMs = Date.now()
  const dtSec = (nowMs - state.lastTimestamp) / 1000

  if (dtSec > 0) {
    const stepSamples = Math.floor(dtSec / state.delta)
    if (stepSamples > 0) {
      state.lastIndex = (state.lastIndex + stepSamples) % state.npts
      state.lastTimestamp = state.lastTimestamp + stepSamples * state.delta * 1000
    }
  }

  const values: number[] = new Array(state.windowSamples)
  const n = state.npts
  const windowStartIndex = state.lastIndex - (state.windowSamples - 1)

  for (let i = 0; i < state.windowSamples; i++) {
    let idx = windowStartIndex + i
    if (idx < 0) {
      idx = (idx % n) + n
    } else {
      idx = idx % n
    }
    values[i] = state.waveform[idx]
  }

  const endTimeMs = nowMs
  const startTimeMs = endTimeMs - state.windowSamples * state.delta * 1000

  const starttime = new Date(startTimeMs)
  const endtime = new Date(endTimeMs)

  return {
    date: starttime.toISOString(),
    starttime: starttime.toISOString(),
    endtime: endtime.toISOString(),
    sampling_rate: state.sampling_rate,
    delta: state.delta,
    location: state.location,
    npts: values.length,
    station: state.station,
    network: state.network,
    channel: state.channel,
    expiration_timestamp: Math.floor(endTimeMs / 1000) + 60,
    waveform: values
  }
}

const generateWaveform = async (channelName: string): Promise<StationWaveForm[]> => {
  const { network, station, location, channel } = parseChannelName(channelName)
  const key = `${network}.${station}.${channel}`

  const state = await getOrCreateSimulationState(key, network, station, channel, location)
  if (!state) {
    return []
  }

  const frame = buildRealtimeWindow(state)
  return [frame]
}

const sendPeriodic = (ws: WebSocket, build: () => any, intervalMs: number) => {
  const send = () => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(build()))
    }
  }
  const id = setInterval(send, intervalMs)
  ws.on('close', () => clearInterval(id))
  send()
}

export const startSocketServer = (server: HTTPServer) => {
  // Initialize MiniSEED service on startup
  mseedService.buildIndex().then(() => {
    console.log('[SocketServer] MiniSEED index built successfully')
  }).catch((error) => {
    console.error('[SocketServer] Failed to build MiniSEED index:', error)
  })

  const io = new IOServer(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  })

  const waveformIntervals = new Map<string, Map<string, NodeJS.Timeout>>()

  io.on('connection', (socket) => {
    waveformIntervals.set(socket.id, new Map())

    socket.on('waveform', async (channelName: string) => {
      const eventName = `data-${channelName}`
      const sendWaveform = async () => {
        const waveformData = await generateWaveform(channelName)
        socket.emit(eventName, waveformData)
      }

      const clientIntervals = waveformIntervals.get(socket.id)!
      if (clientIntervals.has(channelName)) {
        clearInterval(clientIntervals.get(channelName)!)
      }

      await sendWaveform()
      const intervalId = setInterval(sendWaveform, 3000)
      clientIntervals.set(channelName, intervalId)
    })

    socket.on('disconnect', () => {
      const clientIntervals = waveformIntervals.get(socket.id)
      if (clientIntervals) {
        clientIntervals.forEach((intervalId) => clearInterval(intervalId))
        waveformIntervals.delete(socket.id)
      }
    })
  })

  const eventWs = new WebSocketServer({ noServer: true })
  const pickingWs = new WebSocketServer({ noServer: true })
  const arrivalWs = new WebSocketServer({ noServer: true })

  eventWs.on('connection', (ws) => {
    sendPeriodic(
      ws,
      () => ({ _id: randomUUID(), name: 'mock-event', origin_ids: [], created_at: new Date().toISOString() }),
      5000
    )
  })

  pickingWs.on('connection', (ws) => {
    sendPeriodic(
      ws,
      () => ({
        network: 'PP',
        station: 'PPL01',
        picks: [{ _id: randomUUID(), timestamp: new Date().toISOString() }]
      }),
      3000
    )
  })

  arrivalWs.on('connection', (ws) => {
    sendPeriodic(
      ws,
      () => ({
        pick_source_id: randomUUID(),
        station_id: 'PPL01',
        network: 'PP',
        station: 'PPL01',
        longitude: 107.44,
        latitude: -7.18,
        picks: [{ _id: randomUUID(), timestamp: new Date().toISOString(), type: 'P' as const }]
      }),
      4000
    )
  })

  server.on('upgrade', (request, socket, head) => {
    const { url } = request
    // Let socket.io handle its own upgrade path
    if (url?.startsWith('/socket.io')) return

    if (url === '/wsevent') {
      eventWs.handleUpgrade(request, socket, head, (ws) => eventWs.emit('connection', ws, request))
    } else if (url === '/wspicking') {
      pickingWs.handleUpgrade(request, socket, head, (ws) => pickingWs.emit('connection', ws, request))
    } else if (url === '/wsarrivalpick') {
      arrivalWs.handleUpgrade(request, socket, head, (ws) => arrivalWs.emit('connection', ws, request))
    } else {
      socket.destroy()
    }
  })
}
