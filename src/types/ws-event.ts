import { Origin } from './origin'

export interface WSEvent {
  _id: string
  name: string
  origin_ids: string[]
  created_at: string
  origins: Origin[]
  preferred_origin: Origin
}

export interface Cluster {
  id: string
  picks: string[]
  network: string
  station: string
  timestamp: string
  origin_time: string
}

export interface Arrivals {
  P: P
  S: S
}

export interface P {
  id: string
  timestamp: string
  modified_by: string
}

export interface S {
  id: string
  timestamp: string
  modified_by: string
}

export interface Magnitude {
  type: string
  value: number
  modified_by: string
  id: string
}
