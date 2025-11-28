import { Router } from 'express'
import { ArrivalModel } from '../models/Arrival'
import { requireAuth } from '../middleware/auth'

export const arrivalsRouter = Router()

arrivalsRouter.get('/getbystation', requireAuth, async (req, res) => {
  const stationId = req.query.station_id as string | undefined
  const start = req.query.start_date ? new Date(req.query.start_date as string) : new Date(Date.now() - 30 * 60 * 1000)
  const end = req.query.end_date ? new Date(req.query.end_date as string) : new Date()

  if (!stationId) return res.status(400).json({ status: false, message: 'station_id required' })

  const arrivals = await ArrivalModel.find({ station_id: stationId, timestamp: { $gte: start, $lte: end } }).sort({ timestamp: 1 })
  return res.json({ data: arrivals })
})

arrivalsRouter.post('/', requireAuth, async (req, res) => {
  const { pick_source_id, station_id, timestamp, phase_type } = req.body
  if (!pick_source_id || !station_id || !timestamp || !phase_type) {
    return res.status(400).json({ status: false, message: 'pick_source_id, station_id, timestamp, phase_type required' })
  }

  const arrival = await ArrivalModel.create({ pick_source_id, station_id, timestamp, phase_type })
  return res.status(201).json({ status: true, data: arrival })
})
