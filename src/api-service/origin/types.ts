import { Magnitude } from '@src/types/magnitude'
import { Origin } from '@src/types/origin'
import { Station } from '@src/types/station'

export interface PSTheoriticalPayload {
  eq_origin_time: string
  eq_lat: number
  eq_lon: number
  eq_depth: number
  sta_lat: number
  sta_lon: number
}

export interface PSTheoriticalResponse {
  arrival: {
    P: string | number
    S: string | number
  }
}

export interface StationMagnitudeIdsPerType {
  type: string
  station_magnitude_ids: string[]
  station_magnitudes: StationMagnitude[]
}

export interface StationMagnitude extends Magnitude {
  pick_source_id: string
  station_id: string
  station_details: Station[]
  waveform_start: string
  waveform_end: string
}

export interface OriginDetail extends Origin {
  station_magnitude_ids_per_type: StationMagnitudeIdsPerType[]
}
