import fs from 'fs'
import path from 'path'
import 'dotenv/config'
import mongoose from 'mongoose'
import ExcelJS from 'exceljs'

const CSV_PATH = path.join(process.cwd(), 'original_Dataset', 'geodipa_buat_mas_rasyid.csv')
const EXCEL_PATH = path.join(process.cwd(), 'original_Dataset', 'Patuha_Dataset.xlsx')
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tews'

// Mongoose schemas
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

const magnitudeSchema = new mongoose.Schema({
  type: String,
  value: Number,
  modified_by: String,
  created_at: { type: Date, default: Date.now },
  modified_at: Date
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
const MagnitudeModel = mongoose.model('Magnitude', magnitudeSchema)
const OriginModel = mongoose.model('Origin', originSchema)
const EventModel = mongoose.model('Event', eventSchema)

const parseCSV = (content) => {
  const lines = content.split('\n').filter(line => line.trim())
  const headers = lines[0].split(',')

  return lines.slice(1).map(line => {
    const values = line.split(',')
    return {
      index: values[0] || '',
      EventID: values[1] || '',
      OriginTime: values[2] || '',
      Station: values[3] || '',
      P: values[4] || '',
      S: values[5] || '',
      Latitude: values[6] || '',
      Longitude: values[7] || '',
      Depth: values[8] || ''
    }
  })
}

const loadMagnitudeData = async () => {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(EXCEL_PATH)
  const worksheet = workbook.getWorksheet(1)

  const magnitudes = {}
  let isFirstRow = true

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= 1) return // Skip header

    const filePick = row.getCell(2).text
    if (!filePick || filePick === 'File Pick') return

    // Extract base event ID (remove .pick and version number)
    const eventId = filePick.replace(/\.pick$/, '').replace(/\.\d+$/, '')

    // Get magnitude values (prefer SNR 0.5, fallback to 0.3, then 0.1)
    const mag05 = row.getCell(19).value // Mag > SNR 0.5
    const mag03 = row.getCell(21).value // Mag >SNR 0.3
    const mag01 = row.getCell(23).value // Mag >SNR 0.1

    let magnitude = null
    let magType = null

    if (mag05 && typeof mag05 === 'number' && !isNaN(mag05)) {
      magnitude = mag05
      magType = 'Mw' // Moment magnitude (for frontend compatibility)
    } else if (mag03 && typeof mag03 === 'number' && !isNaN(mag03)) {
      magnitude = mag03
      magType = 'Mw'
    } else if (mag01 && typeof mag01 === 'number' && !isNaN(mag01)) {
      magnitude = mag01
      magType = 'Mw'
    }

    if (magnitude !== null) {
      // Store the best magnitude we've seen for this event
      if (!magnitudes[eventId] || Math.abs(magnitude) > Math.abs(magnitudes[eventId].value)) {
        magnitudes[eventId] = { value: magnitude, type: magType }
      }
    }
  })

  console.log(`Loaded ${Object.keys(magnitudes).length} magnitudes from Excel`)
  return magnitudes
}

