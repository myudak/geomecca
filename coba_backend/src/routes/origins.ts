import { Router } from 'express'
import { OriginModel } from '../models/Origin'
import { requireAuth } from '../middleware/auth'

const haversineDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export const originsRouter = Router()

originsRouter.get('/getdetail', requireAuth, async (req, res) => {
  const originId = req.query.origin_id as string | undefined
  if (!originId) return res.status(400).json({ status: false, message: 'origin_id required' })

  const origin = await OriginModel.findById(originId)
  if (!origin) return res.status(404).json({ status: false, message: 'origin not found' })

  return res.json({ data: [origin] })
})

originsRouter.post('/psteoritical', requireAuth, async (req, res) => {
  const { eq_origin_time, eq_lat, eq_lon, eq_depth, sta_lat, sta_lon } = req.body
  if ([eq_origin_time, eq_lat, eq_lon, eq_depth, sta_lat, sta_lon].some((v) => v === undefined)) {
    return res.status(400).json({ status: false, message: 'eq_origin_time, eq_lat, eq_lon, eq_depth, sta_lat, sta_lon required' })
  }

  const distance = haversineDistanceKm(eq_lat, eq_lon, sta_lat, sta_lon)
  const pSpeed = 6
  const sSpeed = 3.5
  const pSeconds = distance / pSpeed
  const sSeconds = distance / sSpeed

  const originTime = new Date(eq_origin_time)
  const arrival = {
    P: new Date(originTime.getTime() + pSeconds * 1000).toISOString(),
    S: new Date(originTime.getTime() + sSeconds * 1000).toISOString()
  }

  return res.json({ data: { arrival } })
})
