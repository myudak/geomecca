import { EventCommitResponse, EarthQuakeEvent, EarthQuakeEventDetail } from '@src/types/event'
import { APIResponse } from '@src/types/api'
import { LoginResponse } from '@src/types/auth'
import { Origin } from '@src/types/origin'
import { AddStationPayload, Station, StationWaveformStatus } from '@src/types/station'
import { User } from '@src/types/user'
import { Arrival } from '@src/types/arrival'
import { Magnitude } from '@src/types/magnitude'
import { Pick } from '@src/types/pick'
import { WadatiPlotResponse } from '@src/types/wadati'
import { RecordStreamResponse } from '@src/api-service/record-stream'
import { OriginDetail, PSTheoriticalResponse, StationMagnitudeIdsPerType } from '@src/api-service/origin/types'
import { GlobalBValueResponse, LatestEventResponse } from '@src/api-service/dashboard'
import { BValuePlotResponse } from '@src/api-service/magnitude'
import { AddUserPayload, UpdateUserPayload } from '@src/types/user'
import { GetAllEventListQuery } from '@src/api-service/event/types'
import { GetAllUserListQuery } from '@src/api-service/users/types'
import { GetStationListQuery } from '@src/api-service/station/types'
import { GetRecordStreamAPIProps } from '@src/api-service/record-stream/types'
import { formatISO, subMinutes } from 'date-fns'

const TRANSPARENT_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAASwAAADICAIAAADdvUsCAAABfUlEQVR4nO3TMQ0AAAgDIN8/9K3hHFQgkCjImpnvA5CkAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4L1m7rV9W5b1w4q1m7rV9W5b1w4q1m7rV9W5b1w4q1m7rV9W5b1w4q1m7rV9W5b1w4q1m7rV9W5b1w4q1m7rV9W5b1w4q1m7rV9W5b1w4q1m7rV9W5b1w4q1m7rV9W5b1w4q1m7rV9W5b1w4q1m7rV9W5b1w4q1m7rV9W5b1w4q1m7rV9W5b1w4q1m7rV9W5b1w4q1m7rV9W5b1w4q1m7rV9W5b1w4q1m7rV9W5b1w4q1m7rV9W5b1w4q1m7rV9W5b1w4q1m7rV9W5b1w4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwGkKSAAGPp2oNAAAAAElFTkSuQmCC'

const now = new Date('2026-04-18T10:30:00.000Z')
const TWO_PI = Math.PI * 2

const hashString = (value: string) => {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash)
}

const normalizedNoise = (seed: number, index: number) => {
  const raw = Math.sin((seed + 1) * 12.9898 + index * 78.233) * 43758.5453
  return (raw - Math.floor(raw)) * 2 - 1
}

const gaussianEnvelope = (index: number, center: number, width: number) => {
  const distance = (index - center) / width
  return Math.exp(-(distance * distance))
}

