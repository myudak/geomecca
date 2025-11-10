import { Origin } from './origin'

export interface EarthQuakeEvent {
  _id: string
  name: string
  origin_ids: string[]
  origins: Origin
  preferred_origin_id: string
  created_at: string
}

export interface EarthQuakeEventDetail extends Omit<EarthQuakeEvent, 'origins'> {
  origins: Origin[]
}

export interface EventCommitResponse {
  _id: string
}
