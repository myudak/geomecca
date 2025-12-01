import fs from 'fs'
import path from 'path'
import 'dotenv/config'
import mongoose from 'mongoose'

const PICK_DIR = path.join(process.cwd(), 'original_Dataset', 'New_file pick')
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tews'

// Schemas (duplicated minimal models for script usage)
const pickSchema = new mongoose.Schema({
  station_id: String,
  timestamp: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const arrivalSchema = new mongoose.Schema({
  pick_source_id: String,
  station_id: String,
  timestamp: Date,
  phase_type: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const originSchema = new mongoose.Schema({
  name: String,
  origin_time: Date,
  arrival_ids: [String],
  longitude: Number,
  latitude: Number,
  depth: Number,
  region: String,
  sub_region: String,
  country: String,
  magnitude_ids: [String],
  station_magnitude_ids_per_type: [mongoose.Schema.Types.Mixed],
  magnitudes: [mongoose.Schema.Types.Mixed],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const eventSchema = new mongoose.Schema({
  name: String,
  origin_ids: [String],
  preferred_origin_id: String,
  created_at: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const PickModel = mongoose.model('Pick', pickSchema)
const ArrivalModel = mongoose.model('Arrival', arrivalSchema)
const OriginModel = mongoose.model('Origin', originSchema)
const EventModel = mongoose.model('Event', eventSchema)

const parseFileTime = (fileName) => {
  const base = fileName.replace(/\.pick$/i, '')
  const [dateStr, timeStr] = base.split('_')
  if (!dateStr || !timeStr || dateStr.length !== 8) return null

  const year = Number(dateStr.slice(0, 4))
  const month = Number(dateStr.slice(4, 6))
  const day = Number(dateStr.slice(6, 8))

  const hh = Number(timeStr.slice(0, 2))
  const mm = Number(timeStr.slice(2, 4))
  const secStr = timeStr.slice(4) || '0'
  const secFloat = Number(secStr)
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day) || Number.isNaN(hh) || Number.isNaN(mm) || Number.isNaN(secFloat)) {
    return null
  }

  const sInt = Math.trunc(secFloat)
  const ms = Math.round((secFloat - sInt) * 1000)

  return new Date(Date.UTC(year, month - 1, day, hh, mm, sInt, ms))
}

const parsePickLine = (line) => {
  const parts = line.trim().split(/\s+/)
  if (parts.length < 9) return null

  const station = parts[0]
  const channel = parts[2]
  const phaseType = parts[4]
  const dateStr = parts[6]
  const timeStr = parts[7]
  const secStr = parts[8]

  if (!station || !channel || !dateStr || !timeStr || !secStr) return null

  const year = Number(dateStr.slice(0, 4))
  const month = Number(dateStr.slice(4, 6))
  const day = Number(dateStr.slice(6, 8))

  const hh = Number(timeStr.slice(0, 2))
  const mm = Number(timeStr.slice(2, 4))
  const secFloat = Number(secStr)

  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day) || Number.isNaN(hh) || Number.isNaN(mm) || Number.isNaN(secFloat)) {
    return null
  }

  const sInt = Math.trunc(secFloat)
  const ms = Math.round((secFloat - sInt) * 1000)
  const timestamp = new Date(Date.UTC(year, month - 1, day, hh, mm, sInt, ms))

  const phase = phaseType === 'S' ? 'S' : 'P'

  return { station_id: station, channel, phase_type: phase, timestamp }
}

const findClosestOrigin = async (targetTime, toleranceMs = 60_000) => {
  const start = new Date(targetTime.getTime() - toleranceMs)
  const end = new Date(targetTime.getTime() + toleranceMs)

  const candidates = await OriginModel.find({
    origin_time: { $gte: start, $lte: end }
  })

  if (!candidates.length) return null

  let best = candidates[0]
  let bestDiff = Math.abs(candidates[0].origin_time.getTime() - targetTime.getTime())

  for (const origin of candidates.slice(1)) {
    const diff = Math.abs(origin.origin_time.getTime() - targetTime.getTime())
    if (diff < bestDiff) {
      best = origin
      bestDiff = diff
    }
  }

  return best
}

const importPickFile = async (fileName) => {
  const fileTime = parseFileTime(fileName)
  if (!fileTime) {
    console.warn(`[import-picks] Skip ${fileName} - unable to parse time from filename`)
    return
  }

  const origin = await findClosestOrigin(fileTime)
  if (!origin) {
    console.warn(
      `[import-picks] No origin found within tolerance for ${fileName} (time=${fileTime.toISOString()})`
    )
    return
  }

  const event = await EventModel.findOne({ origin_ids: { $in: [origin._id.toString()] } })
  console.log(
    `[import-picks] Importing ${fileName} -> origin=${origin._id.toString()} (event=${event?._id?.toString() ?? 'unknown'})`
  )

  // Remove existing arrivals for this origin (replace behaviour)
  if (origin.arrival_ids && origin.arrival_ids.length) {
    await ArrivalModel.deleteMany({ _id: { $in: origin.arrival_ids } })
  }

  const filePath = path.join(PICK_DIR, fileName)
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0)

  const arrivalIds = []

  for (const line of lines) {
    const parsed = parsePickLine(line)
    if (!parsed) {
      console.warn(`[import-picks] Skipping malformed line in ${fileName}: ${line}`)
      continue
    }

    const pick = await PickModel.create({
      station_id: parsed.station_id,
      timestamp: parsed.timestamp
    })

    const arrival = await ArrivalModel.create({
      pick_source_id: pick._id.toString(),
      station_id: parsed.station_id,
      timestamp: parsed.timestamp,
      phase_type: parsed.phase_type
    })

    arrivalIds.push(arrival._id.toString())
  }

  origin.arrival_ids = arrivalIds
  await origin.save()

  console.log(
    `[import-picks] Imported ${arrivalIds.length} arrivals from ${fileName} into origin ${origin._id.toString()}`
  )
}

const main = async () => {
  await mongoose.connect(mongoUri)
  console.log('[import-picks] Connected to MongoDB')

  if (!fs.existsSync(PICK_DIR)) {
    console.error(`[import-picks] Pick directory not found: ${PICK_DIR}`)
    process.exit(1)
  }

  const files = fs.readdirSync(PICK_DIR).filter((f) => f.toLowerCase().endsWith('.pick'))
  console.log(`[import-picks] Found ${files.length} .pick files`)

  for (const file of files) {
    // eslint-disable-next-line no-await-in-loop
    await importPickFile(file)
  }

  console.log('[import-picks] Done')
  process.exit(0)
}

main().catch((err) => {
  console.error('[import-picks] Failed:', err)
  process.exit(1)
})