const createSeismicWaveform = ({
  sampleCount,
  station,
  channel
}: {
  sampleCount: number
  station: string
  channel: string
}) => {
  const seed = hashString(`${station}-${channel}`)
  const orientation = channel.slice(-1).toUpperCase()
  const isVertical = orientation === 'Z'
  const orientationShift =
    orientation === 'N' ? Math.PI / 3 : orientation === 'E' ? (Math.PI * 2) / 3 : 0

  const pCenter = Math.floor(sampleCount * (0.3 + (seed % 11) * 0.01))
  const sCenter = pCenter + Math.floor(sampleCount * (0.09 + (seed % 7) * 0.004))
  const codaCenter = sCenter + Math.floor(sampleCount * 0.06)
  const pWidth = Math.max(18, Math.floor(sampleCount * 0.018))
  const sWidth = Math.max(36, Math.floor(sampleCount * 0.04))
  const codaWidth = Math.max(120, Math.floor(sampleCount * 0.12))

  return Array.from({ length: sampleCount }, (_, index) => {
    const ambientNoise = normalizedNoise(seed, index) * 8
    const microTremor =
      Math.sin(index / 21 + orientationShift) * 5 +
      Math.sin(index / 57 + (seed % 17) * 0.12) * 3 +
      Math.cos(index / 93 + (seed % 29) * 0.08) * 2

    const pEnvelope = gaussianEnvelope(index, pCenter, pWidth)
    const sEnvelope = gaussianEnvelope(index, sCenter, sWidth)
    const codaEnvelope = gaussianEnvelope(index, codaCenter, codaWidth)

    const pAmplitude = isVertical ? 95 : 55
    const sAmplitude = isVertical ? 145 : 190
    const codaAmplitude = isVertical ? 45 : 62

    const pWave =
      pEnvelope *
      pAmplitude *
      (Math.sin(index * 0.42 + orientationShift) + 0.35 * Math.sin(index * 0.77 + seed * 0.0008))

    const sWave =
      sEnvelope *
      sAmplitude *
      (Math.sin(index * 0.16 + orientationShift) + 0.45 * Math.sin(index * 0.26 + seed * 0.0011))

    const codaWave =
      codaEnvelope *
      codaAmplitude *
      Math.sin(index * 0.11 + orientationShift + Math.sin(index * 0.01) * 0.6)

    const onsetKick =
      index >= pCenter && index <= pCenter + 6 ? (isVertical ? 32 : 18) * Math.sin(((index - pCenter) * TWO_PI) / 6) : 0

    return Number((ambientNoise + microTremor + pWave + sWave + codaWave + onsetKick).toFixed(2))
  })
}

const createMagnitude = (suffix: string, type: string, value: number): Magnitude => ({
  _id: `mag-${suffix}-${type.toLowerCase()}`,
  type,
  value,
  modified_by: 'mock-analyst',
  created_at: now.toISOString()
})

const mockStations: Station[] = [
  {
    _id: 'station-ppl04',
    name: 'Palu Ridge Station',
    code: 'PPL04',
    network: 'GE',
    location: '00',
    channel: ['BHZ', 'BHN', 'BHE'],
    longitude: 119.8701,
    latitude: -0.8912,
    elevation: 18,
    server_seedlink: 'demo-seedlink.mhews.local',
    server_fdsn: 'demo-fdsn.mhews.local',
    status: 'enabled'
  },
  {
    _id: 'station-tch02',
    name: 'Ternate Coastal Hub',
    code: 'TCH02',
    network: 'GE',
    location: '00',
    channel: ['HHZ', 'HHN', 'HHE'],
    longitude: 127.3746,
    latitude: 0.7893,
    elevation: 22,
    server_seedlink: 'demo-seedlink.mhews.local',
    server_fdsn: 'demo-fdsn.mhews.local',
    status: 'enabled'
  },
  {
    _id: 'station-tch04',
    name: 'Ternate Offshore Array',
    code: 'TCH04',
    network: 'GE',
    location: '00',
    channel: ['EHZ', 'EHN', 'EHE'],
    longitude: 127.4025,
    latitude: 0.7552,
    elevation: 11,
    server_seedlink: 'demo-seedlink.mhews.local',
    server_fdsn: 'demo-fdsn.mhews.local',
    status: 'enabled'
  },
  {
    _id: 'station-mks01',
    name: 'Makassar Basin Node',
    code: 'MKS01',
    network: 'GE',
    location: '00',
    channel: ['BHZ', 'BHN', 'BHE'],
    longitude: 119.442,
    latitude: -5.145,
    elevation: 27,
    server_seedlink: 'demo-seedlink.mhews.local',
    server_fdsn: 'demo-fdsn.mhews.local',
    status: 'enabled'
  },
  {
    _id: 'station-jay03',
    name: 'Jayapura Highlands',
    code: 'JAY03',
    network: 'GE',
    location: '00',
    channel: ['HHZ', 'HHN', 'HHE'],
    longitude: 140.703,
    latitude: -2.561,
    elevation: 35,
    server_seedlink: 'demo-seedlink.mhews.local',
    server_fdsn: 'demo-fdsn.mhews.local',
    status: 'enabled'
  },
  {
    _id: 'station-bdg07',
    name: 'Bandung Control Station',
    code: 'BDG07',
    network: 'GE',
    location: '00',
    channel: ['EHZ', 'EHN', 'EHE'],
    longitude: 107.6191,
    latitude: -6.9175,
    elevation: 708,
    server_seedlink: 'demo-seedlink.mhews.local',
    server_fdsn: 'demo-fdsn.mhews.local',
    status: 'enabled'
  }
]

