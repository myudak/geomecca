import { WadatiPlotResponse } from '@src/types/wadati'
import api from '@src/utils/api'
import { isFrontendOnly } from '@src/constants/env'
import { frontendOnlyWadatiPlot } from '@src/mocks/frontend-only'

export const getWadatiPlot = async (originId: string) => {
  console.log('[API] getWadatiPlot called with originId:', originId)

  if (isFrontendOnly) {
    return frontendOnlyWadatiPlot
  }

  const requestBody = { origin_id: originId }
  console.log('[API] Request body:', requestBody)

  const { data } = await api.post<{ data: WadatiPlotResponse }>('/wadati/getplot', requestBody)

  console.log('[API] Response data:', data)

  return data
}
