<script setup lang="ts">
import { EarthQuakeEvent } from '@src/types/event'
import {
  formatDate,
  formatDepth,
  formatLatLon,
  formatMagnitude,
  getDefaultMagnitude,
  newISODate
} from '@src/utils/string'
import { reverse, sortBy } from 'lodash'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  events: EarthQuakeEvent[]
}>()

const sortedEvents = ref<EarthQuakeEvent[]>([])

const router = useRouter()

const onEventClick = (event: EarthQuakeEvent) => {
  router.push(`/origin-locator-view/location/${event._id}`)
}

// Get magnitude badge color based on value
const getMagnitudeBadgeClass = (magnitude: number) => {
  if (magnitude >= 5.0) {
    return 'bg-red-500/90 text-white'
  } else if (magnitude >= 4.0) {
    return 'bg-orange-500/90 text-white'
  } else if (magnitude >= 3.0) {
    return 'bg-green-500/90 text-white'
  } else {
    return 'bg-blue-500/90 text-white'
  }
}

watch(
  () => props.events,
  (newEvents) => {
    sortedEvents.value = reverse(sortBy(newEvents, (event) => newISODate(event.origins?.origin_time).getTime()))
  },
  { immediate: true }
)
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full">
      <thead class="bg-gray-100 dark:bg-[#0f1419] sticky top-0 text-gray-700 dark:text-gray-300">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Origin Time</th>
          <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Latitude</th>
          <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Longitude</th>
          <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Magnitude</th>
          <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Depth</th>
          <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Region</th>
          <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Country</th>
        </tr>
      </thead>
      <tbody class="bg-white dark:bg-[#1a1f2e] divide-y divide-gray-200 dark:divide-gray-700">
        <tr
          v-for="event in sortedEvents"
          :key="event._id"
          class="cursor-pointer hover:bg-gray-50 dark:hover:bg-[#222a3a] transition-colors"
          @click="onEventClick(event)">
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
            {{ formatDate(event.origins.origin_time) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
            {{ formatLatLon(event.origins.latitude) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
            {{ formatLatLon(event.origins.longitude) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span
              :class="[
                'inline-flex items-center px-2.5 py-1 rounded-md font-semibold',
                getMagnitudeBadgeClass(getDefaultMagnitude(event.origins.magnitudes)?.value ?? 0)
              ]">
              {{ formatMagnitude(getDefaultMagnitude(event.origins.magnitudes)?.value ?? 0) }}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
            <span class="px-2.5 py-1 bg-gray-200 dark:bg-gray-700 rounded-md">
              {{ formatDepth(event.origins.depth) }}
            </span>
          </td>
          <td class="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">{{ event.origins.region }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
            {{ event.origins.country }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