const mockProfile: User = {
  _id: 'user-demo-analyst',
  username: 'Frontend Analyst',
  role: 'admin',
  region: 'Indonesia Demo Region',
  stations: mockStations.map((station) => station._id),
  disable_stations: [mockStations[5]._id]
}

const mockUsers: User[] = [
  mockProfile,
  {
    _id: 'user-ops-shift',
    username: 'Shift Ops',
    role: 'operator',
    region: 'Sulawesi',
    stations: [mockStations[0]._id, mockStations[3]._id],
    disable_stations: []
  },
  {
    _id: 'user-map-analyst',
    username: 'Map Analyst',
    role: 'analyst',
    region: 'Maluku',
    stations: [mockStations[1]._id, mockStations[2]._id, mockStations[4]._id],
    disable_stations: []
  }
]

const createPick = (id: string, stationId: string, timestamp: string): Pick => ({
  _id: id,
  station_id: stationId,
  timestamp,
  created_at: timestamp
})

const createArrival = ({
  id,
  station,
  pick,
  timestamp,
  phaseType,
  checked = true
}: {
  id: string
  station: Station
  pick: Pick
  timestamp: string
  phaseType: 'P' | 'S'
  checked?: boolean
}): Arrival => ({
  _id: id,
  pick_source_id: pick,
  pick_details: {
    ...pick,
    channel: station.channel[0]
  } as Pick & { channel?: string },
  station_id: station,
  station_details: station,
  timestamp,
  phase_type: phaseType,
  created_at: timestamp,
  checked
})

const stationsForEvent = mockStations.slice(0, 4)
const eventPicks = stationsForEvent.map((station, index) =>
  createPick(
    `pick-${station.code.toLowerCase()}`,
    station._id,
    formatISO(new Date(now.getTime() + index * 20_000))
  )
)

const eventArrivals = stationsForEvent.flatMap((station, index) => {
  const pick = eventPicks[index]
  const pTime = formatISO(new Date(now.getTime() + index * 20_000 + 8_000))
  const sTime = formatISO(new Date(now.getTime() + index * 20_000 + 16_000))

  return [
    createArrival({
      id: `arrival-${station.code.toLowerCase()}-p`,
      station,
      pick,
      timestamp: pTime,
      phaseType: 'P'
    }),
    createArrival({
      id: `arrival-${station.code.toLowerCase()}-s`,
      station,
      pick,
      timestamp: sTime,
      phaseType: 'S'
    })
  ]
})

const alternateArrivals = mockStations.slice(2, 6).flatMap((station, index) => {
  const pick = createPick(
    `pick-alt-${station.code.toLowerCase()}`,
    station._id,
    formatISO(new Date(now.getTime() - 120_000 + index * 25_000))
  )

  return [
    createArrival({
      id: `arrival-alt-${station.code.toLowerCase()}-p`,
      station,
      pick,
      timestamp: formatISO(new Date(now.getTime() - 120_000 + index * 25_000 + 10_000)),
      phaseType: 'P',
      checked: index < 3
    }),
    createArrival({
      id: `arrival-alt-${station.code.toLowerCase()}-s`,
      station,
      pick,
      timestamp: formatISO(new Date(now.getTime() - 120_000 + index * 25_000 + 22_000)),
      phaseType: 'S',
      checked: index < 3
    })
  ]
})

