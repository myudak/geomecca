<script setup lang="ts">
import useHistoryPickList from '@src/hooks/use-history-pick-list'
import { PhaseType, StationWaveForm } from '@src/types/waveform'
import { bandpassFilter } from '@src/utils/filter'
import * as d3 from 'd3'
import { addSeconds, subSeconds } from 'date-fns'
import { Socket } from 'socket.io-client'
import { onMounted, onUnmounted, ref, watch } from 'vue'

import { getStartIndex } from './utils'

interface FilterConfig {
  low: number
  high: number
}

const props = defineProps<{
  channel: {
    channelName: string
    stationId: string
  }
  startTime: number
  endTime: number
  height: number
  width: number
  socket: Socket
  xScale: d3.ScaleTime<number, number, never>
  filterConfig?: FilterConfig
  showToggle?: boolean
  enabled?: boolean
}>()

defineEmits<{
  (e: 'toggle'): void
}>()

const { channel, socket, startTime } = props
const waveforms = ref<StationWaveForm[]>([])
const canvas = ref<HTMLCanvasElement | null>(null)
const lastReceiveTime = ref<number | null>(null)
const lastReceiveInterval = ref<number | null>(null)

const { channelName } = channel
const [network, code] = channelName.split('.')
const eventName = `data-${channelName}`

useHistoryPickList(channel.stationId, `${network}.${code}`)

const updateInfo = (max: number | null, avg: number | null) => {
  const stationInfo = document.querySelector(`#station-info-${channel.channelName.replace(/\./g, '-')}`)
  if (!stationInfo) return

  const maxInfo = stationInfo.querySelector('.info-max')
  if (maxInfo && max) {
    maxInfo.textContent = Math.round(max).toString()
  }

  const avgInfo = stationInfo.querySelector('.info-avg')
  if (avgInfo && avg) {
    avgInfo.textContent = parseFloat(avg.toFixed(2)).toString()
  }
}

const drawPick = (
  bufferCtx: CanvasRenderingContext2D,
  xScale: d3.ScaleTime<number, number, never>,
  position: Date,
  phaseType: PhaseType,
  newHeight: number,
  from?: 'ARRIVAL' | 'PICK'
) => {
  const x = xScale(position)

  const getColor = () => {
    if (phaseType === 'S') return '#38BDF8'
    return from === 'PICK' ? '#22c55e' : '#DF2C2C'
  }

  const color = getColor()

  bufferCtx.beginPath()
  bufferCtx.moveTo(x, 0)
  bufferCtx.lineWidth = 2
  bufferCtx.lineTo(x, newHeight)
  bufferCtx.strokeStyle = color
  bufferCtx.stroke()

  bufferCtx.beginPath()
  bufferCtx.font = 'bold 13px Arial'
  bufferCtx.fillStyle = color
  bufferCtx.fillText(phaseType, x + 2, 14)
}

const drawAllPicks = (
  bufferContext: CanvasRenderingContext2D,
  xScale: d3.ScaleTime<number, number, never>,
  newHeight: number
) => {
  const picks = window.socketData?.[`${network}.${code}`]?.picks
  if (!picks) return
  Object.values(picks)?.forEach((pick) => {
    let timestamp = pick.timestamp
    if (!timestamp.includes('Z')) {
      timestamp = `${timestamp}Z`
    }
    drawPick(bufferContext, xScale, new Date(timestamp), 'P', newHeight, 'PICK')
  })
}

const drawAllArrivals = (
  bufferContext: CanvasRenderingContext2D,
  xScale: d3.ScaleTime<number, number, never>,
  newHeight: number
) => {
  const arrivals = window.socketData?.[`${network}.${code}`]?.arrivals
  if (!arrivals) return

  const allArrivals = Object.values(arrivals).flat()

  allArrivals.forEach((arrival) => {
    let timestamp = arrival.timestamp
    if (!timestamp.includes('Z')) {
      timestamp = `${timestamp}Z`
    }
    drawPick(bufferContext, xScale, new Date(timestamp), arrival.phase_type, newHeight)
  })
}

const createLine = (props: {
  data: StationWaveForm[]
  canvasCtx: CanvasRenderingContext2D
  newStartTime: number
  newEndTime: number
  newWidth: number
  newHeight: number
  newXScale: d3.ScaleTime<number, number, never>
  newFilterConfig?: FilterConfig
}) => {
  const { data, canvasCtx, newStartTime, newWidth, newHeight, newXScale, newFilterConfig } = props

  const { min, max } = data.reduce(
    (curr, waveform) => {
      const startIndex = getStartIndex(waveform, startTime)
      const waveformValues = waveform.waveform.slice(startIndex)
      return {
        min: Math.min(curr.min, ...waveformValues),
        max: Math.max(curr.max, ...waveformValues)
      }
    },
    {
      min: Infinity,
      max: -Infinity
    }
  )
  const yScale = d3.scaleLinear().domain([min, max]).range([newHeight, 0])

  const buffer = document.createElement('canvas')
  buffer.width = newWidth
  buffer.height = newHeight
  const bufferCtx = buffer.getContext('2d')!
  bufferCtx.clearRect(0, 0, newWidth, newHeight)
  bufferCtx.beginPath()

  let firstIndex = true
  let total = 0
  let length = 0

  data.forEach((d) => {
    const { starttime: start_time, delta, waveform: wv, sampling_rate } = d
    const startIndex = getStartIndex(d, newStartTime)
    const filteredWaveform = newFilterConfig
      ? bandpassFilter(wv, sampling_rate, newFilterConfig.low, newFilterConfig.high)
      : wv

    for (let index = startIndex; index < wv.length; index++) {
      const w = filteredWaveform[index]
      const time = addSeconds(new Date(start_time), delta * index).getTime()

      const x = newXScale(time)
      const y = yScale(w)

      if (firstIndex) {
        bufferCtx.moveTo(x, y)
        firstIndex = false
      } else {
        bufferCtx.lineTo(x, y)
      }

      total += w
    }

    length += wv.length - startIndex + 1
  })

  updateInfo(max, total / length)

  bufferCtx.strokeStyle = '#22d3ee' // Cyan color to match the image
  bufferCtx.lineWidth = 1
  bufferCtx.stroke()
  drawAllArrivals(bufferCtx, newXScale, newHeight)
  drawAllPicks(bufferCtx, newXScale, newHeight)
  canvasCtx.clearRect(0, 0, newWidth, newHeight)
  canvasCtx.drawImage(buffer, 0, 0)
  buffer.remove()
}

