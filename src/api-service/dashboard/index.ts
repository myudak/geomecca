import api from '@src/utils/api'
import { isFrontendOnly } from '@src/constants/env'
import {
  getFrontendOnlyGlobalBValueSnapshot,
  getFrontendOnlyLatestEventSnapshot
} from '@src/mocks/frontend-only/realtime'

export interface LatestEventResponse {
  time: string
  magnitude: string
  location: string
  depth: string
}

export interface GlobalBValueResponse {
  b_value: number
  total_events: number
}

export const getLatestEvent = async () => {
  if (isFrontendOnly) {
    return { data: getFrontendOnlyLatestEventSnapshot() }
  }
  const { data } = await api.get<{ data: LatestEventResponse }>('/dashboard/latest-event')
  return data
}

export const getGlobalBValue = async () => {
  if (isFrontendOnly) {
    return { data: getFrontendOnlyGlobalBValueSnapshot() }
  }
  const { data } = await api.get<{ data: GlobalBValueResponse }>('/dashboard/global-bvalue')
  return data
}
