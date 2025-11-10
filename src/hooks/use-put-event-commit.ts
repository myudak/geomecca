import { putEventCommitAPI } from '@src/api-service/event'
import { PutEventCommitAPIArrival } from '@src/api-service/event/types'
import { useMutation } from '@tanstack/vue-query'

interface UsePutEventCommitProps {
  eventId: string
  originId: string
  arrivals: PutEventCommitAPIArrival[]
}

const usePutEventCommit = () =>
  useMutation({
    mutationFn: (data: UsePutEventCommitProps) => putEventCommitAPI(data.eventId, data.originId, data.arrivals)
  })

export default usePutEventCommit
