import api from '@src/utils/api'

import { PostArrivalCatalogResponse } from './types'

export const downloadArrivalCatalog = async (originId: string) => {
  const { data } = await api.post<{ data: PostArrivalCatalogResponse }>('/arrivalkatalog/getarrivalkatalog', {
    origin_id: originId
  })
  return data.data
}
