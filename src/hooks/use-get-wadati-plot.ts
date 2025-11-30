import { getWadatiPlot } from '@src/api-service/wadati'
import { useQuery } from '@tanstack/vue-query'

const useGetWadatiPlot = (originId: string) => {
  console.log('[useGetWadatiPlot] Hook called with originId:', originId)

  return useQuery({
    queryKey: ['wadati-plot', originId],
    queryFn: async () => {
      console.log('[useGetWadatiPlot] Fetching wadati plot for origin:', originId)
      try {
        const result = await getWadatiPlot(originId)
        console.log('[useGetWadatiPlot] API response:', result)
        return result
      } catch (error) {
        console.error('[useGetWadatiPlot] API error:', error)
        throw error
      }
    }
  })
}

export default useGetWadatiPlot
