import { API_BFF_URL } from '@src/constants/env'
import { isFrontendOnly } from '@src/constants/env'
import {
  frontendOnlyNoopResponse,
  frontendOnlyWaveformStatusByStationId,
  getFrontendOnlyStationPayloadPreview,
  getFrontendOnlyStations
} from '@src/mocks/frontend-only'
import { AddStationPayload, Station, StationWaveformStatus } from '@src/types/station'
import api from '@src/utils/api'
import { showFrontendOnlyToast } from '@src/utils/frontend-only'

import { GetStationListQuery, PutUpdateStationStatusPayload } from './types'

export const putUpdateStationStatusAPI = async (payload: PutUpdateStationStatusPayload) => {
  if (isFrontendOnly) {
    showFrontendOnlyToast()
    return {
      ...frontendOnlyNoopResponse,
      data: payload
    }
  }
  const { data } = await api.put('/station/updatestatus', payload)
  return data
}

export const getStationListAPI = async (params?: GetStationListQuery) => {
  if (isFrontendOnly) {
    return getFrontendOnlyStations(params)
  }
  const { data } = await api.get<{ data: { stations: Station[]; total?: number } }>('/station/getall', {
    params
  })

  return {
    data: data.data.stations,
    total: data.data.total
  }
}

export const getStationWaveformStatusAPI = async (stationId: string) => {
  if (isFrontendOnly) {
    return {
      data: frontendOnlyWaveformStatusByStationId[stationId] ?? frontendOnlyWaveformStatusByStationId['station-ppl04']
    }
  }
  const { data } = await api.get<{ data: StationWaveformStatus }>('/station/getwaveformstatus', {
    params: {
      station_id: stationId
    }
  })

  return data
}

export const postStationAPI = async (payload: AddStationPayload) => {
  if (isFrontendOnly) {
    showFrontendOnlyToast()
    return {
      ...frontendOnlyNoopResponse,
      data: getFrontendOnlyStationPayloadPreview(payload)
    }
  }
  const { data } = await api.post('/station', payload, {
    baseURL: API_BFF_URL
  })

  return data
}

export const putStationAPI = async (stationId: string, payload: AddStationPayload) => {
  if (isFrontendOnly) {
    showFrontendOnlyToast()
    return {
      ...frontendOnlyNoopResponse,
      data: {
        stationId,
        ...getFrontendOnlyStationPayloadPreview(payload)
      }
    }
  }
  const { data } = await api.put(`/station/${stationId}`, payload, {
    baseURL: API_BFF_URL
  })

  return data
}

export const deleteStationAPI = async (stationId: string) => {
  if (isFrontendOnly) {
    showFrontendOnlyToast()
    return {
      ...frontendOnlyNoopResponse,
      data: {
        stationId
      }
    }
  }
  const { data } = await api.delete(`/station/${stationId}`, {
    baseURL: API_BFF_URL
  })

  return data
}
