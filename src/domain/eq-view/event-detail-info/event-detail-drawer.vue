<script setup lang="ts">
import { PickingArrivalWaveformItem } from '@src/domain/picking/picking-arrival-waveform-item'
import { TimestampAxis } from '@src/domain/trace-view/timestamp-axis'
import useGetEventDetail from '@src/hooks/use-get-event-detail'
import { Arrival } from '@src/types/arrival'
import { EarthQuakeEvent } from '@src/types/event'
import { Station } from '@src/types/station'
import { getChannelFullName } from '@src/utils/station'
import { formatDate, formatDepth, getDefaultMagnitude, getPreferredOrigin, newISODate } from '@src/utils/string'
import * as d3 from 'd3'
import { addMinutes, format, subMinutes } from 'date-fns'
import { computed, ref, watch } from 'vue'

const { event } = defineProps<{
  event: EarthQuakeEvent
}>()

defineEmits<{
  (e: 'close'): void
}>()

const { data: eventDetail, isLoading: isEventDetailLoading } = useGetEventDetail(event._id)

const preferredOrigin = computed(() => (eventDetail.value ? getPreferredOrigin(eventDetail.value) : null))
const arrivals = computed(() => preferredOrigin?.value?.arrivals ?? [])

const mappedArrival = computed(() =>
  arrivals.value.reduce<Record<string, { station: Station; arrivals: Arrival[]; channelName: string }>>(
    (curr, arrival, index) => {
      if (!arrival.pick_details || !arrival.station_details) {
        return curr
      }

      const pickId = arrival.pick_details._id ?? `pick-${index}`
      const channel =
        arrival.pick_details.channel ??
        arrival.station_details.channel?.[0] ??
        arrival.station_details.channel?.at?.(0) ??
        'DPZ'
      const channelName = getChannelFullName(arrival.station_details, channel)

      if (!curr[pickId]) {
        curr[pickId] = {
          station: arrival.station_details,
          arrivals: [arrival],
          channelName
        }
      } else {
        curr[pickId].arrivals.push(arrival)
      }
      return curr
    },
    {}
  )
)
const originTime = computed(() => (preferredOrigin.value ? newISODate(preferredOrigin.value.origin_time) : null))
const startTime = computed(() => (originTime.value ? subMinutes(originTime.value, 5) : null))
const endTime = computed(() => (originTime.value ? addMinutes(originTime.value, 5) : null))
const container = ref<HTMLDivElement | null>(null)
const width = ref<number | null>(null)
const xScale = ref<d3.ScaleTime<number, number, never> | null>(null)
const magnitude = computed(() => getDefaultMagnitude(preferredOrigin.value?.magnitudes ?? []))

const eventInfos = computed(() => [
  {
    label: 'Mag:',
    value: magnitude?.value?.value ?? '-'
  },
  {
    label: 'Depth:',
    value: formatDepth(event.origins.depth)
  },
  {
    label: 'Time:',
    value: originTime.value ? format(originTime.value, 'HH:mm:ss') : '-'
  },
  {
    label: 'Loc:',
    value: `${event.origins.latitude.toFixed(4)}, ${event.origins.longitude.toFixed(4)}`
  }
])

watch(
  [container, startTime, endTime],
  ([newContainer, newStartTime, newEndTime]) => {
    if (newContainer && newStartTime && newEndTime) {
      const newWidth = newContainer.clientWidth - 48
      width.value = newWidth
      xScale.value = d3.scaleUtc().domain([newStartTime.getTime(), newEndTime.getTime()]).range([0, newWidth])
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="drawer z-10">
    <input type="checkbox" class="drawer-toggle" :checked="true" />
    <div class="drawer-side w-auto">
      <div
        class="flex flex-col w-full h-full overflow-hidden max-w-xl bottom-0 left-0 fixed z-[9999] bg-white dark:bg-[#0f1419]">
        <!-- Header -->
        <div
          class="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1a1f2e] border-b border-gray-200 dark:border-gray-700">
          <div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Event</div>
            <div class="text-base font-semibold text-gray-900 dark:text-white truncate">
              {{ formatDate(event.origins.origin_time) }}
            </div>
          </div>
          <button
            class="btn btn-sm btn-ghost text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            @click="$emit('close')">
            <v-icon name="md-close" scale="1.2" />
          </button>
        </div>

        <!-- Event Info Grid -->
        <div class="grid grid-cols-2 gap-3 p-4">
          <div
            v-for="info in eventInfos"
            :key="info.label"
            class="bg-gray-50 dark:bg-[#1a1f2e] border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">{{ info.label }}</div>
            <div class="text-sm font-semibold text-gray-900 dark:text-white break-words">{{ info.value }}</div>
          </div>
        </div>

        <!-- Waveforms Container -->
        <div ref="container" class="flex-1 h-full overflow-hidden">
          <div
            v-if="isEventDetailLoading"
            class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            Loading...
          </div>
          <div
            v-else-if="!!originTime && !!endTime && !!startTime && !!width && !!xScale && !!preferredOrigin"
            class="flex flex-col h-full">
            <div class="flex-1 h-full overflow-y-auto px-4 pb-4 space-y-3">
              <div v-if="Object.values(mappedArrival).length === 0" class="text-xs text-gray-500 dark:text-gray-400">
                No arrivals available for this event.
              </div>
              <div
                v-for="(arrival, index) in Object.values(mappedArrival)"
                :key="index"
                class="bg-gray-50 dark:bg-[#1a1f2e] border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <div class="flex items-center justify-between mb-2">
                  <div class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ arrival.channelName }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Trace</div>
                </div>
                <div class="bg-gray-900 dark:bg-black rounded-lg overflow-hidden">
                  <PickingArrivalWaveformItem
                    :selected="false"
                    :width="width"
                    :origin="preferredOrigin"
                    :origin-time="originTime"
                    :start-time="startTime"
                    :end-time="endTime"
                    :station="arrival.station"
                    :arrivals="arrival.arrivals"
                    :x-scale="xScale">
                  </PickingArrivalWaveformItem>
                </div>
              </div>
            </div>
            <div class="px-4 pb-4">
              <TimestampAxis
                :width="width"
                :start-time="startTime.getTime()"
                :end-time="endTime.getTime()"
                time-format="%M:%S" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
