import { isFrontendOnly } from '@src/constants/env'
import { frontendOnlyRealtimeVersion } from '@src/mocks/frontend-only/realtime'
import { getEventDetailAPI } from '@src/api-service/event'
import { useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'

const useGetEventDetail = (eventId: string) =>
  useQuery({
    enabled: !!eventId,
    queryKey: computed(() => [
      'event-detail',
      eventId,
      isFrontendOnly ? frontendOnlyRealtimeVersion.value : 'backend'
    ]),
    queryFn: () => getEventDetailAPI(eventId)
  })

export default useGetEventDetail
