<script setup lang="ts">
import { EventListTable } from '@src/components/event-list-table'
import { EarthQuakeEvent } from '@src/types/event'
import { computed, ref } from 'vue'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'change-page', page: number): void
}>()

const props = defineProps<{
  events: EarthQuakeEvent[]
  totalPage: number
  page: number
}>()

// Filter states
const searchRegion = ref('')
const minMagnitude = ref('')

// Computed filtered events
const filteredEvents = computed(() => {
  let filtered = props.events

  if (searchRegion.value) {
    filtered = filtered.filter((event) =>
      event.origins.region?.toLowerCase().includes(searchRegion.value.toLowerCase())
    )
  }

  if (minMagnitude.value && !isNaN(parseFloat(minMagnitude.value))) {
    const minMag = parseFloat(minMagnitude.value)
    filtered = filtered.filter((event) => {
      const magnitude = event.origins.magnitudes.find((m) => m.type.toLowerCase() === 'mw')
      return magnitude && magnitude.value >= minMag
    })
  }

  return filtered
})

const totalEvents = computed(() => props.events.length)
const showingCount = computed(() => filteredEvents.value.length)

const canGoPrev = computed(() => props.page > 1)
const canGoNext = computed(() => props.page < props.totalPage)

const goToPrev = () => {
  if (canGoPrev.value) {
    emit('change-page', props.page - 1)
  }
}

const goToNext = () => {
  if (canGoNext.value) {
    emit('change-page', props.page + 1)
  }
}

const onRefresh = () => {
  searchRegion.value = ''
  minMagnitude.value = ''
}
</script>

<template>
  <div class="flex flex-col w-full h-full top-0 left-0 fixed z-[9999] bg-white dark:bg-[#1a1f2e]">
    <!-- Header with filters -->
    <div class="flex flex-col gap-4 p-6 bg-white dark:bg-[#1a1f2e] border-b border-gray-200 dark:border-gray-700">
      <!-- Title row -->
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">Events</h2>
        <button
          class="btn btn-sm btn-ghost text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          @click="$emit('close')">
          <v-icon name="md-close" scale="1.2" />
        </button>
      </div>

      <!-- Filters row -->
      <div class="flex items-end gap-4">
        <!-- Search Region -->
        <div class="flex-1">
          <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">Search Region</label>
          <input
            v-model="searchRegion"
            type="text"
            placeholder="e.g. Sulawesi, Sumatra"
            class="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0f1419] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors" />
        </div>

        <!-- Minimum Magnitude -->
        <div class="flex-1">
          <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">Minimum Magnitude</label>
          <input
            v-model="minMagnitude"
            type="text"
            placeholder="e.g. 3.0"
            class="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0f1419] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors" />
        </div>

        <!-- Date range and refresh (slot for DateFilter) -->
        <div class="flex items-center gap-2">
          <slot />
          <button
            class="p-2.5 bg-gray-50 dark:bg-[#0f1419] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-blue-500 transition-colors"
            @click="onRefresh">
            <v-icon name="md-refresh" scale="1.2" />
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="flex-1 h-full overflow-y-auto">
      <EventListTable :events="filteredEvents" />
    </div>

    <!-- Footer with pagination -->
    <div
      class="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#1a1f2e] border-t border-gray-200 dark:border-gray-700">
      <div class="text-sm text-gray-600 dark:text-gray-400">Showing {{ showingCount }} of {{ totalEvents }} events</div>
      <div class="flex gap-2">
        <button
          :disabled="!canGoPrev"
          class="px-4 py-2 bg-gray-50 dark:bg-[#0f1419] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 dark:disabled:hover:border-gray-700 disabled:hover:text-gray-700 dark:disabled:hover:text-gray-300"
          @click="goToPrev">
          Prev
        </button>
        <button
          :disabled="!canGoNext"
          class="px-4 py-2 bg-blue-600 border border-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
          @click="goToNext">
          Next
        </button>
      </div>
    </div>
  </div>
</template>
