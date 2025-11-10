import { getWadatiPlot } from '@src/api-service/wadati'
import { useQuery } from '@tanstack/vue-query'

const useGetWadatiPlot = (originId: string) =>
  useQuery({
    queryKey: ['wadati-plot', originId],
    queryFn: () => getWadatiPlot(originId)
  })

export default useGetWadatiPlot
