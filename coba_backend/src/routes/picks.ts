import { Router } from 'express'
import { PickModel } from '../models/Pick'
import { requireAuth } from '../middleware/auth'

export const picksRouter = Router()

picksRouter.get('/getbystation', requireAuth, async (req, res) => {
  const stationId = req.query.station_id as string | undefined
  const start = req.query.start_date ? new Date(req.query.start_date as string) : new Date(Date.now() - 30 * 60 * 1000)
  const end = req.query.end_date ? new Date(req.query.end_date as string) : new Date()

  if (!stationId) return res.status(400).json({ status: false, message: 'station_id required' })

  const picks = await PickModel.find({ station_id: stationId, timestamp: { $gte: start, $lte: end } }).sort({ timestamp: 1 })
  return res.json({ data: picks })
})

picksRouter.post('/', requireAuth, async (req, res) => {
  const { station_id, timestamp } = req.body
  if (!station_id || !timestamp) return res.status(400).json({ status: false, message: 'station_id and timestamp required' })
  const pick = await PickModel.create({ station_id, timestamp })
  return res.status(201).json({ status: true, data: pick })
})
