import { GlobalBValueResponse, LatestEventResponse } from '@src/api-service/dashboard'
import { BValuePlotResponse } from '@src/api-service/magnitude'
import { OriginDetail, StationMagnitudeIdsPerType } from '@src/api-service/origin/types'
import { RecordStreamResponse } from '@src/api-service/record-stream'
import { GetAllEventListQuery } from '@src/api-service/event/types'
import { Arrival } from '@src/types/arrival'
import { EarthQuakeEvent, EarthQuakeEventDetail } from '@src/types/event'
import { Magnitude } from '@src/types/magnitude'
import { Origin } from '@src/types/origin'
import { Pick } from '@src/types/pick'
import { Station } from '@src/types/station'
import {
  StationWaveForm,
  WebsocketArrivalResponse,
  WebsocketPickingResponse
} from '@src/types/waveform'
import { WSEvent } from '@src/types/ws-event'
import { ref } from 'vue'

import { mockEventDetails, mockOriginDetails, mockStations } from './index'

const LOOP_DURATION_MS = 30_000
const HISTORY_LIMIT = 12
const WAVEFORM_SAMPLE_COUNT = 3_600
const WAVEFORM_DELTA = 0.5
const WAVEFORM_SAMPLING_RATE = 1 / WAVEFORM_DELTA
const LIVE_STATIONS = mockStations.slice(0, 4)
const CHANNEL_ORIENTATION_OFFSET: Record<string, number> = {
  Z: 0,
  N: Math.PI / 3,
  E: (Math.PI * 2) / 3
}

type SocketEventHandler = (...args: any[]) => void
type EventHandler = (event: WSEvent) => void
type PickHandler = (payload: WebsocketPickingResponse) => void
type ArrivalHandler = (payload: WebsocketArrivalResponse) => void

type IncidentStationSchedule = {
  station: Station
  pickId: string
  pArrivalId: string
  sArrivalId: string
  pickAt: number
  pArrivalAt: number
  sArrivalAt: number
}

type CurrentIncident = {
  cycle: number
  startedAt: number
  originTime: number
  confirmAt: number
  endAt: number
  eventId: string
  preferredOriginId: string
  revisedOriginId: string
  stationSchedule: IncidentStationSchedule[]
  emittedPickIds: Set<string>
  emittedArrivalIds: Set<string>
  confirmed: boolean
}

const frontendOnlyRealtimeVersion = ref(0)
const frontendOnlyLiveEvent = ref<EarthQuakeEvent | null>(null)
const frontendOnlyEventListSnapshot = ref<EarthQuakeEvent[]>([])

const eventSubscribers = new Set<EventHandler>()
const pickSubscribers = new Set<PickHandler>()
const arrivalSubscribers = new Set<ArrivalHandler>()
const socketSubscribers = new Map<string, Set<SocketEventHandler>>()