const preferredOrigin: Origin = {
  _id: 'origin-demo-primary',
  name: 'Primary Origin',
  origin_time: '2026-04-18T10:22:15.000Z',
  arrival_ids: eventArrivals.map((arrival) => arrival._id),
  arrivals: eventArrivals,
  longitude: 119.955,
  latitude: -0.712,
  depth: 18.6,
  region: 'Central Sulawesi',
  sub_region: 'Makassar Strait',
  terrain: 'Marine',
  country: 'Indonesia',
  magnitude_ids: ['mag-demo-primary-mw', 'mag-demo-primary-ml'],
  station_magnitude_ids_per_type: [],
  modified_by: mockProfile._id,
  auto_origin_ref_id: 'auto-origin-demo',
  created_at: '2026-04-18T10:22:20.000Z',
  magnitudes: [createMagnitude('demo-primary', 'Mw', 5.8), createMagnitude('demo-primary', 'Ml', 5.5)],
  err_epicenter: 11.2,
  gap: 126,
  rms: 0.31
}

const revisedOrigin: Origin = {
  ...preferredOrigin,
  _id: 'origin-demo-revised',
  name: 'Reviewed Origin',
  origin_time: '2026-04-18T10:22:17.000Z',
  depth: 16.4,
  longitude: 119.944,
  latitude: -0.705,
  magnitudes: [createMagnitude('demo-revised', 'Mw', 5.9), createMagnitude('demo-revised', 'Mb', 5.6)],
  modified_by: 'user-ops-shift',
  err_epicenter: 8.6,
  gap: 112,
  rms: 0.24,
  arrivals: alternateArrivals,
  arrival_ids: alternateArrivals.map((arrival) => arrival._id)
}

const mockEvents: EarthQuakeEvent[] = [
  {
    _id: 'event-demo-001',
    name: 'Makassar Strait Event',
    origin_ids: [preferredOrigin._id, revisedOrigin._id],
    origins: preferredOrigin,
    preferred_origin_id: preferredOrigin._id,
    created_at: '2026-04-18T10:22:20.000Z'
  },
  {
    _id: 'event-demo-002',
    name: 'North Maluku Offshore Event',
    origin_ids: ['origin-demo-002'],
    origins: {
      ...preferredOrigin,
      _id: 'origin-demo-002',
      name: 'North Maluku Origin',
      origin_time: '2026-04-17T03:11:05.000Z',
      longitude: 127.418,
      latitude: 0.821,
      depth: 32.4,
      region: 'North Maluku',
      sub_region: 'Ternate Offshore',
      magnitudes: [createMagnitude('demo-002', 'Mw', 6.2)],
      arrivals: eventArrivals.slice(0, 4),
      arrival_ids: eventArrivals.slice(0, 4).map((arrival) => arrival._id),
      err_epicenter: 15.1,
      gap: 138,
      rms: 0.42
    },
    preferred_origin_id: 'origin-demo-002',
    created_at: '2026-04-17T03:11:12.000Z'
  },
  {
    _id: 'event-demo-003',
    name: 'Banda Arc Event',
    origin_ids: ['origin-demo-003'],
    origins: {
      ...preferredOrigin,
      _id: 'origin-demo-003',
      name: 'Banda Arc Origin',
      origin_time: '2026-04-16T13:05:00.000Z',
      longitude: 129.155,
      latitude: -5.673,
      depth: 74.8,
      region: 'Banda Sea',
      sub_region: 'Banda Arc',
      magnitudes: [createMagnitude('demo-003', 'Mw', 5.1)],
      err_epicenter: 19.4,
      gap: 149,
      rms: 0.55
    },
    preferred_origin_id: 'origin-demo-003',
    created_at: '2026-04-16T13:05:06.000Z'
  }
]

