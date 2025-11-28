import { Router } from 'express'
import { StationModel } from '../models/Station'
import { requireAuth } from '../middleware/auth'

export const stationsRouter = Router()

stationsRouter.get('/getall', requireAuth, async (req, res) => {
  const page = Number(req.query.page ?? 1)
  const limit = Number(req.query.limit ?? 10)
  const q = (req.query.q as string | undefined)?.trim()

  const filter = q ? { name: { $regex: q, $options: 'i' } } : {}
  const [stations, total] = await Promise.all([
    StationModel.find(filter)
      .skip((page - 1) * limit)
      .limit(limit),
    StationModel.countDocuments(filter)
  ])

  return res.json({ data: { stations, total } })
})

stationsRouter.post('/', requireAuth, async (req, res) => {
  const body = req.body
  const required = ['name', 'code', 'network', 'channel', 'longitude', 'latitude', 'elevation', 'server_seedlink', 'server_fdsn']
  const missing = required.filter((key) => body[key] === undefined)
  if (missing.length) return res.status(400).json({ status: false, message: `missing fields: ${missing.join(', ')}` })

  const existing = await StationModel.findOne({ code: body.code })
  if (existing) return res.status(409).json({ status: false, message: 'station code already exists' })

  const station = await StationModel.create(body)
  return res.status(201).json({ status: true, data: station })
})

stationsRouter.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const station = await StationModel.findByIdAndUpdate(id, req.body, { new: true })
  if (!station) return res.status(404).json({ status: false, message: 'station not found' })
  return res.json({ status: true, data: station })
})

stationsRouter.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const station = await StationModel.findByIdAndDelete(id)
  if (!station) return res.status(404).json({ status: false, message: 'station not found' })
  return res.json({ status: true })
})

stationsRouter.put('/updatestatus', requireAuth, async (req, res) => {
  const { station_id, status } = req.body
  if (!station_id || !status) return res.status(400).json({ status: false, message: 'station_id and status required' })

  const station = await StationModel.findByIdAndUpdate(station_id, { status }, { new: true })
  if (!station) return res.status(404).json({ status: false, message: 'station not found' })
  return res.json({ status: true, data: station })
})

stationsRouter.get('/getwaveformstatus', requireAuth, async (req, res) => {
  const stationId = req.query.station_id as string | undefined
  if (!stationId) return res.status(400).json({ status: false, message: 'station_id required' })

  const station = await StationModel.findById(stationId)
  if (!station) return res.status(404).json({ status: false, message: 'station not found' })

  const metrics = {
    delay_second: 0,
    spike_amplitude: 0,
    displacement: 0,
    velocity: 0,
    acceleration: 0
  }

  return res.json({ data: { ...station.toObject(), ...metrics } })
})
