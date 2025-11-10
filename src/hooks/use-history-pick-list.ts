import { RealtimeArrival, RealtimePick } from '@src/types/waveform'
import api from '@src/utils/api'
import { newISODate } from '@src/utils/string'
import { useQuery } from '@tanstack/vue-query'
import { subMinutes } from 'date-fns'
import { watch } from 'vue'

const useHistoryPickList = (stationId: string, channelName: string) => {
  const endDate = new Date()
  const startDate = subMinutes(endDate, 30)

  const params = {
    station_id: stationId,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString()
  }

  const { data: arrivalListData } = useQuery({
    queryKey: ['history-arrival-list', stationId],
    queryFn: async () => {
      const { data } = await api.get<{ data: RealtimeArrival[] }>('/arrival/getbystation', {
        params
      })

      return data
    }
  })

  const { data: pickListData, refetch: refetchPickList } = useQuery({
    enabled: false,
    queryKey: ['history-pick-list', stationId],
    queryFn: async () => {
      const { data } = await api.get<{ data: RealtimePick[] }>('/pick/getbystation', {
        params
      })

      return {
        data: data.data.map((d) => ({
          ...d,
          timestamp: newISODate(d.timestamp).toISOString()
        }))
      }
    }
  })

  watch(arrivalListData, (newData) => {
    const arrivals = (newData?.data ?? []).filter(
      (arrival) => newISODate(arrival.timestamp).getTime() > subMinutes(Date.now(), 30).getTime()
    )
    const windowArrivals: Record<string, RealtimeArrival[]> = {}

    for (const arrival of arrivals) {
      if (!windowArrivals[arrival.pick_source_id]) {
        windowArrivals[arrival.pick_source_id] = [arrival]
      } else {
        windowArrivals[arrival.pick_source_id].push(arrival)
      }
    }

    if (!window.socketData[channelName]) {
      window.socketData[channelName] = {
        picks: {},
        arrivals: windowArrivals
      }
    } else {
      window.socketData[channelName].arrivals = windowArrivals
    }

    refetchPickList()
  })

  watch(pickListData, (newData) => {
    const picks = newData?.data ?? []

    for (const pick of picks) {
      if (!window.socketData[channelName].arrivals[pick._id]) {
        window.socketData[channelName].picks[pick._id] = pick
      }
    }
  })
}

export default useHistoryPickList
