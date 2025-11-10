import { Arrival } from './arrival'
import { Magnitude } from './magnitude'

export interface Origin {
  _id: string
  name: string
  origin_time: string
  arrival_ids: string[]
  arrivals: Arrival[]
  longitude: number
  latitude: number
  depth: number
  region: string
  sub_region: string
  terrain: string
  country: string
  magnitude_ids: string[]
  station_magnitude_ids_per_type: unknown[]
  modified_by: unknown
  auto_origin_ref_id: unknown
  created_at: string
  magnitudes: Magnitude[]
  err_epicenter: number
  gap: number
  rms: number
}
