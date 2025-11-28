import fs from 'fs'
import path from 'path'
import 'dotenv/config'
import mongoose from 'mongoose'

const DATA_DIR = path.join(process.cwd(), 'jsonBaru')
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tews'

const readJson = (filename) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, filename), 'utf-8'))
const unwrap = (value) => {
  if (value && typeof value === 'object') {
    if ('$oid' in value) return String(value.$oid)
    if ('$date' in value) return new Date(value.$date)
  }
  return value
}

const pickSchema = new mongoose.Schema({
  _id: String,
  station_id: String,
  timestamp: Date
})
const arrivalSchema = new mongoose.Schema({
  _id: String,
  pick_source_id: String,
  station_id: String,
  timestamp: Date,
  phase_type: String
})
const originSchema = new mongoose.Schema({
  _id: String,
  name: String,
  origin_time: Date,
  arrival_ids: [String],
  longitude: Number,
  latitude: Number,
  depth: Number,
  region: String,
  sub_region: String,
  terrain: String,
  country: String,
  magnitude_ids: [String],
  station_magnitude_ids_per_type: Array,
  magnitudes: Array,
  err_epicenter: Number,
  gap: Number,
  rms: Number
})
const eventSchema = new mongoose.Schema({
  _id: String,
  name: String,
  origin_ids: [String],
  preferred_origin_id: String,
  created_at: Date
})

const Pick = mongoose.model('Pick', pickSchema)
const Arrival = mongoose.model('Arrival', arrivalSchema)
const Origin = mongoose.model('Origin', originSchema)
const Event = mongoose.model('Event', eventSchema)

const main = async () => {
  await mongoose.connect(mongoUri)
  console.log('connected mongo for import', mongoUri)

  const eventsRaw = readJson('filtered_sispro-tews.event.json')
  const originsRaw = readJson('filtered_sispro-tews.origin.json')
  const arrivalsRaw = readJson('filtered_sispro-tews.arrival.json')
  const magnitudesRaw = readJson('filtered_sispro-tews.magnitude.json')

  const magnitudeMap = new Map()
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
    const stationId = unwrap(arrival.station_id)
    const timestamp = unwrap(arrival.timestamp)
    if (!pickId || !stationId || !timestamp) continue
    await Pick.updateOne({ _id: pickId }, { _id: pickId, station_id: stationId, timestamp }, { upsert: true })
  }

  for (const arrival of arrivalsRaw) {
    const id = unwrap(arrival._id)
    const pickId = unwrap(arrival.pick_source_id)
    const stationId = unwrap(arrival.station_id)
    const timestamp = unwrap(arrival.timestamp)
    const phaseType = arrival.phase_type
    if (!id || !pickId || !stationId || !timestamp || !phaseType) continue
    await Arrival.updateOne(
      { _id: id },
      { _id: id, pick_source_id: pickId, station_id: stationId, timestamp, phase_type: phaseType },
      { upsert: true }
    )
  }

  for (const origin of originsRaw) {
    const id = unwrap(origin._id)
    if (!id) continue
    const arrivalIds = (origin.arrival_ids ?? []).map(unwrap).filter(Boolean)
    const magnitudeIds = (origin.magnitude_ids ?? []).map(unwrap).filter(Boolean)
    const magnitudes = magnitudeIds.map((mid) => magnitudeMap.get(mid)).filter(Boolean)

    await Origin.updateOne(
      { _id: id },
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
        station_magnitude_ids_per_type: origin.station_magnitude_ids_per_type ?? [],
        magnitudes,
        err_epicenter: origin.err_epicenter,
        gap: origin.gap,
        rms: origin.rms
      },
      { upsert: true }
    )
  }

  for (const event of eventsRaw) {
    const id = unwrap(event._id)
    if (!id) continue
    const originIds = (event.origin_ids ?? []).map(unwrap).filter(Boolean)
    const createdAt = unwrap(event.created_at) || unwrap(event.createdAt) || new Date()
    await Event.updateOne(
      { _id: id },
      {
        _id: id,
        name: event.name,
        origin_ids: originIds,
        preferred_origin_id: unwrap(event.preferred_origin_id) ?? originIds[0],
        created_at: createdAt,
        createdAt
      },
      { upsert: true }
    )
  }

  console.log('import finished')
  await mongoose.disconnect()
  process.exit(0)
}

main().catch((err) => {
  console.error('import failed', err)
  process.exit(1)
})
