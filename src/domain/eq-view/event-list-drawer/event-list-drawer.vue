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
  <div class="fixed left-0 top-0 z-[9999] flex h-full w-full flex-col bg-white dark:bg-brand-surface-dark">
    <!-- Header with filters -->
    <div class="flex flex-col gap-4 border-b border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-brand-surface-dark">
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
            class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 transition-colors placeholder-gray-400 focus:border-amber-500 focus:outline-none dark:border-gray-700 dark:bg-brand-surface-darker dark:text-white dark:placeholder-gray-500" />
        </div>

        <!-- Minimum Magnitude -->
        <div class="flex-1">
          <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">Minimum Magnitude</label>
          <input
            v-model="minMagnitude"
            type="text"
            placeholder="e.g. 3.0"
            class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 transition-colors placeholder-gray-400 focus:border-amber-500 focus:outline-none dark:border-gray-700 dark:bg-brand-surface-darker dark:text-white dark:placeholder-gray-500" />
        </div>

        <!-- Date range and refresh (slot for DateFilter) -->
        <div class="flex items-center gap-2">
          <slot />
          <button
            class="rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-600 transition-colors hover:border-amber-500 hover:text-gray-900 dark:border-gray-700 dark:bg-brand-surface-darker dark:text-gray-400 dark:hover:text-white"
            @click="onRefresh">
            <svg width="22" height="22" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M25.25 11.7472C24.8832 9.10258 23.6586 6.65217 21.765 4.77341C19.8713 2.89466 17.4136 1.69179 14.7705 1.3501C12.1274 1.00842 9.44543 1.54686 7.1378 2.8825C4.83017 4.21814 3.02487 6.27688 2 8.74158M1.25 2.73035V8.74158H7.25M1.25 14.7528C1.61684 17.3974 2.8414 19.8478 4.73504 21.7266C6.62869 23.6053 9.08637 24.8082 11.7295 25.1499C14.3726 25.4916 17.0546 24.9531 19.3622 23.6175C21.6698 22.2819 23.4751 20.2231 24.5 17.7584M25.25 23.7696V17.7584H19.25"
                stroke="#F3F3F3"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
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
      class="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-brand-surface-dark">
      <div class="text-sm text-gray-600 dark:text-gray-400">Showing {{ showingCount }} of {{ totalEvents }} events</div>
      <div class="flex gap-2">
        <button
          :disabled="!canGoPrev"
          class="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-700 transition-colors hover:border-amber-500 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-300 disabled:hover:text-gray-700 dark:border-gray-700 dark:bg-brand-surface-darker dark:text-gray-300 dark:hover:text-white dark:disabled:hover:border-gray-700 dark:disabled:hover:text-gray-300"
          @click="goToPrev">
          Prev
        </button>
        <button
          :disabled="!canGoNext"
          class="rounded-lg border border-brand-surface-normal bg-brand-surface-normal px-4 py-2 text-white transition-colors hover:bg-brand-surface-normal-hover disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-brand-surface-normal"
          @click="goToNext">
          Next
        </button>
      </div>
    </div>
  </div>
</template>
