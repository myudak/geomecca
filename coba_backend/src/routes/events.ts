import { Router } from 'express'
import { EventModel } from '../models/Event'
import { OriginModel } from '../models/Origin'
import { ArrivalModel } from '../models/Arrival'
import { requireAuth } from '../middleware/auth'

const parseDate = (value: unknown, fallback?: Date) => {
  if (!value) return fallback
  const date = new Date(value as string)
  return Number.isNaN(date.getTime()) ? fallback : date
}

const mapEventResponse = async (event: any) => {
  const preferredId = event.preferred_origin_id ?? event.origin_ids?.[0]
  const preferredOrigin = preferredId ? await OriginModel.findById(preferredId) : null
  const defaultOrigin =
    preferredOrigin ??
    ({
      _id: '',
      name: event.name,
      origin_time: event.createdAt,
      arrival_ids: [],
      longitude: 0,
      latitude: 0,
      depth: 0,
      region: '',
      sub_region: '',
      terrain: '',
      country: '',
      magnitude_ids: [],
      station_magnitude_ids_per_type: [],
      magnitudes: [],
      err_epicenter: 0,
      gap: 0,
      rms: 0,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    } as any)
  return {
    _id: event.id,
    name: event.name,
    origin_ids: event.origin_ids,
    preferred_origin_id: preferredId,
    origins: defaultOrigin,
    created_at: event.createdAt
  }
}

export const eventsRouter = Router()

eventsRouter.get('/getall', requireAuth, async (req, res) => {
  const page = Number(req.query.page ?? 1)
  const limit = Number(req.query.total_per_page ?? 10)
  const start = parseDate(req.query.start_date)
  const end = parseDate(req.query.end_date)

  const filter: Record<string, any> = {}
  if (start || end) filter.createdAt = { ...(start ? { $gte: start } : {}), ...(end ? { $lte: end } : {}) }

  const [events, total] = await Promise.all([
    EventModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    EventModel.countDocuments(filter)
  ])

  const data = await Promise.all(events.map(mapEventResponse))
  return res.json({ data, total })
})

eventsRouter.get('/getbybetweendate', requireAuth, async (req, res) => {
  const start = parseDate(req.query.start_date)
  const end = parseDate(req.query.end_date)
  const filter: Record<string, any> = {}
  if (start || end) filter.createdAt = { ...(start ? { $gte: start } : {}), ...(end ? { $lte: end } : {}) }

  const events = await EventModel.find(filter).sort({ createdAt: -1 })
  const data = await Promise.all(events.map(mapEventResponse))
  return res.json({ data })
})

eventsRouter.get('/getdetail', requireAuth, async (req, res) => {
  const eventId = req.query.event_id as string | undefined
  if (!eventId) return res.status(400).json({ status: false, message: 'event_id required' })

  const event = await EventModel.findById(eventId)
  if (!event) return res.status(404).json({ status: false, message: 'event not found' })

  const origins = await OriginModel.find({ _id: { $in: event.origin_ids } })
  return res.json({ data: { _id: event.id, name: event.name, origin_ids: event.origin_ids, preferred_origin_id: event.preferred_origin_id, origins, created_at: event.createdAt } })
})

eventsRouter.put('/commit', requireAuth, async (req, res) => {
  const { origin_id, event_id, arrival_list } = req.body
  if (!origin_id || !event_id) return res.status(400).json({ status: false, message: 'origin_id and event_id required' })

  const event = await EventModel.findByIdAndUpdate(event_id, { preferred_origin_id: origin_id }, { new: true })
  if (!event) return res.status(404).json({ status: false, message: 'event not found' })

  if (Array.isArray(arrival_list) && arrival_list.length) {
    const arrivalIds: string[] = []
    for (const arrival of arrival_list) {
      if (arrival._id) {
        arrivalIds.push(arrival._id)
        continue
      }
      const created = await ArrivalModel.create({
        pick_source_id: arrival.pick_source_id,
        station_id: arrival.station_id,
        timestamp: arrival.timestamp,
        phase_type: arrival.phase_type
      })
      arrivalIds.push(created.id)
    }
    await OriginModel.findByIdAndUpdate(origin_id, { arrival_ids: arrivalIds }, { new: true })
  }

  return res.json({ status: true, data: { _id: event.id } })
})

eventsRouter.post('/', requireAuth, async (req, res) => {
  const { name, origin } = req.body
  if (!name) return res.status(400).json({ status: false, message: 'name required' })

  let originId: string | undefined
  if (origin) {
    const createdOrigin = await OriginModel.create(origin)
    originId = createdOrigin.id
  }

  const event = await EventModel.create({ name, origin_ids: originId ? [originId] : [] })
  if (originId) {
    event.preferred_origin_id = originId
    await event.save()
  }

  return res.status(201).json({ status: true, data: await mapEventResponse(event) })
})
