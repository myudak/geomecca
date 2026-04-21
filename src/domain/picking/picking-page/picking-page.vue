<script setup lang="ts">
import { TRACEVIEW_FILTERED_CHANNEL } from '@src/constants/waveform'
import { usePickerStore } from '@src/stores/picker'
import { Arrival } from '@src/types/arrival'
import { EarthQuakeEventDetail } from '@src/types/event'
import { Station } from '@src/types/station'
import { OrderPhaseType, PhaseType } from '@src/types/waveform'
import { getChannelByOrder, sortStationChannelByPriority } from '@src/utils/station'
import { getPreferredOrigin, newISODate } from '@src/utils/string'
import * as d3 from 'd3'
import { addMilliseconds, addMinutes, differenceInMilliseconds, differenceInMinutes, subMinutes } from 'date-fns'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { ArrivalPickerWaveformItem } from '../arrival-picker-waveform-item'
import { PickingArrivalWaveformItem } from '../picking-arrival-waveform-item'
import { PickingFilter } from '../picking-filter'

interface SelectedArrival {
  p?: Arrival
  s?: Arrival
}

interface StationAndArrival {
  station: Station
  arrivals: SelectedArrival
  updatedArrivals: SelectedArrival
}

type PickId = string

const { event, originId } = defineProps<{
  event: EarthQuakeEventDetail
  originId?: string
}>()

const router = useRouter()

const goBack = () => {
  router.back()
}

const pickerStore = usePickerStore()

const preferredOrigin = getPreferredOrigin(event, originId)!
const container = ref<HTMLDivElement | null>(null)
const arrivals = computed(() => preferredOrigin.arrivals ?? [])
const originTime = newISODate(preferredOrigin.origin_time)
const startTime = ref<Date | null>(null)
const endTime = ref<Date | null>(null)
const diffTime = ref<number | null>(null)
const width = ref<number | null>(null)
const xScale = ref<d3.ScaleTime<number, number, never> | null>(null)
const selectedPhase = ref<PhaseType>('P')
const orderPhase = ref<OrderPhaseType>('OT')
const arrivalByPickId = ref<Record<PickId, StationAndArrival>>({})
const selectedPickId = ref<PickId | null>(null)
const selectedArrivalByPickId = ref<StationAndArrival | null>(null)

const selectedStation = computed<Station | null>(() => {
  if (!selectedArrivalByPickId.value) return null
  const station = selectedArrivalByPickId.value.station
  const firstChannel = getChannelByOrder(station, [...TRACEVIEW_FILTERED_CHANNEL, ...station.channel])!
  const channelFirstChar = firstChannel[0].toLowerCase()
  const allChannels = station.channel.filter((channel) => channel.toLowerCase().startsWith(channelFirstChar))

  return {
    ...station,
    channel: sortStationChannelByPriority(allChannels.slice(0, 3))
  }
})

const getMinDateBetween = (dateA: number, dateB?: string) => {
  if (!dateB) return dateA
  return newISODate(dateB).getTime() < dateA ? newISODate(dateB).getTime() : dateA
}

const firstPoint = computed(() => {
  const values = Object.values(arrivalByPickId.value)

  let firstP = Infinity
  let firstS = Infinity

  for (const value of values) {
    firstP = getMinDateBetween(firstP, value.arrivals.p?.timestamp)
    firstS = getMinDateBetween(firstS, value.arrivals.s?.timestamp)
  }

  return {
    firstP,
    firstS
  }
})

const joinPSArrival = ({ p, s }: SelectedArrival): Arrival[] => {
  const joinedArrivals: Arrival[] = []
  if (p) joinedArrivals.push(p)
  if (s) joinedArrivals.push(s)
  return joinedArrivals
}