const baseHistoryDetails = Object.values(mockEventDetails).sort(
  (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
)
const finalizedHistoryDetails = ref<EarthQuakeEventDetail[]>(deepClone(baseHistoryDetails))

let currentIncident: CurrentIncident | null = null
let realtimeInterval: number | null = null
let isStarted = false

const emitSocketEvent = (eventName: string, ...args: any[]) => {
  socketSubscribers.get(eventName)?.forEach((handler) => handler(...args))
}

const emitRealtimeVersion = () => {
  frontendOnlyRealtimeVersion.value += 1
  refreshSnapshots()
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function hashString(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash)
}

function normalizedNoise(seed: number, index: number) {
  const raw = Math.sin((seed + 1) * 12.9898 + index * 78.233) * 43758.5453
  return (raw - Math.floor(raw)) * 2 - 1
}

function gaussianEnvelope(index: number, center: number, width: number) {
  const distance = (index - center) / width
  return Math.exp(-(distance * distance))
}

function createStationMagnitudeGroups(origin: Origin): StationMagnitudeIdsPerType[] {
  const stations = origin.arrivals.map((arrival) => arrival.station_details)
  const uniqueStations = stations.filter(
    (station, index) => stations.findIndex((item) => item._id === station._id) === index
  )

  return ['Ml', 'Mw'].map((type, typeIndex) => ({
    type,
    station_magnitude_ids: uniqueStations.map((station) => `${origin._id}-${type.toLowerCase()}-${station._id}`),
    station_magnitudes: uniqueStations.map((station, stationIndex) => ({
      _id: `${origin._id}-${type.toLowerCase()}-${station._id}`,
      type,
      value: Number((5 + typeIndex * 0.4 + stationIndex * 0.08).toFixed(2)),
      modified_by: 'frontend-only-demo',
      created_at: origin.created_at,
      pick_source_id: `${origin._id}-pick-${station._id}`,
      station_id: station._id,
      station_details: [station],
      waveform_start: new Date(new Date(origin.origin_time).getTime() - 180_000).toISOString(),
      waveform_end: origin.origin_time
    }))
  }))
}

function buildMagnitudeSet(cycle: number, suffix: string): Magnitude[] {
  const baseMw = 5.6 + (cycle % 5) * 0.12
  const baseMl = baseMw - 0.25

  return [
    {
      _id: `mag-${suffix}-mw`,
      type: 'Mw',
      value: Number(baseMw.toFixed(1)),
      modified_by: 'frontend-only-demo',
      created_at: new Date().toISOString()
    },
    {
      _id: `mag-${suffix}-ml`,
      type: 'Ml',
      value: Number(baseMl.toFixed(1)),
      modified_by: 'frontend-only-demo',
      created_at: new Date().toISOString()
    }
  ]
}

function toSummaryEvent(detail: EarthQuakeEventDetail): EarthQuakeEvent {
  const preferredOrigin =
    detail.origins.find((origin) => origin._id === detail.preferred_origin_id) ?? detail.origins[0]

  return {
    _id: detail._id,
    name: detail.name,
    origin_ids: detail.origin_ids,
    origins: preferredOrigin,
    preferred_origin_id: detail.preferred_origin_id,
    created_at: detail.created_at
  }
}

function createIncident(cycle: number, startedAt: number): CurrentIncident {
  const stationSchedule = LIVE_STATIONS.map((station, index) => {
    const pickAt = startedAt + (6 + index * 2) * 1000
    return {
      station,
      pickId: `pick-live-${cycle + 1}-${station.code.toLowerCase()}`,
      pArrivalId: `arrival-live-${cycle + 1}-${station.code.toLowerCase()}-p`,
      sArrivalId: `arrival-live-${cycle + 1}-${station.code.toLowerCase()}-s`,
      pickAt,
      pArrivalAt: pickAt + 2_000,
      sArrivalAt: pickAt + 6_000
    }
  })

  return {
    cycle,
    startedAt,
    originTime: startedAt + 4_000,
    confirmAt: startedAt + 14_000,
    endAt: startedAt + LOOP_DURATION_MS,
    eventId: `event-live-${cycle + 1}`,
    preferredOriginId: `origin-live-${cycle + 1}-primary`,
    revisedOriginId: `origin-live-${cycle + 1}-reviewed`,
    stationSchedule,
    emittedPickIds: new Set<string>(),
    emittedArrivalIds: new Set<string>(),
    confirmed: false
  }
}

function createPick(schedule: IncidentStationSchedule): Pick {
  return {
    _id: schedule.pickId,
    station_id: schedule.station._id,
    timestamp: new Date(schedule.pickAt).toISOString(),
    created_at: new Date(schedule.pickAt).toISOString()
  }
}

function createArrival(
  schedule: IncidentStationSchedule,
  pick: Pick,
  phaseType: 'P' | 'S',
  timestamp: number,
  originVariant: 'primary' | 'revised'
): Arrival {
  return {
    _id: phaseType === 'P' ? schedule.pArrivalId : schedule.sArrivalId,
    pick_source_id: pick,
    pick_details: {
      ...pick,
      channel: schedule.station.channel[0]
    } as Pick & { channel?: string },
    station_id: schedule.station,
    station_details: schedule.station,
    timestamp: new Date(timestamp + (originVariant === 'revised' ? 700 : 0)).toISOString(),
    phase_type: phaseType,
    created_at: new Date(timestamp + (originVariant === 'revised' ? 700 : 0)).toISOString(),
    checked: true
  }
}

function getOccurredSchedules(incident: CurrentIncident, now: number) {
  return incident.stationSchedule.map((schedule) => ({
    ...schedule,
    hasPick: now >= schedule.pickAt,
    hasPArrival: now >= schedule.pArrivalAt,
    hasSArrival: now >= schedule.sArrivalAt
  }))
}

function buildIncidentOrigins(incident: CurrentIncident, now: number, finalized = false): Origin[] {
  const baseDetail = mockEventDetails['event-demo-001']
  const [preferredTemplate, revisedTemplate] = baseDetail.origins
  const occurredSchedules = getOccurredSchedules(incident, now)
  const originTimeIso = new Date(incident.originTime).toISOString()
  const cycleOffset = (incident.cycle % 5) * 0.035
  const magnitudesPrimary = buildMagnitudeSet(incident.cycle, `${incident.cycle + 1}-primary`)
  const magnitudesReviewed = buildMagnitudeSet(incident.cycle + 1, `${incident.cycle + 1}-reviewed`)

  const buildOrigin = (
    template: Origin,
    originId: string,
    originName: string,
    variant: 'primary' | 'revised',
    magnitudes: Magnitude[]
  ) => {
    const picks = occurredSchedules
      .filter((schedule) => finalized || schedule.hasPick)
      .map((schedule) => createPick(schedule))

    const arrivals = occurredSchedules.flatMap((schedule) => {
      const pick = createPick(schedule)
      const items: Arrival[] = []

      if (finalized || schedule.hasPArrival) {
        items.push(createArrival(schedule, pick, 'P', schedule.pArrivalAt, variant))
      }

      if (finalized || schedule.hasSArrival) {
        items.push(createArrival(schedule, pick, 'S', schedule.sArrivalAt, variant))
      }

      return items
    })

    return {
      ...deepClone(template),
      _id: originId,
      name: originName,
      origin_time: new Date(incident.originTime + (variant === 'revised' ? 900 : 0)).toISOString(),
      arrival_ids: arrivals.map((arrival) => arrival._id),
      arrivals,
      longitude: Number((preferredTemplate.longitude + cycleOffset + (variant === 'revised' ? -0.012 : 0)).toFixed(3)),
      latitude: Number((preferredTemplate.latitude + cycleOffset / 2 + (variant === 'revised' ? 0.009 : 0)).toFixed(3)),
      depth: Number((preferredTemplate.depth + (incident.cycle % 4) * 1.4 + (variant === 'revised' ? -2.2 : 0)).toFixed(1)),
      magnitude_ids: magnitudes.map((magnitude) => magnitude._id),
      created_at: originTimeIso,
      magnitudes,
      modified_by: variant === 'revised' ? 'review-analyst' : 'frontend-only-demo',
      auto_origin_ref_id: `auto-origin-live-${incident.cycle + 1}-${variant}`,
      err_epicenter: Number((template.err_epicenter - (incident.cycle % 3) * 0.7).toFixed(1)),
      gap: Math.max(86, template.gap - (incident.cycle % 4) * 4),
      rms: Number((template.rms + (variant === 'revised' ? -0.05 : 0.02)).toFixed(2)),
      station_magnitude_ids_per_type: []
    }
  }

  return [
    buildOrigin(
      preferredTemplate,
      incident.preferredOriginId,
      `Primary Origin ${incident.cycle + 1}`,
      'primary',
      magnitudesPrimary
    ),
    buildOrigin(
      revisedTemplate,
      incident.revisedOriginId,
      `Reviewed Origin ${incident.cycle + 1}`,
      'revised',
      magnitudesReviewed
    )
  ]
}

function buildIncidentDetail(incident: CurrentIncident, now: number, finalized = false): EarthQuakeEventDetail {
  const origins = buildIncidentOrigins(incident, now, finalized)
  return {
    _id: incident.eventId,
    name: `Makassar Strait Live Incident ${incident.cycle + 1}`,
    origin_ids: origins.map((origin) => origin._id),
    origins,
    preferred_origin_id: incident.preferredOriginId,
    created_at: new Date(incident.confirmAt).toISOString()
  }
}

function buildIncidentWsEvent(incident: CurrentIncident, now: number): WSEvent {
  const detail = buildIncidentDetail(incident, now)
  const preferredOrigin = detail.origins.find((origin) => origin._id === detail.preferred_origin_id) ?? detail.origins[0]

  return {
    _id: detail._id,
    name: detail.name,
    origin_ids: detail.origin_ids,
    created_at: detail.created_at,
    origins: detail.origins,
    preferred_origin: preferredOrigin
  }
}

function buildOriginDetailFromOrigin(origin: Origin): OriginDetail {
  return {
    ...origin,
    station_magnitude_ids_per_type: createStationMagnitudeGroups(origin)
  }
}

function toBase64Svg(svg: string) {
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
}

function createSvgChartFrame({
  title,
  subtitle,
  body,
  footer
}: {
  title: string
  subtitle: string
  body: string
  footer?: string
}) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1100" height="680" viewBox="0 0 1100 680">
      <rect width="1100" height="680" rx="28" fill="#fffaf0"/>
      <rect x="24" y="24" width="1052" height="632" rx="24" fill="#fffefb" stroke="#ead7aa" stroke-width="2"/>
      <text x="56" y="72" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="700" fill="#3f2a00">${title}</text>
      <text x="56" y="104" font-family="Segoe UI, Arial, sans-serif" font-size="14" fill="#8a6a2f">${subtitle}</text>
      ${body}
      ${footer ? `<text x="56" y="630" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#7b6a44">${footer}</text>` : ''}
    </svg>
  `
}

function createWadatiSvg(origin: OriginDetail) {
  const width = 920
  const height = 420
  const marginLeft = 92
  const marginTop = 148
  const points = origin.arrivals
    .filter((arrival) => arrival.phase_type === 'P')
    .map((pArrival, index) => {
      const sArrival = origin.arrivals.find(
        (arrival) =>
          arrival.pick_details?._id === pArrival.pick_details?._id &&
          arrival.phase_type === 'S'
      )

      if (!sArrival) return null

      const pTime = new Date(pArrival.timestamp).getTime()
      const sTime = new Date(sArrival.timestamp).getTime()
      const originTime = new Date(origin.origin_time).getTime()
      const x = (pTime - originTime) / 1000
      const y = (sTime - pTime) / 1000

      return {
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
        label: pArrival.station_details.code,
        index
      }
    })
    .filter((point): point is NonNullable<typeof point> => !!point)

  const maxX = Math.max(...points.map((point) => point.x), 12)
  const maxY = Math.max(...points.map((point) => point.y), 10)
  const ratio = Number((1.62 + (origin.arrivals.length % 5) * 0.04).toFixed(2))

  const scaledPoints = points
    .map((point) => {
      const px = marginLeft + (point.x / maxX) * width
      const py = marginTop + height - (point.y / maxY) * height
      return `
        <circle cx="${px}" cy="${py}" r="7" fill="#c88a04" stroke="#6b4500" stroke-width="2"/>
        <text x="${px + 10}" y="${py - 10}" font-family="Segoe UI, Arial, sans-serif" font-size="12" fill="#5b4a27">${point.label}</text>
      `
    })
    .join('')

  const axisLabels = Array.from({ length: 6 }, (_, index) => {
    const value = Number(((maxX / 5) * index).toFixed(1))
    const x = marginLeft + (width / 5) * index
    return `
      <line x1="${x}" y1="${marginTop}" x2="${x}" y2="${marginTop + height}" stroke="#f0e1bf" stroke-width="1"/>
      <text x="${x}" y="${marginTop + height + 28}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="12" fill="#7b6a44">${value}</text>
    `
  }).join('')

  const yLabels = Array.from({ length: 6 }, (_, index) => {
    const value = Number(((maxY / 5) * index).toFixed(1))
    const y = marginTop + height - (height / 5) * index
    return `
      <line x1="${marginLeft}" y1="${y}" x2="${marginLeft + width}" y2="${y}" stroke="#f0e1bf" stroke-width="1"/>
      <text x="${marginLeft - 18}" y="${y + 4}" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="12" fill="#7b6a44">${value}</text>
    `
  }).join('')

  const fitLineX1 = 0
  const fitLineY1 = 0.8
  const fitLineX2 = maxX
  const fitLineY2 = Math.min(maxY, fitLineY1 + maxX * 0.78)
  const lineX1 = marginLeft + (fitLineX1 / maxX) * width
  const lineY1 = marginTop + height - (fitLineY1 / maxY) * height
  const lineX2 = marginLeft + (fitLineX2 / maxX) * width
  const lineY2 = marginTop + height - (fitLineY2 / maxY) * height

  return createSvgChartFrame({
    title: 'Wadati Diagram',
    subtitle: `${origin.sub_region}, ${origin.region} • Origin ${new Date(origin.origin_time).toISOString().slice(0, 19).replace('T', ' ')}`,
    body: `
      <rect x="${marginLeft}" y="${marginTop}" width="${width}" height="${height}" rx="22" fill="#fff8ea" stroke="#ead7aa" stroke-width="1.5"/>
      ${axisLabels}
      ${yLabels}
      <line x1="${marginLeft}" y1="${marginTop + height}" x2="${marginLeft + width}" y2="${marginTop + height}" stroke="#6b4500" stroke-width="2"/>
      <line x1="${marginLeft}" y1="${marginTop}" x2="${marginLeft}" y2="${marginTop + height}" stroke="#6b4500" stroke-width="2"/>
      <line x1="${lineX1}" y1="${lineY1}" x2="${lineX2}" y2="${lineY2}" stroke="#d97706" stroke-width="4" stroke-linecap="round"/>
      ${scaledPoints}
      <text x="${marginLeft + width / 2}" y="${marginTop + height + 56}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="14" fill="#5b4a27">P-arrival travel time (s)</text>
      <text x="28" y="${marginTop + height / 2}" transform="rotate(-90 28 ${marginTop + height / 2})" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="14" fill="#5b4a27">S - P time (s)</text>
      <rect x="826" y="62" width="210" height="74" rx="18" fill="#fff3d6" stroke="#ead7aa" stroke-width="1.5"/>
      <text x="848" y="92" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#7b6a44">Vp / Vs Ratio</text>
      <text x="848" y="122" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="700" fill="#c88a04">${ratio.toFixed(2)}</text>
    `,
    footer: `Frontend-only demo diagram generated from ${points.length} paired arrivals`
  })
}

function createBValueSvg(origin: OriginDetail) {
  const width = 920
  const height = 420
  const marginLeft = 92
  const marginTop = 148
  const bValue = Number((0.88 + (origin.arrivals.length % 4) * 0.03).toFixed(2))
  const aValue = Number((4.1 + (origin.arrivals.length % 3) * 0.08).toFixed(2))
  const magnitudes = [2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6]
  const values = magnitudes.map((magnitude, index) => ({
    magnitude,
    value: Number((aValue - bValue * magnitude + (index % 2 === 0 ? 0.06 : -0.04)).toFixed(2))
  }))
  const maxY = Math.max(...values.map((item) => item.value), 3)
  const minY = Math.min(...values.map((item) => item.value), -1)
  const rangeY = maxY - minY || 1

  const points = values.map((item, index) => {
    const x = marginLeft + (index / (values.length - 1)) * width
    const y = marginTop + height - ((item.value - minY) / rangeY) * height
    return `
      <circle cx="${x}" cy="${y}" r="6.5" fill="#d97706" stroke="#6b4500" stroke-width="2"/>
      <text x="${x}" y="${marginTop + height + 28}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="12" fill="#7b6a44">${item.magnitude.toFixed(1)}</text>
    `
  }).join('')

  const polyline = values.map((item, index) => {
    const x = marginLeft + (index / (values.length - 1)) * width
    const y = marginTop + height - ((item.value - minY) / rangeY) * height
    return `${x},${y}`
  }).join(' ')

  const yLines = Array.from({ length: 6 }, (_, index) => {
    const value = Number((minY + (rangeY / 5) * index).toFixed(1))
    const y = marginTop + height - (height / 5) * index
    return `
      <line x1="${marginLeft}" y1="${y}" x2="${marginLeft + width}" y2="${y}" stroke="#f0e1bf" stroke-width="1"/>
      <text x="${marginLeft - 18}" y="${y + 4}" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="12" fill="#7b6a44">${value}</text>
    `
  }).join('')

  return createSvgChartFrame({
    title: 'Gutenberg-Richter B-Value',
    subtitle: `${origin.sub_region}, ${origin.region} • Rolling catalog estimate`,
    body: `
      <rect x="${marginLeft}" y="${marginTop}" width="${width}" height="${height}" rx="22" fill="#fff8ea" stroke="#ead7aa" stroke-width="1.5"/>
      ${yLines}
      <line x1="${marginLeft}" y1="${marginTop + height}" x2="${marginLeft + width}" y2="${marginTop + height}" stroke="#6b4500" stroke-width="2"/>
      <line x1="${marginLeft}" y1="${marginTop}" x2="${marginLeft}" y2="${marginTop + height}" stroke="#6b4500" stroke-width="2"/>
      <polyline points="${polyline}" fill="none" stroke="#c88a04" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      ${points}
      <text x="${marginLeft + width / 2}" y="${marginTop + height + 56}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="14" fill="#5b4a27">Magnitude bin</text>
      <text x="28" y="${marginTop + height / 2}" transform="rotate(-90 28 ${marginTop + height / 2})" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="14" fill="#5b4a27">log₁₀ N</text>
      <rect x="794" y="54" width="242" height="88" rx="18" fill="#fff3d6" stroke="#ead7aa" stroke-width="1.5"/>
      <text x="816" y="84" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#7b6a44">Equation</text>
      <text x="816" y="113" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="700" fill="#c88a04">log₁₀N = ${aValue.toFixed(2)} - ${bValue.toFixed(2)}M</text>
    `,
    footer: `Frontend-only demo estimate based on ${origin.arrivals.length} arrivals`
  })
}

function refreshSnapshots() {
  const historySummaries = finalizedHistoryDetails.value.map((detail) => toSummaryEvent(detail))
  const currentSummary =
    currentIncident && currentIncident.confirmed ? toSummaryEvent(buildIncidentDetail(currentIncident, Date.now())) : null

  frontendOnlyEventListSnapshot.value = currentSummary
    ? [currentSummary, ...historySummaries].slice(0, HISTORY_LIMIT)
    : historySummaries.slice(0, HISTORY_LIMIT)
  frontendOnlyLiveEvent.value = frontendOnlyEventListSnapshot.value[0] ?? null
}

function emitPick(schedule: IncidentStationSchedule) {
  const payload: WebsocketPickingResponse = {
    network: schedule.station.network,
    station: schedule.station.code,
    picks: [
      {
        _id: schedule.pickId,
        timestamp: new Date(schedule.pickAt).toISOString()
      }
    ]
  }

  pickSubscribers.forEach((handler) => handler(payload))
}

function emitArrival(schedule: IncidentStationSchedule, phaseType: 'P' | 'S') {
  const payload: WebsocketArrivalResponse = {
    pick_source_id: schedule.pickId,
    station_id: schedule.station._id,
    network: schedule.station.network,
    station: schedule.station.code,
    longitude: schedule.station.longitude,
    latitude: schedule.station.latitude,
    picks: [
      {
        _id: phaseType === 'P' ? schedule.pArrivalId : schedule.sArrivalId,
        timestamp: new Date(phaseType === 'P' ? schedule.pArrivalAt : schedule.sArrivalAt).toISOString(),
        type: phaseType
      }
    ]
  }

  arrivalSubscribers.forEach((handler) => handler(payload))
}

function buildWaveformPayload(channelName: string, now: number): StationWaveForm[] {
  const [network, station, channel] = channelName.split('.')
  const seed = hashString(channelName)
  const orientation = channel.slice(-1).toUpperCase()
  const orientationOffset = CHANNEL_ORIENTATION_OFFSET[orientation] ?? 0
  const windowDurationMs = WAVEFORM_SAMPLE_COUNT * WAVEFORM_DELTA * 1000
  const windowStart = now - windowDurationMs
  const activeSchedule =
    currentIncident?.stationSchedule.find(
      (schedule) => schedule.station.network === network && schedule.station.code === station
    ) ?? null

  const waveform = Array.from({ length: WAVEFORM_SAMPLE_COUNT }, (_, index) => {
    const sampleTime = windowStart + index * WAVEFORM_DELTA * 1000
    const ambientNoise = normalizedNoise(seed, index) * 6
    const baseline =
      Math.sin(index / 21 + orientationOffset) * 4 +
      Math.sin(index / 57 + (seed % 17) * 0.14) * 2 +
      Math.cos(index / 93 + (seed % 23) * 0.08) * 1.5

    if (!activeSchedule) {
      return Number((ambientNoise + baseline).toFixed(2))
    }

    const pCenter = (activeSchedule.pickAt - windowStart) / (WAVEFORM_DELTA * 1000)
    const sCenter = (activeSchedule.sArrivalAt - windowStart) / (WAVEFORM_DELTA * 1000)
    const codaCenter = (activeSchedule.sArrivalAt + 4_000 - windowStart) / (WAVEFORM_DELTA * 1000)

    const pEnvelope = gaussianEnvelope(index, pCenter, 10)
    const sEnvelope = gaussianEnvelope(index, sCenter, 18)
    const codaEnvelope = gaussianEnvelope(index, codaCenter, 56)

    const pAmplitude = orientation === 'Z' ? 68 : 42
    const sAmplitude = orientation === 'Z' ? 118 : 154
    const codaAmplitude = orientation === 'Z' ? 28 : 44

    const pWave =
      pEnvelope *
      pAmplitude *
      (Math.sin(index * 0.44 + orientationOffset) + 0.2 * Math.sin(index * 0.78 + seed * 0.0009))
    const sWave =
      sEnvelope *
      sAmplitude *
      (Math.sin(index * 0.18 + orientationOffset) + 0.35 * Math.sin(index * 0.27 + seed * 0.0012))
    const codaWave =
      codaEnvelope *
      codaAmplitude *
      Math.sin(index * 0.11 + orientationOffset + Math.sin(index * 0.02) * 0.45)

    return Number((ambientNoise + baseline + pWave + sWave + codaWave).toFixed(2))
  })

  return [
    {
      date: new Date(windowStart).toISOString(),
      starttime: new Date(windowStart).toISOString(),
      endtime: new Date(now).toISOString(),
      sampling_rate: WAVEFORM_SAMPLING_RATE,
      delta: WAVEFORM_DELTA,
      location: '00',
      npts: waveform.length,
      station,
      network,
      channel,
      expiration_timestamp: now + 2_000,
      waveform
    }
  ]
}

function emitWaveforms(now: number) {
  socketSubscribers.forEach((_handlers, eventName) => {
    if (!eventName.startsWith('data-')) return
    const channelName = eventName.replace('data-', '')
    emitSocketEvent(eventName, buildWaveformPayload(channelName, now))
  })
}

function finalizeCurrentIncident() {
  if (!currentIncident || !currentIncident.confirmed) return

  const finalizedDetail = buildIncidentDetail(currentIncident, currentIncident.endAt, true)
  finalizedHistoryDetails.value = [finalizedDetail, ...finalizedHistoryDetails.value].slice(0, HISTORY_LIMIT)
}

function prepareNextIncident(now = Date.now()) {
  currentIncident = createIncident(
    currentIncident ? currentIncident.cycle + 1 : 0,
    now
  )
  refreshSnapshots()
}

function processRealtimeTick(now: number) {
  if (!currentIncident) {
    prepareNextIncident(now)
  }

  if (!currentIncident) return

  if (now >= currentIncident.endAt) {
    finalizeCurrentIncident()
    prepareNextIncident(now)
    emitRealtimeVersion()
  }

  if (!currentIncident) return

  currentIncident.stationSchedule.forEach((schedule) => {
    if (now >= schedule.pickAt && !currentIncident!.emittedPickIds.has(schedule.pickId)) {
      currentIncident!.emittedPickIds.add(schedule.pickId)
      emitPick(schedule)
    }

    if (now >= schedule.pArrivalAt && !currentIncident!.emittedArrivalIds.has(schedule.pArrivalId)) {
      currentIncident!.emittedArrivalIds.add(schedule.pArrivalId)
      emitArrival(schedule, 'P')
    }

    if (now >= schedule.sArrivalAt && !currentIncident!.emittedArrivalIds.has(schedule.sArrivalId)) {
      currentIncident!.emittedArrivalIds.add(schedule.sArrivalId)
      emitArrival(schedule, 'S')
    }
  })

  if (!currentIncident.confirmed && now >= currentIncident.confirmAt) {
    currentIncident.confirmed = true
    const wsEvent = buildIncidentWsEvent(currentIncident, now)
    eventSubscribers.forEach((handler) => handler(wsEvent))
    emitRealtimeVersion()
  }

  emitWaveforms(now)
}

refreshSnapshots()

export const startFrontendOnlyRealtimeDemo = () => {
  if (isStarted) return

  isStarted = true
  prepareNextIncident(Date.now())
  processRealtimeTick(Date.now())

  realtimeInterval = window.setInterval(() => {
    processRealtimeTick(Date.now())
  }, 1_000)
}

export const stopFrontendOnlyRealtimeDemo = () => {
  if (realtimeInterval) {
    clearInterval(realtimeInterval)
    realtimeInterval = null
  }
  isStarted = false
}

export const subscribeFrontendOnlyEvent = (handler: EventHandler) => {
  startFrontendOnlyRealtimeDemo()
  eventSubscribers.add(handler)
  return () => {
    eventSubscribers.delete(handler)
  }
}

export const subscribeFrontendOnlyPick = (handler: PickHandler) => {
  startFrontendOnlyRealtimeDemo()
  pickSubscribers.add(handler)
  return () => {
    pickSubscribers.delete(handler)
  }
}

export const subscribeFrontendOnlyArrival = (handler: ArrivalHandler) => {
  startFrontendOnlyRealtimeDemo()
  arrivalSubscribers.add(handler)
  return () => {
    arrivalSubscribers.delete(handler)
  }
}

export const registerFrontendOnlySocketHandler = (eventName: string, handler: SocketEventHandler) => {
  startFrontendOnlyRealtimeDemo()

  if (!socketSubscribers.has(eventName)) {
    socketSubscribers.set(eventName, new Set())
  }

  socketSubscribers.get(eventName)!.add(handler)
}

export const unregisterFrontendOnlySocketHandler = (eventName?: string, handler?: SocketEventHandler) => {
  if (!eventName) {
    socketSubscribers.clear()
    return
  }

  if (!handler) {
    socketSubscribers.delete(eventName)
    return
  }

  socketSubscribers.get(eventName)?.delete(handler)
  if (!socketSubscribers.get(eventName)?.size) {
    socketSubscribers.delete(eventName)
  }
}

export const requestFrontendOnlyWaveform = (channelName: string) => {
  startFrontendOnlyRealtimeDemo()
  emitSocketEvent(`data-${channelName}`, buildWaveformPayload(channelName, Date.now()))
}

export const getFrontendOnlyEventsSnapshot = (params?: GetAllEventListQuery) => {
  const page = params?.page ?? 1
  const totalPerPage = params?.totalPerPage ?? HISTORY_LIMIT
  const startDate = params?.startDate ? new Date(params.startDate).getTime() : null
  const endDate = params?.endDate ? new Date(params.endDate).getTime() : null

  const filtered = frontendOnlyEventListSnapshot.value.filter((event) => {
    const createdAt = new Date(event.created_at).getTime()
    if (startDate && createdAt < startDate) return false
    if (endDate && createdAt > endDate) return false
    return true
  })

  const startIndex = (page - 1) * totalPerPage

  return {
    data: filtered.slice(startIndex, startIndex + totalPerPage).map((event) => deepClone(event)),
    total: filtered.length
  }
}

export const getFrontendOnlyEventDetailSnapshot = (eventId: string): EarthQuakeEventDetail => {
  if (currentIncident?.confirmed && currentIncident.eventId === eventId) {
    return buildIncidentDetail(currentIncident, Date.now())
  }

  return (
    deepClone(finalizedHistoryDetails.value.find((detail) => detail._id === eventId)) ??
    deepClone(mockEventDetails['event-demo-001'])
  )
}

export const getFrontendOnlyOriginDetailSnapshot = (originId: string): OriginDetail => {
  if (currentIncident?.confirmed) {
    const currentDetail = buildIncidentDetail(currentIncident, Date.now())
    const currentOrigin = currentDetail.origins.find((origin) => origin._id === originId)

    if (currentOrigin) {
      return buildOriginDetailFromOrigin(currentOrigin)
    }
  }

  const historicalOrigin = finalizedHistoryDetails.value
    .flatMap((detail) => detail.origins)
    .find((origin) => origin._id === originId)

  if (historicalOrigin) {
    return buildOriginDetailFromOrigin(deepClone(historicalOrigin))
  }

  return deepClone(mockOriginDetails['origin-demo-primary'])
}

export const getFrontendOnlyLatestEventSnapshot = (): LatestEventResponse => {
  const latestEvent = frontendOnlyLiveEvent.value ?? frontendOnlyEventListSnapshot.value[0]

  if (!latestEvent) {
    return {
      time: 'No live events yet',
      magnitude: 'Mw --',
      location: 'Demo catalog idle',
      depth: '-- km'
    }
  }

  const magnitude = latestEvent.origins.magnitudes.find((item) => item.type.toLowerCase() === 'mw') ?? latestEvent.origins.magnitudes[0]

  return {
    time: `${new Date(latestEvent.origins.origin_time).toISOString().slice(0, 16).replace('T', ' ')} UTC`,
    magnitude: `${magnitude?.type ?? 'Mw'} ${magnitude?.value?.toFixed(1) ?? '--'}`,
    location: `${latestEvent.origins.sub_region}, ${latestEvent.origins.region}`,
    depth: `${latestEvent.origins.depth.toFixed(1)} km`
  }
}

export const getFrontendOnlyGlobalBValueSnapshot = (): GlobalBValueResponse => ({
  b_value: Number((0.9 + (frontendOnlyRealtimeVersion.value % 4) * 0.01).toFixed(2)),
  total_events: frontendOnlyEventListSnapshot.value.length
})

export const getFrontendOnlyWadatiPlotSnapshot = (originId: string) => {
  const origin = getFrontendOnlyOriginDetailSnapshot(originId)
  return {
    data: {
      image: toBase64Svg(createWadatiSvg(origin)),
      total_event: Math.max(1, Math.floor(origin.arrivals.length / 2)),
      ratio: Number((1.62 + (origin.arrivals.length % 5) * 0.04).toFixed(2))
    }
  }
}

export const getFrontendOnlyBValuePlotSnapshot = (originId: string): { data: BValuePlotResponse } => {
  const origin = getFrontendOnlyOriginDetailSnapshot(originId)
  const bValue = Number((0.88 + (origin.arrivals.length % 4) * 0.03).toFixed(2))
  const aValue = Number((4.1 + (origin.arrivals.length % 3) * 0.08).toFixed(2))

  return {
    data: {
      image: toBase64Svg(createBValueSvg(origin)),
      b_value: bValue,
      a_value: aValue,
      total_events: Math.max(6, origin.arrivals.length)
    }
  }
}

export const getFrontendOnlyRealtimeRecordStream = ({
  network,
  station,
  channel,
  location
}: {
  network: string
  station: string
  channel: string
  location: string
}): RecordStreamResponse => {
  const waveform = buildWaveformPayload(`${network}.${station}.${channel}`, Date.now())[0]

  return {
    date: waveform.date,
    time_start: waveform.starttime,
    time_end: waveform.endtime,
    sampling_rate: waveform.sampling_rate,
    delta: waveform.delta,
    location,
    npts: waveform.npts,
    station,
    network,
    channel,
    expiration_timestamp: waveform.expiration_timestamp,
    waveform: waveform.waveform
  }
}

export { frontendOnlyEventListSnapshot, frontendOnlyLiveEvent, frontendOnlyRealtimeVersion }
