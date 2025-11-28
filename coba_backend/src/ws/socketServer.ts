import { randomUUID } from 'crypto'
import { Server as HTTPServer } from 'http'
import { Server as IOServer } from 'socket.io'
import { WebSocketServer, WebSocket } from 'ws'

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

const generateWaveform = (channelName: string): StationWaveForm[] => {
  const [network, station, channel] = channelName.split('.')
  const now = new Date()
  const start = new Date(now.getTime() - 30_000)
  const end = now
  const samplingRate = 50
  const points = samplingRate * 30
  const waveform = Array.from({ length: points }, (_, i) => Math.sin(i / 10) * 100 + Math.random() * 5)

  return [
    {
      date: start.toISOString(),
      starttime: start.toISOString(),
      endtime: end.toISOString(),
      sampling_rate: samplingRate,
      delta: 1 / samplingRate,
      location: '00',
      npts: points,
      station: station ?? 'PPL01',
      network: network ?? 'PP',
      channel: channel ?? 'DPZ',
      expiration_timestamp: Math.floor(Date.now() / 1000) + 30,
      waveform
    }
  ]
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
  const io = new IOServer(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  })

  io.on('connection', (socket) => {
    socket.on('waveform', (channelName: string) => {
      const eventName = `data-${channelName}`
      socket.emit(eventName, generateWaveform(channelName))
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
