import api from '@src/utils/api'
import { isFrontendOnly } from '@src/constants/env'
import { frontendOnlyArrivalCatalog } from '@src/mocks/frontend-only'
import { showFrontendOnlyToast } from '@src/utils/frontend-only'

import { PostArrivalCatalogResponse } from './types'

export const downloadArrivalCatalog = async (originId: string) => {
  if (isFrontendOnly) {
    showFrontendOnlyToast('Frontend-only mode: downloaded demo arrival catalog')
    return frontendOnlyArrivalCatalog
  }
  const { data } = await api.post<{ data: PostArrivalCatalogResponse }>('/arrivalkatalog/getarrivalkatalog', {
    origin_id: originId
  })
  return data.data
}
