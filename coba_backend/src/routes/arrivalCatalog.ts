import { Router } from 'express'
import { ArrivalModel } from '../models/Arrival'
import { OriginModel } from '../models/Origin'
import { requireAuth } from '../middleware/auth'

export const arrivalCatalogRouter = Router()

arrivalCatalogRouter.post('/getarrivalkatalog', requireAuth, async (req, res) => {
  const { origin_id } = req.body
  if (!origin_id) return res.status(400).json({ status: false, message: 'origin_id required' })

  const origin = await OriginModel.findById(origin_id)
  if (!origin) return res.status(404).json({ status: false, message: 'origin not found' })

  const arrivals = await ArrivalModel.find({ _id: { $in: origin.arrival_ids } }).sort({ timestamp: 1 })

  const lines = arrivals.map((arrival) => `${arrival.station_id},${arrival.phase_type},${arrival.timestamp.toISOString()}`)
  const content = lines.join('\n')
  const file = Buffer.from(content).toString('base64')

  return res.json({ data: { file } })
})