const main = async () => {
  await mongoose.connect(mongoUri)
  console.log('Connected to MongoDB')

  // Load magnitude data from Excel
  const magnitudes = await loadMagnitudeData()

  // Read and parse CSV
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8')
  const records = parseCSV(csvContent)

  console.log(`Read ${records.length} records from CSV`)

  // Group by EventID
  const eventGroups = new Map()
  for (const record of records) {
    if (!eventGroups.has(record.EventID)) {
      eventGroups.set(record.EventID, [])
    }
    eventGroups.get(record.EventID).push(record)
  }

  console.log(`Found ${eventGroups.size} unique events`)

  let eventCount = 0
  let originCount = 0
  let arrivalCount = 0
  let pickCount = 0
  let magnitudeCount = 0

  for (const [eventId, rows] of eventGroups) {
    // Use first row for origin data
    const firstRow = rows[0]

    // Skip if missing critical data
    if (!firstRow.OriginTime || !firstRow.Latitude || !firstRow.Longitude || !firstRow.Depth) {
      console.warn(`Skipping event ${eventId} - missing origin data`)
      continue
    }

    const originTime = new Date(firstRow.OriginTime)

    // Skip invalid origin time
    if (isNaN(originTime.getTime())) {
      console.warn(`Skipping event ${eventId} - invalid origin time: ${firstRow.OriginTime}`)
      continue
    }

    const latitude = parseFloat(firstRow.Latitude)
    const longitude = parseFloat(firstRow.Longitude)
    const depth = parseFloat(firstRow.Depth)

    // Skip invalid coordinates
    if (isNaN(latitude) || isNaN(longitude) || isNaN(depth)) {
      console.warn(`Skipping event ${eventId} - invalid coordinates`)
      continue
    }

    // Create arrivals and picks
    const arrivalIds = []

    for (const row of rows) {
      const station = row.Station
      const pTime = row.P
      const sTime = row.S

      if (!station) continue

      // Create P-wave pick and arrival
      if (pTime && pTime.trim()) {
        const pTimestamp = new Date(pTime)
        if (!isNaN(pTimestamp.getTime())) {
          const pPick = await PickModel.create({
            station_id: station,
            timestamp: pTimestamp
          })
          pickCount++

          const pArrival = await ArrivalModel.create({
            pick_source_id: pPick._id.toString(),
            station_id: station,
            timestamp: pTimestamp,
            phase_type: 'P'
          })
          arrivalIds.push(pArrival._id.toString())
          arrivalCount++
        }
      }

      // Create S-wave pick and arrival
      if (sTime && sTime.trim()) {
        const sTimestamp = new Date(sTime)
        if (!isNaN(sTimestamp.getTime())) {
          const sPick = await PickModel.create({
            station_id: station,
            timestamp: sTimestamp
          })
          pickCount++

          const sArrival = await ArrivalModel.create({
            pick_source_id: sPick._id.toString(),
            station_id: station,
            timestamp: sTimestamp,
            phase_type: 'S'
          })
          arrivalIds.push(sArrival._id.toString())
          arrivalCount++
        }
      }
    }

    if (arrivalIds.length === 0) {
      console.warn(`Skipping event ${eventId} - no valid arrivals`)
      continue
    }

    // Create magnitude if available
    const magnitudeIds = []
    const magnitudesArray = []

    if (magnitudes[eventId]) {
      const magData = magnitudes[eventId]
      const magnitude = await MagnitudeModel.create({
        type: magData.type,
        value: magData.value,
        modified_by: null,
        created_at: originTime
      })
      magnitudeIds.push(magnitude._id.toString())
      magnitudesArray.push({
        type: magData.type,
        value: magData.value
      })
      magnitudeCount++
    }

    // Create origin
    const origin = await OriginModel.create({
      name: `Origin ${eventId}`,
      origin_time: originTime,
      arrival_ids: arrivalIds,
      longitude,
      latitude,
      depth,
      region: 'West Java',
      sub_region: 'Patuha',
      country: 'Indonesia',
      magnitude_ids: magnitudeIds,
      station_magnitude_ids_per_type: [],
      magnitudes: magnitudesArray
    })
    originCount++

    // Create event
    await EventModel.create({
      name: `Event ${eventId}`,
      origin_ids: [origin._id.toString()],
      preferred_origin_id: origin._id.toString(),
      created_at: originTime
    })
    eventCount++

    if (eventCount % 10 === 0) {
      console.log(`Progress: ${eventCount}/${eventGroups.size} events imported`)
    }
  }

  console.log('Import complete!')
  console.log(`  Events: ${eventCount}`)
  console.log(`  Origins: ${originCount}`)
  console.log(`  Arrivals: ${arrivalCount}`)
  console.log(`  Picks: ${pickCount}`)
  console.log(`  Magnitudes: ${magnitudeCount}`)

  process.exit(0)
}

main().catch((err) => {
  console.error('Import failed:', err)
  process.exit(1)
})
