<script setup lang="ts">
import { postPSTheoritical } from '@src/api-service/origin'
import { PSTheoriticalResponse } from '@src/api-service/origin/types'
import { getRecordStreamAPI, RecordStreamResponse } from '@src/api-service/record-stream'
import { GetRecordStreamAPIProps } from '@src/api-service/record-stream/types'
import { TRACEVIEW_FILTERED_CHANNEL } from '@src/constants/waveform'
import { Arrival } from '@src/types/arrival'
import { Origin } from '@src/types/origin'
import { Station } from '@src/types/station'
import { PhaseType } from '@src/types/waveform'
import { getChannelByOrder, getChannelFullName } from '@src/utils/station'
import { newISODate } from '@src/utils/string'
import { getPhaseColor, getPhaseLabel } from '@src/utils/waveform'
import * as d3 from 'd3'
import { addSeconds } from 'date-fns'
import { ref, watch } from 'vue'

defineEmits<{
  (e: 'select-station', station: Station): void
}>()

const props = defineProps<{
  selected: boolean
  startTime: Date
  endTime: Date
  originTime: Date
  origin: Origin
  width: number
  station: Station
  arrivals: Arrival[]
  updatedArrivals?: Arrival[]
}>()

const { station, origin, originTime, startTime, endTime, width, arrivals } = props

const height = 70
const canvas = ref<HTMLCanvasElement | null>(null)
const channel = getChannelByOrder(station, [...TRACEVIEW_FILTERED_CHANNEL, ...station.channel])!
const canvasContextRef = ref<null | CanvasRenderingContext2D>(null)
const data = ref<RecordStreamResponse | null>(null)
const mappedValue = new Map<string, RecordStreamResponse>()
const psTheoritical = ref<PSTheoriticalResponse['arrival'] | null>(null)

const drawPick = (
  canvasContext: CanvasRenderingContext2D,
  newXScale: d3.ScaleTime<number, number, never>,
  position: Date,
  phaseType: PhaseType | 'OT' | 'Pn' | 'Sn',
  isUpdated = false
) => {
  const x = newXScale(position)

  const color = getPhaseColor(phaseType, isUpdated)

  canvasContext.beginPath()
  canvasContext.moveTo(x, 0)
  canvasContext.lineWidth = phaseType === 'OT' ? 1 : 2
  canvasContext.lineTo(x, height)
  canvasContext.strokeStyle = color
  canvasContext.stroke()

  if (phaseType !== 'OT') {
    canvasContext.beginPath()
    canvasContext.font = 'bold 11px Arial'
    canvasContext.fillStyle = color

    canvasContext.fillText(getPhaseLabel(phaseType, isUpdated), x + 2, 10)
  }
}

const drawChart = (
  newData: Pick<RecordStreamResponse, 'waveform' | 'delta'>,
  newPSTheoritical: PSTheoriticalResponse['arrival'] | null,
  newCanvas: HTMLCanvasElement,
  updatedArrivals: Arrival[],
  newStartTime: Date,
  newEndTime: Date
) => {
  const canvasContext = d3.select(newCanvas).attr('width', width).attr('height', height).node()!.getContext('2d')!
  const xScale = d3.scaleUtc().domain([newStartTime.getTime(), newEndTime.getTime()]).range([0, width])

  canvasContextRef.value = canvasContext

  if (!newData.waveform || newData.waveform.length === 0) {
    canvasContext.clearRect(0, 0, width, height)
    return
  }

  const filledWaveform = newData.waveform.map((waveform, index) => {
    if (waveform === null) {
      return newData.waveform[index - 1] ?? 0
    }
    return waveform
  })

  const min = Math.min(...filledWaveform)
  const max = Math.max(...filledWaveform)

  const yScale = d3.scaleLinear().domain([min, max]).range([height, 0])

  let firstIndex = true

  canvasContext.clearRect(0, 0, width, height)

  filledWaveform.forEach((waveform, index) => {
    const time = addSeconds(newStartTime, newData.delta * index).getTime()

    const x = xScale(time)
    const y = yScale(waveform)

    if (firstIndex) {
      canvasContext.moveTo(x, y)
      firstIndex = false
    } else {
      canvasContext.lineTo(x, y)
    }
  })

  canvasContext.strokeStyle = '#75ecb8'
  canvasContext.stroke()

  arrivals.forEach((arrival) => {
    const arrivalDate = typeof arrival.timestamp === 'string' ? newISODate(arrival.timestamp) : arrival.timestamp
    drawPick(canvasContext, xScale, arrivalDate, arrival.phase_type as PhaseType)
  })

  drawPick(canvasContext, xScale, new Date(originTime), 'OT')

  if (newPSTheoritical && typeof newPSTheoritical.P !== 'number' && typeof newPSTheoritical.S !== 'number') {
    drawPick(canvasContext, xScale, newISODate(newPSTheoritical.P), 'Pn')
    drawPick(canvasContext, xScale, newISODate(newPSTheoritical.S), 'Sn')
  }

  if (updatedArrivals) {
    updatedArrivals.forEach((arrival) => {
      drawPick(canvasContext, xScale, new Date(arrival.timestamp), arrival.phase_type as PhaseType, true)
    })
  }
}

