import { Router } from 'express'
import { OriginModel } from '../models/Origin'
import { ArrivalModel } from '../models/Arrival'
import { requireAuth } from '../middleware/auth'
import sharp from 'sharp'

export const wadatiRouter = Router()

// Generate a PNG Wadati plot from SVG
const generateWadatiPlot = async (arrivals: any[], originTime: Date): Promise<{ image: string; vpVsRatio: number | null; pairs: number }> => {
  const width = 600
  const height = 500
  const padding = 60

  // Group arrivals by station to find P-S pairs
  const data = arrivals
    .filter((a) => a.phase_type === 'P' || a.phase_type === 'S')
    .reduce((acc: any, arrival) => {
      const stationId = arrival.station_id
      if (!acc[stationId]) acc[stationId] = {}
      acc[stationId][arrival.phase_type] = arrival.timestamp
      return acc
    }, {})

  console.log('[Wadati] Grouped data by station:', Object.keys(data).map(k => `${k}: P=${!!data[k].P} S=${!!data[k].S}`))

  // Extract P-S pairs and calculate travel times (relative to origin time)
  const originTimeSec = originTime.getTime() / 1000
  const pairsBeforeFilter = Object.entries(data)
    .filter(([, times]: [string, any]) => times.P && times.S)
    .map(([station, times]: [string, any]) => {
      const pTime = (new Date(times.P).getTime() / 1000) - originTimeSec  // Relative time
      const sTime = (new Date(times.S).getTime() / 1000) - originTimeSec  // Relative time
      const diff = sTime - pTime
      console.log(`[Wadati] Station ${station}: P_rel=${pTime.toFixed(2)}s, S_rel=${sTime.toFixed(2)}s, diff=${diff.toFixed(2)}s`)
      return {
        p: pTime,
        s: sTime,
        diff
      }
    })

  console.log(`[Wadati] Found ${pairsBeforeFilter.length} P-S pairs before filtering`)

  const pairs = pairsBeforeFilter.filter((pair) => pair.diff > 0 && pair.diff < 100) // Filter out invalid data

  console.log(`[Wadati] Found ${pairs.length} valid P-S pairs after filtering`)

  if (pairs.length === 0) {
    // Return empty plot if no data
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f8fafc"/>
        <text x="${width / 2}" y="${height / 2}" text-anchor="middle" font-size="16" fill="#64748b">
          No P-S pairs available for Wadati diagram
        </text>
      </svg>
    `
    // Convert SVG to PNG
    const pngBuffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer()

    return {
      image: pngBuffer.toString('base64'),
      vpVsRatio: null,
      pairs: 0
    }
  }

  // Calculate scales
  const pMin = Math.min(...pairs.map((p) => p.p))
  const pMax = Math.max(...pairs.map((p) => p.p))
  const sMin = Math.min(...pairs.map((p) => p.s))
  const sMax = Math.max(...pairs.map((p) => p.s))

  const xScale = (val: number) => padding + ((val - pMin) / (pMax - pMin)) * (width - 2 * padding)
  const yScale = (val: number) => height - padding - ((val - sMin) / (sMax - sMin)) * (height - 2 * padding)

  // Linear regression for Wadati line
  const n = pairs.length
  const sumP = pairs.reduce((sum, p) => sum + p.p, 0)
  const sumS = pairs.reduce((sum, p) => sum + p.s, 0)
  const sumPS = pairs.reduce((sum, p) => sum + p.p * p.s, 0)
  const sumP2 = pairs.reduce((sum, p) => sum + p.p * p.p, 0)

  const slope = (n * sumPS - sumP * sumS) / (n * sumP2 - sumP * sumP)
  const intercept = (sumS - slope * sumP) / n
  // For Wadati diagram: tS = slope * tP + intercept
  // The slope represents Vp/Vs ratio directly when using relative times
  const vpVsRatio = slope

  // Generate SVG
  const points = pairs.map((p) => `<circle cx="${xScale(p.p)}" cy="${yScale(p.s)}" r="4" fill="#3b82f6" opacity="0.7"/>`).join('\n')

  const lineX1 = xScale(pMin)
  const lineY1 = yScale(slope * pMin + intercept)
  const lineX2 = xScale(pMax)
  const lineY2 = yScale(slope * pMax + intercept)

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f8fafc"/>

      <!-- Axes -->
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#94a3b8" stroke-width="2"/>
      <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#94a3b8" stroke-width="2"/>

      <!-- Labels -->
      <text x="${width / 2}" y="${height - 20}" text-anchor="middle" font-size="14" fill="#475569">P-wave arrival time (s)</text>
      <text x="20" y="${height / 2}" text-anchor="middle" font-size="14" fill="#475569" transform="rotate(-90, 20, ${height / 2})">S-wave arrival time (s)</text>

      <!-- Title -->
      <text x="${width / 2}" y="30" text-anchor="middle" font-size="16" font-weight="bold" fill="#1e293b">Wadati Diagram</text>
      <text x="${width / 2}" y="50" text-anchor="middle" font-size="12" fill="#64748b">Vp/Vs ratio: ${vpVsRatio.toFixed(3)}</text>

      <!-- Regression line -->
      <line x1="${lineX1}" y1="${lineY1}" x2="${lineX2}" y2="${lineY2}" stroke="#ef4444" stroke-width="2" stroke-dasharray="5,5"/>

      <!-- Data points -->
      ${points}

      <!-- Tick marks and values -->
      <text x="${padding}" y="${height - padding + 20}" text-anchor="middle" font-size="10" fill="#64748b">${pMin.toFixed(1)}</text>
      <text x="${width - padding}" y="${height - padding + 20}" text-anchor="middle" font-size="10" fill="#64748b">${pMax.toFixed(1)}</text>
      <text x="${padding - 10}" y="${height - padding}" text-anchor="end" font-size="10" fill="#64748b">${sMin.toFixed(1)}</text>
      <text x="${padding - 10}" y="${padding}" text-anchor="end" font-size="10" fill="#64748b">${sMax.toFixed(1)}</text>
    </svg>
  `

  // Convert SVG to PNG
  const pngBuffer = await sharp(Buffer.from(svg))
    .png()
    .toBuffer()

  return {
    image: pngBuffer.toString('base64'),
    vpVsRatio,
    pairs: pairs.length
  }
}

wadatiRouter.post('/getplot', requireAuth, async (req, res) => {
  const { origin_id } = req.body
  if (!origin_id) return res.status(400).json({ status: false, message: 'origin_id required' })

  const origin = await OriginModel.findById(origin_id)
  if (!origin) return res.status(404).json({ status: false, message: 'origin not found' })

  const arrivals = await ArrivalModel.find({ _id: { $in: origin.arrival_ids } })

  console.log(`[Wadati] Origin ${origin_id} has ${arrivals.length} arrivals`)
  arrivals.forEach((a, i) => {
    console.log(`  [${i}] station=${a.station_id}, phase=${a.phase_type}, time=${a.timestamp}`)
  })

  const result = await generateWadatiPlot(arrivals, origin.origin_time)

  return res.json({
    data: {
      image: result.image,
      total_event: result.pairs,
      ratio: result.vpVsRatio
    }
  })
})
