import { getStationListAPI } from '@src/api-service/station'
import { useQuery } from '@tanstack/vue-query'

const useGetStationList = () =>
  useQuery({
    queryKey: ['station-list'],
    queryFn: () => getStationListAPI()
  })

export default useGetStationList
