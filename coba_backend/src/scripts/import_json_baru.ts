import fs from 'fs'
import path from 'path'
import 'dotenv/config'
import { connectMongo } from '../config/mongo'
import { ArrivalModel } from '../models/Arrival'
import { EventModel } from '../models/Event'
import { OriginModel } from '../models/Origin'
import { PickModel } from '../models/Pick'
import { logger } from '../config/logger'

const DATA_DIR = path.join(process.cwd(), 'jsonBaru')

const readJson = (filename: string) => {
  const filePath = path.join(DATA_DIR, filename)
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw)
}

const unwrap = (value: any): any => {
  if (!value || typeof value !== 'object') return value

  if ('$oid' in value) return String(value.$oid)
  if ('$date' in value) return new Date(value.$date)

  if (Array.isArray(value)) {
    return value.map(unwrap)
  }

  const result: any = {}
  for (const key in value) {
    result[key] = unwrap(value[key])
  }
  return result
}

const main = async () => {
  await connectMongo()

  const eventsRaw = readJson('filtered_sispro-tews.event.json')
  const originsRaw = readJson('filtered_sispro-tews.origin.json')
  const arrivalsRaw = readJson('filtered_sispro-tews.arrival.json')
  const magnitudesRaw = readJson('filtered_sispro-tews.magnitude.json')

  const magnitudeMap = new Map<string, any>()
  for (const mag of magnitudesRaw) {
    const id = unwrap(mag._id)
    magnitudeMap.set(id, {
      _id: id,
      type: mag.type,
      value: mag.value,
      modified_by: mag.modified_by,
      created_at: unwrap(mag.created_at) ?? new Date(),
      modified_at: unwrap(mag.modified_at) ?? null
    })
  }

  for (const arrival of arrivalsRaw) {
    const pickId = unwrap(arrival.pick_source_id)
    const stationId = typeof arrival.station_id === 'string' ? arrival.station_id : unwrap(arrival.station_id)
    const timestamp = unwrap(arrival.timestamp)
    if (!pickId || !stationId || !timestamp) continue
    const existing = await PickModel.findById(pickId)
    if (!existing) {
      await PickModel.create({ _id: pickId, station_id: stationId, timestamp })
    }
  }

  for (const arrival of arrivalsRaw) {
    const id = unwrap(arrival._id)
    const pickId = unwrap(arrival.pick_source_id)
    const stationId = typeof arrival.station_id === 'string' ? arrival.station_id : unwrap(arrival.station_id)
    const timestamp = unwrap(arrival.timestamp)
    const phaseType = arrival.phase_type
    if (!id || !pickId || !stationId || !timestamp || !phaseType) continue
    await ArrivalModel.findByIdAndUpdate(
      id,
      {
        _id: id,
        pick_source_id: pickId,
        station_id: stationId,
        timestamp,
        phase_type: phaseType
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  }

  for (const origin of originsRaw) {
    const id = unwrap(origin._id)
    if (!id) continue
    const arrivalIds = (origin.arrival_ids ?? []).map(unwrap).filter(Boolean)
    const magnitudeIds = (origin.magnitude_ids ?? []).map(unwrap).filter(Boolean)
    const magnitudes = magnitudeIds.map((mid: string) => magnitudeMap.get(mid)).filter(Boolean)

    await OriginModel.findByIdAndUpdate(
      id,
      {
        _id: id,
        name: origin.name,
        origin_time: unwrap(origin.origin_time),
        arrival_ids: arrivalIds,
        longitude: origin.longitude,
        latitude: origin.latitude,
        depth: origin.depth,
        region: origin.region,
        sub_region: origin.sub_region,
        terrain: origin.terrain,
        country: origin.country,
        magnitude_ids: magnitudeIds,
        station_magnitude_ids_per_type: unwrap(origin.station_magnitude_ids_per_type) ?? [],
        magnitudes,
        err_epicenter: origin.err_epicenter,
        gap: origin.gap,
        rms: origin.rms
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  }

  for (const event of eventsRaw) {
    const id = unwrap(event._id)
    if (!id) continue
    const originIds = (event.origin_ids ?? []).map(unwrap).filter(Boolean)
    await EventModel.findByIdAndUpdate(
      id,
      {
        _id: id,
        name: event.name,
        origin_ids: originIds,
        preferred_origin_id: unwrap(event.preferred_origin_id) ?? originIds[0],
        created_at: unwrap(event.created_at) ?? new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  }

  logger.info('import finished')
  process.exit(0)
}

main().catch((err) => {
  logger.error({ err }, 'import failed')
  process.exit(1)
})
