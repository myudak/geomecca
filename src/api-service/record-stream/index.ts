import { API_STREAM_URL } from '@src/constants/env'
import { StationWaveForm } from '@src/types/waveform'
import api from '@src/utils/api'
import { getDayOfYear } from 'date-fns'

import { GetRecordStreamAPIProps } from './types'

export interface RecordStreamResponse extends Omit<StationWaveForm, 'starttime' | 'endtime' | 'waveform'> {
  time_start: string
  time_end: string
  waveform: Array<number | null>
}

export const getRecordStreamAPI = async ({
  network,
  station,
  channel,
  location,
  originTime,
  startTime,
  endTime
}: GetRecordStreamAPIProps) => {
  const year = originTime.getFullYear()
  const doy = getDayOfYear(originTime)

  const { data } = await api<{ data: RecordStreamResponse }>({
    method: 'GET',
    baseURL: API_STREAM_URL,
    url: '/recordstream/get',
    params: {
      year,
      network,
      station,
      location,
      channel,
      sds_type: 'D',
      doy,
      starttime: startTime,
      endtime: endTime
    }
  })

  return data.data
}