const drawChart = (
  data: StationWaveForm[],
  newStartTime: number,
  newEndTime: number,
  newWidth: number,
  newHeight: number,
  newXScale: d3.ScaleTime<number, number, never>,
  newFilterConfig?: FilterConfig
) => {
  if (!canvas.value) return

  const canvasContext = d3
    .select(canvas.value)
    .attr('width', newWidth)
    .attr('height', newHeight)
    .node()!
    .getContext('2d')!

  if (!data.length) {
    const buffer = document.createElement('canvas')
    buffer.width = newWidth
    buffer.height = newHeight
    const bufferCtx = buffer.getContext('2d')!
    bufferCtx.clearRect(0, 0, newWidth, newHeight)
    bufferCtx.beginPath()

    canvasContext.clearRect(0, 0, newWidth, newHeight)
    canvasContext.drawImage(buffer, 0, 0)

    buffer.remove()
    return
  }

  requestAnimationFrame(() =>
    createLine({
      data,
      newStartTime,
      newEndTime,
      newWidth,
      newHeight,
      canvasCtx: canvasContext,
      newXScale,
      newFilterConfig
    })
  )
}

const onEventReceived = (event: StationWaveForm[]) => {
  lastReceiveTime.value = Date.now()

  if (event.length === 0) {
    waveforms.value = []
    return
  }

  const newWaveforms: StationWaveForm[] = []
  let endTime = 0

  for (const w of event) {
    if (new Date(w.starttime).getTime() <= endTime) continue
    endTime = new Date(w.endtime).getTime()
    newWaveforms.push(w)
  }

  waveforms.value = newWaveforms
}

const reEmitWaveform = () => {
  socket.off(eventName, onEventReceived)
  socket.emit('waveform', channelName)
  socket.on(eventName, onEventReceived)
}

onMounted(() => {
  socket.emit('waveform', channelName)
  socket.on(eventName, onEventReceived)

  lastReceiveInterval.value = setInterval(() => {
    if (!lastReceiveTime.value) {
      reEmitWaveform()
    } else if (subSeconds(new Date(), 15).getTime() > lastReceiveTime.value) {
      reEmitWaveform()
    }
  }, 15_000)
})

onUnmounted(() => {
  socket.off(eventName, onEventReceived)
  if (lastReceiveInterval.value) {
    clearInterval(lastReceiveInterval.value)
  }
})

watch(
  [
    () => props.startTime,
    () => props.endTime,
    waveforms,
    () => props.width,
    () => props.height,
    () => props.xScale,
    () => props.filterConfig
  ],
  ([newStartTime, newEndTime, newWaveforms, newWidth, newHeight, newXScale, newFilterConfig], [oldStartTime]) => {
    if (newStartTime !== oldStartTime) {
      drawChart(newWaveforms, newStartTime, newEndTime, newWidth, newHeight, newXScale, newFilterConfig)
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex items-center h-full w-full relative group" :style="{ height: `${height}px` }">
    <!-- Left Side - Station Info -->
    <div
      class="flex items-center justify-between px-6 py-3 bg-gray-100 dark:bg-[#202020] backdrop-blur-sm border-r border-gray-200 dark:border-gray-700 min-w-[280px] w-[280px] h-full shrink-0">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <input
            v-if="showToggle"
            :checked="enabled"
            type="checkbox"
            class="toggle toggle-success rounded-full"
            style="--tglbg: #10b981; background-color: transparent"
            @click="$emit('toggle')" />
          <div class="font-bold text-gray-900 dark:text-white text-sm">{{ channelName }}</div>
        </div>
        <div :id="`station-info-${channelName.replace(/\./g, '-')}`" class="flex gap-1 text-xs">
          <div class="text-error font-semibold">
            <span class="text-error/70">Max: </span>
            <span class="info-max">5805</span>
          </div>
          <div class="text-error font-semibold">
            <span class="text-error/70"> avg: -</span>
            <span class="info-avg">204.00</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side - Waveform Canvas -->
    <div
      class="flex-1 h-full bg-white dark:bg-black border-b border-gray-200 dark:border-[#1c1c1c] relative overflow-hidden">
      <canvas ref="canvas" class="h-full w-full" :style="{ width: `${width - 280}px` }" />

      <!-- Hover overlay for better interaction feedback -->
      <div class="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-all pointer-events-none"></div>
    </div>
  </div>
</template>
