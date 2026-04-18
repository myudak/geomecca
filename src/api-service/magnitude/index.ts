import api from '@src/utils/api'
import { isFrontendOnly } from '@src/constants/env'
import { frontendOnlyBValuePlot } from '@src/mocks/frontend-only'

export interface BValuePlotResponse {
  image: string
  b_value: number
  a_value: number
  total_events: number
}

export const getBValuePlot = async (originId: string) => {
  console.log('[API] getBValuePlot called with originId:', originId)

  if (isFrontendOnly) {
    return frontendOnlyBValuePlot
  }

  const requestBody = { origin_id: originId }
  console.log('[API] Request body:', requestBody)

  const { data } = await api.post<{ data: BValuePlotResponse }>('/magnitude/getbvalue', requestBody)

  console.log('[API] B-value Response data:', data)

  return data
}