const onConfirm = () => {
  const arrivalWithUpdatedPick: Record<PickId, SelectedArrival> = {}

  Object.keys(arrivalByPickId.value)
    .filter((pickId) => Object.keys(arrivalByPickId.value[pickId]?.updatedArrivals ?? {}).length > 0)
    .forEach((pickId) => {
      arrivalWithUpdatedPick[pickId] = arrivalByPickId.value[pickId].updatedArrivals
    })

  pickerStore.updateEventPick({
    [event._id]: arrivalWithUpdatedPick
  })

  goBack()
}

const onSelectStation = (pickId: PickId) => {
  selectedArrivalByPickId.value = arrivalByPickId.value[pickId]
  selectedPickId.value = pickId
}

const onChangePhase = (date: Date) => {
  if (!selectedPickId.value || !selectedArrivalByPickId.value) return

  const newUpdatedArrival = { ...arrivalByPickId.value[selectedPickId.value] }

  if (selectedPhase.value === 'P') {
    newUpdatedArrival.updatedArrivals.p = {
      ...newUpdatedArrival.arrivals.p!,
      timestamp: date.toISOString()
    }
  } else {
    newUpdatedArrival.updatedArrivals.s = {
      ...newUpdatedArrival.arrivals.s!,
      timestamp: date.toISOString()
    }
  }

  arrivalByPickId.value[selectedPickId.value] = newUpdatedArrival
  selectedArrivalByPickId.value = newUpdatedArrival
}

const getStartTimeByPhase = (stationAndArrival: StationAndArrival) => {
  const firstP = firstPoint.value.firstP
  const firstS = firstPoint.value.firstS
  const arrivalP = stationAndArrival.arrivals.p?.timestamp
  const arrivalS = stationAndArrival.arrivals.s?.timestamp

  if (orderPhase.value === 'P' && firstP !== Infinity && arrivalP && diffTime.value) {
    const diffStartTime = differenceInMilliseconds(newISODate(arrivalP), new Date(firstP))
    const firstPPositionDate = subMinutes(new Date(firstP), 3)
    return addMilliseconds(firstPPositionDate, diffStartTime)
  }

  if (orderPhase.value === 'S' && firstS !== Infinity && arrivalS && diffTime.value) {
    const diffStartTime = differenceInMilliseconds(newISODate(arrivalS), new Date(firstS))
    const firstSPositionDate = subMinutes(new Date(firstS), 3)
    return addMilliseconds(firstSPositionDate, diffStartTime)
  }

  return startTime.value!
}

watch([container, startTime, endTime], ([newContainer, newStartTime, newEndTime]) => {
  if (newContainer && newStartTime && newEndTime) {
    const newWidth = newContainer.clientWidth
    width.value = newWidth
    xScale.value = d3.scaleUtc().domain([newStartTime.getTime(), newEndTime.getTime()]).range([0, newWidth])
  }
})

watch(
  [arrivals, pickerStore.events[event._id]],
  ([newArrivals, updatedPicker]) => {
    if (newArrivals.length > 0) {
      const allTimestamps = newArrivals.map((arrival) => newISODate(arrival.timestamp).getTime())
      const max = Math.max(...allTimestamps)
      const min = Math.min(...allTimestamps)

      startTime.value = subMinutes(new Date(min), 3)
      endTime.value = addMinutes(new Date(max), 3)
      diffTime.value = differenceInMinutes(endTime.value, startTime.value)

      arrivalByPickId.value = newArrivals.reduce<Record<PickId, StationAndArrival>>((curr, arrival) => {
        const pickId = arrival.pick_details?._id
        const isP = arrival.phase_type === 'P'

        if (!pickId) {
          return curr
        }

        if (!curr[pickId]) {
          curr[pickId] = {
            station: arrival.station_details,
            arrivals: {},
            updatedArrivals: {
              ...updatedPicker?.[pickId]
            }
          }
        }

        if (isP) {
          curr[pickId].arrivals['p'] = arrival
        } else {
          curr[pickId].arrivals['s'] = arrival
        }

        return curr
      }, {})
    }
  },
  { immediate: true }
)

