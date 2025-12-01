import api from '@src/utils/api'

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
  const { data } = await api.get<{ data: LatestEventResponse }>('/dashboard/latest-event')
  return data
}

export const getGlobalBValue = async () => {
  const { data } = await api.get<{ data: GlobalBValueResponse }>('/dashboard/global-bvalue')
  return data
}