const mockEventDetails: Record<string, EarthQuakeEventDetail> = {
  'event-demo-001': {
    _id: 'event-demo-001',
    name: 'Makassar Strait Event',
    origin_ids: [preferredOrigin._id, revisedOrigin._id],
    origins: [preferredOrigin, revisedOrigin],
    preferred_origin_id: preferredOrigin._id,
    created_at: '2026-04-18T10:22:20.000Z'
  },
  'event-demo-002': {
    ...mockEvents[1],
    origins: [mockEvents[1].origins]
  },
  'event-demo-003': {
    ...mockEvents[2],
    origins: [mockEvents[2].origins]
  }
}

const mockOriginDetails: Record<string, OriginDetail> = {
  [preferredOrigin._id]: {
    ...preferredOrigin,
    station_magnitude_ids_per_type: createStationMagnitudeGroups(preferredOrigin)
  },
  [revisedOrigin._id]: {
    ...revisedOrigin,
    station_magnitude_ids_per_type: createStationMagnitudeGroups(revisedOrigin)
  },
  'origin-demo-002': {
    ...mockEvents[1].origins,
    station_magnitude_ids_per_type: createStationMagnitudeGroups(mockEvents[1].origins)
  },
  'origin-demo-003': {
    ...mockEvents[2].origins,
    station_magnitude_ids_per_type: createStationMagnitudeGroups(mockEvents[2].origins)
  }
}

function createStationMagnitudeGroups(origin: Origin): StationMagnitudeIdsPerType[] {
  const stations = origin.arrivals.map((arrival) => arrival.station_details)
  const uniqueStations = stations.filter((station, index) => stations.findIndex((item) => item._id === station._id) === index)

  return ['Ml', 'Mw'].map((type, typeIndex) => ({
    type,
    station_magnitude_ids: uniqueStations.map((station) => `${origin._id}-${type.toLowerCase()}-${station._id}`),
    station_magnitudes: uniqueStations.map((station, stationIndex) => ({
      _id: `${origin._id}-${type.toLowerCase()}-${station._id}`,
      type,
      value: Number((5 + typeIndex * 0.4 + stationIndex * 0.08).toFixed(2)),
      modified_by: mockProfile._id,
      created_at: origin.created_at,
      pick_source_id: `${origin._id}-pick-${station._id}`,
      station_id: station._id,
      station_details: [station],
      waveform_start: formatISO(subMinutes(new Date(origin.origin_time), 3)),
      waveform_end: formatISO(new Date(origin.origin_time))
    }))
  }))
}

export const frontendOnlyProfileResponse: APIResponse<User> = {
  status: true,
  message: 'Frontend-only demo profile loaded.',
  data: mockProfile
}

export const frontendOnlyLoginResponse: LoginResponse = {
  status: true,
  data: {
    id: mockProfile._id,
    username: mockProfile.username,
    region: mockProfile.region,
    access_token: 'frontend-only-token'
  }
}

export const frontendOnlyLatestEvent: LatestEventResponse = {
  time: '2026-04-18 10:22 UTC',
  magnitude: 'Mw 5.8',
  location: 'Makassar Strait, Indonesia',
  depth: '18.6 km'
}

export const frontendOnlyGlobalBValue: GlobalBValueResponse = {
  b_value: 0.92,
  total_events: mockEvents.length
}

export const frontendOnlyWadatiPlot: { data: WadatiPlotResponse } = {
  data: {
    image: TRANSPARENT_PNG_BASE64,
    total_event: mockEvents.length,
    ratio: 1.74
  }
}

export const frontendOnlyBValuePlot: { data: BValuePlotResponse } = {
  data: {
    image: TRANSPARENT_PNG_BASE64,
    b_value: 0.92,
    a_value: 4.11,
    total_events: mockEvents.length
  }
}

export const frontendOnlyArrivalCatalog = {
  file: btoa('Frontend-only demo mode\nNo backend catalog was generated.\n')
}

