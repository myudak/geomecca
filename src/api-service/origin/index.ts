import api from '@src/utils/api'

import { OriginDetail, PSTheoriticalPayload, PSTheoriticalResponse } from './types'

export const postPSTheoritical = async (payload: PSTheoriticalPayload) => {
  const { data } = await api.post<{ data: PSTheoriticalResponse }>('/origin/psteoritical', payload)
  return data.data
}

export const getOriginDetail = async (originId: string) => {
  const { data } = await api.get<{ data: OriginDetail[] }>('/origin/getdetail', {
    params: {
      origin_id: originId
    }
  })
  return {
    ...data.data[0],
    station_magnitude_ids_per_type: data.data[0].station_magnitude_ids_per_type.filter(
      (smiprt) => !!smiprt.station_magnitudes?.[0]?._id
    )
  }
}