watch(
  arrivalByPickId,
  (newArrivalByPickId) => {
    if (selectedArrivalByPickId.value) return

    const keys = Object.keys(newArrivalByPickId)
    if (!keys.length) return

    // Prefer stations that we know have MiniSEED data (PPL04, TCH02, TCH04)
    const preferredStations = ['PPL04', 'TCH02', 'TCH04']

    const preferredKey =
      keys.find((key) => preferredStations.includes(newArrivalByPickId[key].station.code)) ?? keys[0]

    selectedArrivalByPickId.value = newArrivalByPickId[preferredKey]
    selectedPickId.value = preferredKey
  },
  { immediate: true }
)
</script>

<template>
  <section
    class="flex h-full flex-col gap-6 rounded-[32px] border border-brand-surface-light-active bg-brand-surface-light p-6 text-brand-text-light shadow dark:border-brand-surface-dark-hover dark:bg-brand-surface-darker dark:text-brand-text-dark">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <button
          class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-amber-400 hover:text-amber-500 dark:border-slate-700 dark:text-slate-300 dark:hover:border-amber-400 dark:hover:text-amber-300"
          type="button"
          @click="goBack">
          <v-icon name="io-chevron-back-sharp" />
        </button>
        <div>
          <p class="text-xs uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">Microseismic Analyst</p>
          <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">Arrival Picking Workspace</h2>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
          type="button"
          @click="onConfirm">
          <v-icon name="io-checkmark" />
        </button>
        <button
          class="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/30 transition hover:bg-rose-400"
          type="button"
          @click="goBack">
          <v-icon name="io-close-sharp" />
        </button>
      </div>
    </header>

    <div class="rounded-2xl border border-brand-surface-light-active bg-brand-surface-light-hover p-4 dark:border-brand-surface-dark-hover dark:bg-brand-surface-dark">
      <PickingFilter v-model:phase="selectedPhase" :order-phase="orderPhase" @change-order-phase="(newPhase) => (orderPhase = newPhase)" />
    </div>

    <div class="flex-1 overflow-hidden rounded-[28px] border border-brand-surface-light-active bg-brand-surface-light p-4 dark:border-brand-surface-dark-hover dark:bg-brand-surface-darker">
      <div ref="container" class="flex h-full flex-col gap-4">
        <div v-if="!!width && !!xScale && startTime && endTime && diffTime" class="flex-1 space-y-4">
          <div v-if="selectedArrivalByPickId && !!selectedStation" class="w-full rounded-2xl bg-slate-900/40 p-4">
            <ArrivalPickerWaveformItem
              :width="width"
              :x-scale="xScale"
              :station="selectedStation"
              :origin="preferredOrigin"
              :origin-time="originTime"
              :start-time="startTime"
              :end-time="endTime"
              :arrivals="selectedArrivalByPickId.arrivals"
              :updated-arrivals="selectedArrivalByPickId.updatedArrivals"
              @change-phase="onChangePhase" />
          </div>

          <div class="w-full rounded-2xl bg-slate-900/20 p-2">
            <div class="max-h-[320px] space-y-2 overflow-y-auto pr-1">
              <PickingArrivalWaveformItem
                v-for="pickId in Object.keys(arrivalByPickId)"
                :key="pickId"
                :selected="selectedPickId === pickId"
                :width="width"
                :origin="preferredOrigin"
                :origin-time="originTime"
                :start-time="getStartTimeByPhase(arrivalByPickId[pickId])"
                :end-time="addMinutes(getStartTimeByPhase(arrivalByPickId[pickId]), diffTime)"
                :station="arrivalByPickId[pickId].station"
                :arrivals="joinPSArrival(arrivalByPickId[pickId].arrivals)"
                :updated-arrivals="joinPSArrival(arrivalByPickId[pickId].updatedArrivals)"
                @select-station="onSelectStation(pickId)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
