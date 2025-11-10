import { WadatiPlotResponse } from '@src/types/wadati'
import api from '@src/utils/api'

export const getWadatiPlot = async (originId: string) => {
  const { data } = await api.post<{ data: WadatiPlotResponse }>('/wadati/getplot', {
    origin_id: originId
  })
  return data
}
