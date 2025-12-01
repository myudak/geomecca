import { Router } from 'express'
import { OriginModel } from '../models/Origin'
import { requireAuth } from '../middleware/auth'
import { format } from 'date-fns'

export const dashboardRouter = Router()

// Calculate b-value from magnitudes (reusing logic from magnitude route)
const calculateBValue = (magnitudes: number[]): number => {
  if (magnitudes.length === 0) return 0

  const sortedMags = [...magnitudes].sort((a, b) => a - b)
  const uniqueMags = [...new Set(sortedMags.map(m => Math.round(m * 10) / 10))]

  const magnitudeData = uniqueMags.map(mag => {
    const count = sortedMags.filter(m => m >= mag).length
    return {
      magnitude: mag,
      cumulativeCount: count,
      logCount: count > 0 ? Math.log10(count) : 0
    }
  }).filter(d => d.cumulativeCount > 0)

  if (magnitudeData.length < 2) return 0

  const n = magnitudeData.length
  const sumM = magnitudeData.reduce((sum, d) => sum + d.magnitude, 0)
  const sumLogN = magnitudeData.reduce((sum, d) => sum + d.logCount, 0)
  const sumM2 = magnitudeData.reduce((sum, d) => sum + d.magnitude * d.magnitude, 0)
  const sumMLogN = magnitudeData.reduce((sum, d) => sum + d.magnitude * d.logCount, 0)

  const slope = (n * sumMLogN - sumM * sumLogN) / (n * sumM2 - sumM * sumM)
  const bValue = -slope

  return bValue
}

// Get latest event
dashboardRouter.get('/latest-event', requireAuth, async (req, res) => {
  try {
    const latestOrigin = await OriginModel.findOne()
      .sort({ origin_time: -1 })
      .limit(1)

    if (!latestOrigin) {
      return res.json({
        data: {
          time: 'N/A',
          magnitude: 'N/A',
          location: 'No data',
          depth: 'N/A'
        }
      })
    }

    // Extract magnitude value
    let magnitudeValue = 0
    if (latestOrigin.magnitudes && Array.isArray(latestOrigin.magnitudes) && latestOrigin.magnitudes.length > 0) {
      const mag: any = latestOrigin.magnitudes[0]
      magnitudeValue = mag.value || 0
    }

    // Format time
    const timeStr = format(new Date(latestOrigin.origin_time), 'HH:mm')

    return res.json({
      data: {
        time: timeStr,
        magnitude: `M${magnitudeValue.toFixed(1)}`,
        location: latestOrigin.region || latestOrigin.sub_region || 'Unknown',
        depth: `Depth ${latestOrigin.depth.toFixed(0)} km`
      }
    })
  } catch (error) {
    console.error('[Dashboard] Error fetching latest event:', error)
    return res.status(500).json({ status: false, message: 'Failed to fetch latest event' })
  }
})

// Get global b-value (calculated from last 30 days OR latest events if 30 days is empty)
dashboardRouter.get('/global-bvalue', requireAuth, async (req, res) => {
  try {
    // Get origins from last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    let origins = await OriginModel.find({
      origin_time: { $gte: thirtyDaysAgo }
    })

    // Extract magnitude values from last 30 days
    let magnitudes: number[] = []
    origins.forEach(origin => {
      if (origin.magnitudes && Array.isArray(origin.magnitudes)) {
        origin.magnitudes.forEach((mag: any) => {
          if (typeof mag.value === 'number' && !isNaN(mag.value)) {
            magnitudes.push(mag.value)
          }
        })
      }
    })

    // If no magnitudes found in last 30 days, get latest 100 events
    if (magnitudes.length === 0) {
      console.log('[Dashboard] No events in last 30 days, using latest 100 events')
      origins = await OriginModel.find()
        .sort({ origin_time: -1 })
        .limit(100)

      magnitudes = []
      origins.forEach(origin => {
        if (origin.magnitudes && Array.isArray(origin.magnitudes)) {
          origin.magnitudes.forEach((mag: any) => {
            if (typeof mag.value === 'number' && !isNaN(mag.value)) {
              magnitudes.push(mag.value)
            }
          })
        }
      })
    }

    const bValue = calculateBValue(magnitudes)

    console.log(`[Dashboard] Calculated global b-value: ${bValue.toFixed(2)} from ${magnitudes.length} magnitudes (${origins.length} origins)`)

    return res.json({
      data: {
        b_value: bValue,
        total_events: magnitudes.length
      }
    })
  } catch (error) {
    console.error('[Dashboard] Error calculating global b-value:', error)
    return res.status(500).json({ status: false, message: 'Failed to calculate b-value' })
  }
})
