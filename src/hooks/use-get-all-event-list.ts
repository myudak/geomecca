import { isFrontendOnly } from '@src/constants/env'
import { frontendOnlyRealtimeVersion } from '@src/mocks/frontend-only/realtime'
import { getAllEventListAPI } from '@src/api-service/event'
import { GetAllEventListQuery } from '@src/api-service/event/types'
import { useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'

const useGetAllEventList = (params: GetAllEventListQuery) =>
  useQuery({
    queryKey: computed(() => [
      'all-event-list',
      params ? params : {},
      isFrontendOnly ? frontendOnlyRealtimeVersion.value : 'backend'
    ]),
    queryFn: () => getAllEventListAPI(params)
  })

export default useGetAllEventList
