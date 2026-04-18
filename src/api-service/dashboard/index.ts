import api from '@src/utils/api'
import { isFrontendOnly } from '@src/constants/env'
import { frontendOnlyGlobalBValue, frontendOnlyLatestEvent } from '@src/mocks/frontend-only'

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
    return { data: frontendOnlyLatestEvent }
  }
  const { data } = await api.get<{ data: LatestEventResponse }>('/dashboard/latest-event')
  return data
}

export const getGlobalBValue = async () => {
  if (isFrontendOnly) {
    return { data: frontendOnlyGlobalBValue }
  }
  const { data } = await api.get<{ data: GlobalBValueResponse }>('/dashboard/global-bvalue')
  return data
}
