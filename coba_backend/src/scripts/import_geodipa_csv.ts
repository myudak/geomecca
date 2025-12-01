import fs from 'fs'
import path from 'path'
import 'dotenv/config'
import { connectMongo } from '../config/mongo'
import { ArrivalModel } from '../models/Arrival'
import { EventModel } from '../models/Event'
import { OriginModel } from '../models/Origin'
import { PickModel } from '../models/Pick'
import { logger } from '../config/logger'

const CSV_PATH = path.join(process.cwd(), 'original_Dataset', 'geodipa_buat_mas_rasyid.csv')

interface CSVRow {
  index: string
  EventID: string
  OriginTime: string
  Station: string
  P: string
  S: string
  Latitude: string
  Longitude: string
  Depth: string
}

const parseCSV = (content: string): CSVRow[] => {
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

const main = async () => {
  await connectMongo()

  // Read and parse CSV
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8')
  const records = parseCSV(csvContent)

  logger.info(`Read ${records.length} records from CSV`)

  // Group by EventID
  const eventGroups = new Map<string, CSVRow[]>()
  for (const record of records) {
    if (!eventGroups.has(record.EventID)) {
      eventGroups.set(record.EventID, [])
    }
    eventGroups.get(record.EventID)!.push(record)
  }

  logger.info(`Found ${eventGroups.size} unique events`)

  let eventCount = 0
  let originCount = 0
  let arrivalCount = 0
  let pickCount = 0

  for (const [eventId, rows] of eventGroups) {
    // Use first row for origin data
    const firstRow = rows[0]

    // Skip if missing critical data
    if (!firstRow.OriginTime || !firstRow.Latitude || !firstRow.Longitude || !firstRow.Depth) {
      logger.warn(`Skipping event ${eventId} - missing origin data`)
      continue
    }

    const originTime = new Date(firstRow.OriginTime)
    const latitude = parseFloat(firstRow.Latitude)
    const longitude = parseFloat(firstRow.Longitude)
    const depth = parseFloat(firstRow.Depth)

    // Skip invalid coordinates
    if (isNaN(latitude) || isNaN(longitude) || isNaN(depth)) {
      logger.warn(`Skipping event ${eventId} - invalid coordinates`)
      continue
    }

    // Create arrivals and picks
    const arrivalIds: string[] = []

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
            pick_source_id: pPick._id,
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
            pick_source_id: sPick._id,
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
      logger.warn(`Skipping event ${eventId} - no valid arrivals`)
      continue
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
      magnitude_ids: [],
      station_magnitude_ids_per_type: [],
      magnitudes: []
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
      logger.info(`Progress: ${eventCount}/${eventGroups.size} events imported`)
    }
  }

  logger.info('Import complete!')
  logger.info(`  Events: ${eventCount}`)
  logger.info(`  Origins: ${originCount}`)
  logger.info(`  Arrivals: ${arrivalCount}`)
  logger.info(`  Picks: ${pickCount}`)

  process.exit(0)
}

main().catch((err) => {
  logger.error({ err }, 'import failed')
  process.exit(1)
})