const getRecordStream = async (props: GetRecordStreamAPIProps) => {
  const key: Record<string, string> = {
    ...props,
    endTime: props.endTime.getTime().toString(),
    startTime: props.startTime.getTime().toString(),
    originTime: props.originTime.getTime().toString()
  }
  const strKey = Object.keys(key).reduce((str, k) => `${str}-${k}_${key[k].toString()}`, '')

  if (mappedValue.has(strKey)) {
    return {
      recordStreamResponse: mappedValue.get(strKey)!,
      psTheoriticalResponse: psTheoritical.value!
    }
  }

  const [recordStreamResponse, psTheoriticalResponse] = await Promise.all([
    getRecordStreamAPI(props),
    postPSTheoritical({
      eq_origin_time: originTime.toISOString(),
      eq_lat: origin.latitude,
      eq_lon: origin.longitude,
      eq_depth: origin.depth,
      sta_lat: station.latitude,
      sta_lon: station.longitude
    })
  ])
  mappedValue.set(strKey, recordStreamResponse)
  psTheoritical.value = psTheoriticalResponse.arrival

  return { recordStreamResponse, psTheoriticalResponse: psTheoriticalResponse.arrival }
}

watch(
  [canvas, () => props.startTime, () => props.endTime],
  ([newCanvas, newStartTime, newEndTime]) => {
    if (!newCanvas) return

    getRecordStream({
      network: station.network,
      station: station.code,
      location: station.location,
      channel,
      originTime,
      startTime: newStartTime,
      endTime: newEndTime
    }).then(({ recordStreamResponse, psTheoriticalResponse }) => {
      drawChart(
        recordStreamResponse ?? { waveform: [], delta: 0.5 },
        psTheoriticalResponse ?? null,
        newCanvas,
        props.updatedArrivals ?? [],
        newStartTime,
        newEndTime
      )
    })
  },
  { immediate: true }
)

watch(
  () => props.updatedArrivals,
  (newUpdatedArrivals, oldUpdatedArrivals) => {
    if (
      newUpdatedArrivals?.[0]?.timestamp === oldUpdatedArrivals?.[0]?.timestamp &&
      newUpdatedArrivals?.[1]?.timestamp === oldUpdatedArrivals?.[1]?.timestamp
    )
      return
    drawChart(
      data.value ?? { waveform: [], delta: 0.5 },
      psTheoritical.value,
      canvas.value!,
      newUpdatedArrivals ?? [],
      startTime,
      endTime
    )
  }
)
</script>

<template>
  <div
    class="h-[70px] border-b border-b-white/10 hover:cursor-pointer relative"
    :class="{ 'bg-amber-500/20': selected, 'hover:bg-amber-500/10': !selected }"
    @click="$emit('select-station', station)">
    <canvas ref="canvas" class="w-full h-full" />
    <div
      class="absolute flex flex-col items-center justify-center text-xs top-0 left-0 w-[120px] h-full text-white font-semibold">
      <div class="bg-slate-700 rounded-2xl border border-primary/30 text-xs text-white px-2 py-1">
        {{ getChannelFullName(station, channel) }}
      </div>
    </div>
  </div>
</template>