export const frontendOnlyWaveformStatusByStationId: Record<string, StationWaveformStatus> = Object.fromEntries(
  mockStations.map((station, index) => [
    station._id,
    {
      ...station,
      delay_second: 1 + index,
      spike_amplitude: 12 + index * 2,
      displacement: Number((0.3 + index * 0.07).toFixed(2)),
      velocity: Number((1.2 + index * 0.15).toFixed(2)),
      acceleration: Number((2.8 + index * 0.3).toFixed(2))
    }
  ])
)

export const getFrontendOnlyEvents = (params?: GetAllEventListQuery) => {
  const page = params?.page ?? 1
  const totalPerPage = params?.totalPerPage ?? mockEvents.length
  const startIndex = (page - 1) * totalPerPage
  const pagedData = mockEvents.slice(startIndex, startIndex + totalPerPage)

  return {
    data: pagedData,
    total: mockEvents.length
  }
}

export const getFrontendOnlyEventDetail = (eventId: string): EarthQuakeEventDetail =>
  mockEventDetails[eventId] ?? mockEventDetails['event-demo-001']

export const getFrontendOnlyOriginDetail = (originId: string): OriginDetail =>
  mockOriginDetails[originId] ?? mockOriginDetails[preferredOrigin._id]

export const getFrontendOnlyStations = (params?: GetStationListQuery) => {
  const query = params?.q?.toLowerCase().trim()
  const filtered = query
    ? mockStations.filter((station) =>
        [station.name, station.code, station.network].some((value) => value.toLowerCase().includes(query))
      )
    : mockStations
  const page = params?.page ?? 1
  const limit = params?.limit ?? filtered.length
  const startIndex = (page - 1) * limit

  return {
    data: filtered.slice(startIndex, startIndex + limit),
    total: filtered.length
  }
}

export const getFrontendOnlyUsers = (params?: GetAllUserListQuery) => {
  const query = params?.q?.toLowerCase().trim()
  const filtered = query
    ? mockUsers.filter((user) =>
        [user.username, user.region, user.role].some((value) => value.toLowerCase().includes(query))
      )
    : mockUsers
  const page = params?.page ?? 1
  const limit = params?.limit ?? filtered.length
  const startIndex = (page - 1) * limit

  return {
    data: filtered.slice(startIndex, startIndex + limit),
    total: filtered.length
  }
}

export const getFrontendOnlyRecordStream = ({
  network,
  station,
  channel,
  location,
  startTime,
  endTime
}: GetRecordStreamAPIProps): RecordStreamResponse => {
  const sampleCount = 3600
  const waveform = createSeismicWaveform({
    sampleCount,
    station,
    channel
  })

  return {
    date: startTime.toISOString(),
    time_start: startTime.toISOString(),
    time_end: endTime.toISOString(),
    sampling_rate: 40,
    delta: 0.025,
    location,
    npts: waveform.length,
    station,
    network,
    channel,
    expiration_timestamp: Date.now() + 60_000,
    waveform
  }
}

export const getFrontendOnlyPSTheoretical = (): PSTheoriticalResponse => ({
  arrival: {
    P: 12.6,
    S: 21.3
  }
})

export const getFrontendOnlyCommitResponse = (eventId: string, originId: string) => ({
  status: true,
  data: {
    _id: eventId,
    updated_origin_id: originId
  } as EventCommitResponse & { updated_origin_id: string }
})

export const getFrontendOnlyStationPayloadPreview = (payload: AddStationPayload) => payload
export const getFrontendOnlyUserPayloadPreview = (payload: AddUserPayload | UpdateUserPayload) => payload

export const frontendOnlyNoopResponse = {
  status: true,
  message: 'Frontend-only mode: action not persisted.'
}

export { mockEvents, mockEventDetails, mockOriginDetails, mockProfile, mockStations, mockUsers }
