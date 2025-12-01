import { Router } from 'express'
import { OriginModel } from '../models/Origin'
import { EventModel } from '../models/Event'
import { requireAuth } from '../middleware/auth'
import sharp from 'sharp'

export const magnitudeRouter = Router()

// Calculate b-value (Gutenberg-Richter relation: log10(N) = a - b*M)
const calculateBValue = (magnitudes: number[]): { bValue: number; aValue: number; magnitudeData: { magnitude: number; cumulativeCount: number }[] } => {
  if (magnitudes.length === 0) {
    return { bValue: 0, aValue: 0, magnitudeData: [] }
  }

  // Sort magnitudes
  const sortedMags = [...magnitudes].sort((a, b) => a - b)

  // Create magnitude bins and cumulative counts
  const uniqueMags = [...new Set(sortedMags.map(m => Math.round(m * 10) / 10))] // Round to 0.1
  const magnitudeData = uniqueMags.map(mag => {
    const count = sortedMags.filter(m => m >= mag).length
    return {
      magnitude: mag,
      cumulativeCount: count,
      logCount: count > 0 ? Math.log10(count) : 0
    }
  }).filter(d => d.cumulativeCount > 0)

  if (magnitudeData.length < 2) {
    return { bValue: 0, aValue: 0, magnitudeData: [] }
  }

  // Linear regression on log10(N) = a - b*M
  const n = magnitudeData.length
  const sumM = magnitudeData.reduce((sum, d) => sum + d.magnitude, 0)
  const sumLogN = magnitudeData.reduce((sum, d) => sum + d.logCount, 0)
  const sumM2 = magnitudeData.reduce((sum, d) => sum + d.magnitude * d.magnitude, 0)
  const sumMLogN = magnitudeData.reduce((sum, d) => sum + d.magnitude * d.logCount, 0)

  // Calculate slope (b-value is negative slope)
  const slope = (n * sumMLogN - sumM * sumLogN) / (n * sumM2 - sumM * sumM)
  const intercept = (sumLogN - slope * sumM) / n

  const bValue = -slope // b-value is the negative of the slope
  const aValue = intercept

  return {
    bValue,
    aValue,
    magnitudeData: magnitudeData.map(d => ({
      magnitude: d.magnitude,
      cumulativeCount: d.cumulativeCount
    }))
  }
}

// Generate PNG for Gutenberg-Richter (b-value) plot
const generateBValuePlot = async (magnitudes: number[]): Promise<{ image: string; bValue: number; aValue: number; totalEvents: number }> => {
  const width = 600
  const height = 500
  const padding = 60

  const { bValue, aValue, magnitudeData } = calculateBValue(magnitudes)

  if (magnitudeData.length === 0) {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f8fafc"/>
        <text x="${width / 2}" y="${height / 2}" text-anchor="middle" font-size="16" fill="#64748b">
          Insufficient data for b-value calculation
        </text>
      </svg>
    `
    // Convert SVG to PNG
    const pngBuffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer()

    return {
      image: pngBuffer.toString('base64'),
      bValue: 0,
      aValue: 0,
      totalEvents: magnitudes.length
    }
  }

  // Calculate scales
  const mMin = Math.min(...magnitudeData.map(d => d.magnitude))
  const mMax = Math.max(...magnitudeData.map(d => d.magnitude))
  const nMax = Math.max(...magnitudeData.map(d => d.cumulativeCount))
  const logNMax = Math.log10(nMax)
  const logNMin = 0

  const xScale = (m: number) => padding + ((m - mMin) / (mMax - mMin)) * (width - 2 * padding)
  const yScale = (logN: number) => height - padding - ((logN - logNMin) / (logNMax - logNMin)) * (height - 2 * padding)

  // Generate data points
  const points = magnitudeData
    .map(d => `<circle cx="${xScale(d.magnitude)}" cy="${yScale(Math.log10(d.cumulativeCount))}" r="4" fill="#3b82f6" opacity="0.7"/>`)
    .join('\n')

  // Generate regression line: log10(N) = a - b*M
  const lineX1 = xScale(mMin)
  const lineY1 = yScale(aValue - bValue * mMin)
  const lineX2 = xScale(mMax)
  const lineY2 = yScale(aValue - bValue * mMax)

  // Generate tick marks for log scale
  const logTicks = []
  for (let i = 0; i <= Math.ceil(logNMax); i++) {
    const y = yScale(i)
    const count = Math.pow(10, i)
    logTicks.push(`
      <line x1="${padding - 5}" y1="${y}" x2="${padding}" y2="${y}" stroke="#94a3b8" stroke-width="1"/>
      <text x="${padding - 10}" y="${y + 4}" text-anchor="end" font-size="10" fill="#64748b">${count}</text>
    `)
  }

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f8fafc"/>

      <!-- Axes -->
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#94a3b8" stroke-width="2"/>
      <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#94a3b8" stroke-width="2"/>

      <!-- Labels -->
      <text x="${width / 2}" y="${height - 20}" text-anchor="middle" font-size="14" fill="#475569">Magnitude (M)</text>
      <text x="20" y="${height / 2}" text-anchor="middle" font-size="14" fill="#475569" transform="rotate(-90, 20, ${height / 2})">Cumulative Number (N)</text>

      <!-- Title -->
      <text x="${width / 2}" y="30" text-anchor="middle" font-size="16" font-weight="bold" fill="#1e293b">Gutenberg-Richter Relation</text>
      <text x="${width / 2}" y="50" text-anchor="middle" font-size="12" fill="#64748b">b-value: ${bValue.toFixed(3)} | a-value: ${aValue.toFixed(3)}</text>

      <!-- Tick marks (log scale on Y) -->
      ${logTicks.join('\n')}

      <!-- Regression line -->
      <line x1="${lineX1}" y1="${lineY1}" x2="${lineX2}" y2="${lineY2}" stroke="#ef4444" stroke-width="2" stroke-dasharray="5,5"/>

      <!-- Data points -->
      ${points}

      <!-- X-axis tick marks -->
      <text x="${padding}" y="${height - padding + 20}" text-anchor="middle" font-size="10" fill="#64748b">${mMin.toFixed(1)}</text>
      <text x="${width - padding}" y="${height - padding + 20}" text-anchor="middle" font-size="10" fill="#64748b">${mMax.toFixed(1)}</text>
    </svg>
  `

  // Convert SVG to PNG
  const pngBuffer = await sharp(Buffer.from(svg))
    .png()
    .toBuffer()

  return {
    image: pngBuffer.toString('base64'),
    bValue,
    aValue,
    totalEvents: magnitudes.length
  }
}

magnitudeRouter.post('/getbvalue', requireAuth, async (req, res) => {
  const { origin_id } = req.body

  if (!origin_id) {
    return res.status(400).json({ status: false, message: 'origin_id required' })
  }

  const origin = await OriginModel.findById(origin_id)
  if (!origin) {
    return res.status(404).json({ status: false, message: 'origin not found' })
  }

  // Get all origins from the same region (or all origins if region not specified)
  const query = origin.region ? { region: origin.region } : {}
  const origins = await OriginModel.find(query)

  // Extract all magnitude values
  const magnitudes: number[] = []
  origins.forEach(originDoc => {
    if (originDoc.magnitudes) {
      originDoc.magnitudes.forEach((mag: any) => {
        if (typeof mag.value === 'number' && !isNaN(mag.value)) {
          magnitudes.push(mag.value)
        }
      })
    }
  })

  console.log(`[Magnitude] Found ${magnitudes.length} magnitude values from ${origins.length} origins`)

  const result = await generateBValuePlot(magnitudes)

  return res.json({
    data: {
      image: result.image,
      b_value: result.bValue,
      a_value: result.aValue,
      total_events: result.totalEvents
    }
  })
})
