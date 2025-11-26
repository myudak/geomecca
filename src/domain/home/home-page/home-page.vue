<script setup lang="ts">
import useGetAllEventList from '@src/hooks/use-get-all-event-list'
import { EarthQuakeEvent } from '@src/types/event'
import { getDefaultMagnitude } from '@src/utils/string'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Mock data for monitoring cards
const monitoringCards = [
  {
    id: 'microseismic',
    title: 'Microseismic Monitoring',
    description: 'Event statistics, b-value trends, total events, and average magnitude with adjustable windows',
    route: '/map-view',
    image: '/screenshots/eq-view.png',
    isLive: true
  },
  {
    id: 'trace',
    title: 'Trace Monitoring',
    description: 'Event statistics, b-value trends, total events, and average magnitude with adjustable windows',
    route: '/trace-view',
    image: '/screenshots/trace-view.png',
    isLive: true
  },
  {
    id: 'analyst',
    title: 'Microseismic Analyst',
    description: 'Event statistics, b-value trends, total events, and average magnitude with adjustable windows',
    route: '/origin-locator-view/events',
    image: '/screenshots/origin-locator-view.png',
    isLive: true
  }
]

const end = new Date()
const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)

const { data: eventsData, isFetching: isEventsLoading } = useGetAllEventList({
  page: 1,
  totalPerPage: 10,
  startDate: start.toISOString(),
  endDate: end.toISOString()
})

const eventList = computed(() => eventsData.value?.data ?? [])

const navigateTo = (route: string) => {
  router.push(route)
}

const formatDistance = (km?: number | null) => {
  if (km === undefined || km === null) return 'Depth unavailable'
  return `${km.toFixed(1)} km`
}

const formatDateTime = (timestamp?: string) => {
  if (!timestamp) return 'Unknown time'
  const date = new Date(timestamp.includes('Z') ? timestamp : `${timestamp}Z`)
  return `${date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC'
  })} (UTC)`
}

const getPreferredMagnitudeValue = (event: EarthQuakeEvent) => {
  const magnitudes = event?.origins?.magnitudes ?? []
  const preferredMagnitude = getDefaultMagnitude(magnitudes) ?? magnitudes[0]
  return preferredMagnitude?.value ?? null
}

const formatMagnitudeValue = (event: EarthQuakeEvent) => {
  const magnitude = getPreferredMagnitudeValue(event)
  return magnitude !== null ? magnitude.toFixed(1) : '—'
}

const getLocationLabel = (event: EarthQuakeEvent) => {
  const { sub_region, region, country } = event.origins ?? {}
  const parts = [sub_region, region, country].filter(Boolean)
  return parts.length ? parts.join(', ') : event.name
}

const getAlertLevel = (magnitude: number | null) => {
  if (magnitude === null) return 'Unknown'
  if (magnitude >= 7) return 'Red'
  if (magnitude >= 6) return 'Orange'
  if (magnitude >= 5) return 'Yellow'
  return 'Green'
}

const getAlertBadgeClass = (magnitude: number | null) => {
  if (magnitude === null)
    return 'bg-brand-surface-light-active text-brand-text-muted dark:bg-brand-surface-dark dark:text-brand-text-muted-dark'
  if (magnitude >= 7)
    return 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-200 dark:border-red-500/40'
  if (magnitude >= 6)
    return 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-500/10 dark:text-orange-200 dark:border-orange-500/40'
  if (magnitude >= 5)
    return 'bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-200 dark:border-yellow-500/40'
  return 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-500/10 dark:text-green-200 dark:border-green-500/40'
}

const getAlertDotClass = (magnitude: number | null) => {
  if (magnitude === null) return 'bg-brand-text-muted dark:bg-brand-text-muted-dark'
  if (magnitude >= 7) return 'bg-red-500'
  if (magnitude >= 6) return 'bg-orange-500'
  if (magnitude >= 5) return 'bg-yellow-500'
  return 'bg-green-500'
}

const getIntensityScale = (magnitude: number | null) => {
  if (magnitude === null) return '—'
  if (magnitude >= 7.5) return 'IX'
  if (magnitude >= 7) return 'VIII'
  if (magnitude >= 6.5) return 'VII'
  if (magnitude >= 6) return 'VI'
  if (magnitude >= 5.5) return 'V'
  if (magnitude >= 5) return 'IV'
  return 'III'
}

const getMagnitudeText = (magnitude: number | null) => {
  if (magnitude === null) return 'Intensity unavailable'
  if (magnitude >= 7) return 'Very Strong Shaking'
  if (magnitude >= 6) return 'Strong Shaking'
  if (magnitude >= 5) return 'Moderate Shaking'
  return 'Light Shaking'
}
</script>

<template>
  <div class="min-h-screen page-shell transition-colors">
    <!-- Header -->
    <div class="bg-brand-surface-light-hover px-6 py-6 dark:bg-[#141923]">
      <h1 class="text-2xl font-bold text-brand-text-light dark:text-brand-text-dark mb-1">Dashboard</h1>
      <p class="text-sm text-brand-text-muted dark:text-brand-text-muted-dark">
        Real-time visualization and analysis of earthquake activity across Indonesia.
      </p>
    </div>

    <!-- Main Content -->
    <div class="px-6 py-6 pb-20 bg-white dark:bg-[#141923]">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Section - Monitoring Cards -->
        <div class="lg:col-span-2 flex flex-col gap-6">
          <article
            v-for="card in monitoringCards"
            :key="card.id"
            class="group card rounded-[28px] border border-brand-surface-light-active p-5 text-brand-text-light shadow-lg shadow-brand-numeric-200/40 transition-all duration-300 hover:-translate-y-1 hover:border-brand-surface-normal hover:bg-brand-surface-light-hover hover:shadow-2xl hover:shadow-brand-numeric-300/30 dark:border-brand-surface-dark-hover dark:bg-[#1b1f28] dark:text-brand-text-dark lg:p-6 bg-white">
            <div class="flex flex-col gap-5 lg:flex-row">
              <!-- Left Side - Preview Image -->
              <figure
                class="flex h-40 w-full shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-brand-surface-light-active bg-brand-surface-light-hover transition-colors group-hover:border-brand-surface-normal lg:h-auto lg:w-60 dark:border-brand-surface-dark-hover dark:bg-brand-surface-dark"
                @click="navigateTo(card.route)">
                <img
                  :src="card.image"
                  :alt="card.title"
                  class="h-full w-full object-cover transition-all duration-300 hover:scale-105"
                  @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')" />
                <div
                  v-if="!card.image"
                  class="absolute inset-0 flex items-center justify-center text-brand-text-muted/40 dark:text-brand-text-muted-dark/50">
                  <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </figure>

              <!-- Right Side - Content -->
              <div class="flex flex-1 flex-col justify-between gap-6">
                <!-- Top Section -->
                <div class="flex flex-col gap-4">
                  <div class="flex flex-wrap items-start justify-between gap-3">
                    <div class="space-y-2">
                      <h2
                        class="text-xl font-semibold text-brand-text-light transition-colors dark:text-brand-text-dark">
                        {{ card.title }}
                      </h2>
                      <p class="max-w-xl text-sm leading-relaxed text-brand-text-muted dark:text-brand-text-muted-dark">
                        {{ card.description }}
                      </p>
                    </div>
                    <!-- Live Badge -->
                    <span
                      v-if="card.isLive"
                      class="inline-flex items-center gap-2 rounded-full bg-green-400/15 px-4 py-2 text-xs font-semibold text-success shadow-sm">
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 12h4l2-5 4 10 2-5h6" />
                      </svg>
                      <span>Live</span>
                    </span>
                  </div>
                </div>

                <!-- Bottom Section: Button -->
                <div class="flex w-full justify-end">
                  <button
                    class="btn btn-primary btn-sm gap-2 rounded-full px-8 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/50 bg-[#025481] p-2"
                    @click="navigateTo(card.route)">
                    Open View
                    <span aria-hidden="true" class="transition-transform duration-300 group-hover:translate-x-1"
                      >→</span
                    >
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- Right Section - Nearby Earthquake -->
        <div class="lg:col-span-1">
          <div
            class="rounded-[28px] border border-brand-surface-light-active shadow-lg shadow-brand-numeric-200/40 overflow-hidden sticky top-6 transition-all duration-300 hover:shadow-xl hover:border-brand-surface-normal dark:bg-[#1b1f28] bg-white">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-brand-surface-light-active dark:border-brand-surface-dark-hover">
              <div class="flex items-center justify-between">
                <h3 class="text-base font-semibold text-brand-text-light dark:text-brand-text-dark">
                  Nearby Earthquake
                </h3>
                <button
                  class="text-xs text-primary hover:text-primary-focus font-medium transition-colors"
                  @click="navigateTo('/eq-view')">
                  Lihat
                </button>
              </div>
            </div>

            <!-- Earthquake List -->
            <div class="overflow-y-auto max-h-[calc(100vh-200px)]">
              <div v-if="isEventsLoading" class="px-6 py-12 text-center">
                <p class="text-sm text-brand-text-muted dark:text-brand-text-muted-dark">Loading nearby earthquakes…</p>
              </div>

              <div v-else-if="eventList.length === 0" class="px-6 py-12 text-center">
                <p class="text-sm text-brand-text-muted dark:text-brand-text-muted-dark">No recent earthquakes</p>
              </div>

              <div v-else class="divide-y divide-brand-surface-light-active dark:divide-brand-surface-dark-hover">
                <article
                  v-for="event in eventList"
                  :key="event._id"
                  class="px-6 py-5 transition-all duration-200 cursor-pointer border-l-4 border-transparent hover:-translate-y-0.5 hover:bg-brand-surface-light-hover hover:border-brand-surface-normal dark:hover:bg-brand-surface-dark"
                  @click="navigateTo(`/origin-locator-view/events/${event._id}`)">
                  <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div
                      class="min-w-[72px] rounded-2xl bg-brand-surface-light-active px-4 py-3 text-center shadow-inner dark:bg-[#1f2430]">
                      <div class="text-3xl font-bold text-brand-text-light dark:text-brand-text-dark">
                        {{ formatMagnitudeValue(event) }}
                      </div>
                      <div
                        class="text-[11px] uppercase tracking-wide text-brand-text-muted dark:text-brand-text-muted-dark">
                        Mw
                      </div>
                    </div>

                    <div class="flex-1 min-w-0">
                      <div class="flex flex-wrap items-start justify-between gap-3">
                        <div class="flex items-start gap-2 min-w-0">
                          <svg
                            class="w-4 h-4 text-primary flex-shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20">
                            <path
                              fill-rule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clip-rule="evenodd" />
                          </svg>
                          <div class="space-y-1 min-w-0">
                            <p class="text-sm font-semibold text-primary dark:text-blue-300 line-clamp-2">
                              {{ getLocationLabel(event) }}
                            </p>
                            <p class="text-xs text-brand-text-muted dark:text-brand-text-muted-dark">
                              {{ formatDateTime(event.origins?.origin_time) }}
                            </p>
                          </div>
                        </div>
                        <div class="text-right">
                          <p class="text-xs text-brand-text-muted dark:text-brand-text-muted-dark">Depth</p>
                          <p class="text-sm font-semibold text-brand-text-light dark:text-brand-text-dark">
                            {{ formatDistance(event.origins?.depth) }}
                          </p>
                        </div>
                      </div>

                      <div
                        class="mt-4 flex flex-col gap-3 text-xs text-brand-text-muted dark:text-brand-text-muted-dark sm:flex-row sm:items-center sm:justify-between">
                        <div class="flex flex-wrap items-center gap-2">
                          <span>Pager Alert Level:</span>
                          <span
                            :class="[
                              'inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold',
                              getAlertBadgeClass(getPreferredMagnitudeValue(event))
                            ]">
                            <span
                              class="w-2 h-2 rounded-full"
                              :class="getAlertDotClass(getPreferredMagnitudeValue(event))"></span>
                            {{ getAlertLevel(getPreferredMagnitudeValue(event)) }}
                          </span>
                        </div>
                        <div class="flex flex-wrap items-center gap-2">
                          <span
                            :class="[
                              'inline-flex items-center rounded-lg px-3 py-1 text-xs font-semibold border',
                              getAlertBadgeClass(getPreferredMagnitudeValue(event))
                            ]">
                            {{ getIntensityScale(getPreferredMagnitudeValue(event)) }}
                          </span>
                          <span>({{ getMagnitudeText(getPreferredMagnitudeValue(event)) }})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Status Bar -->
    <div
      class="fixed bottom-0 left-0 right-0 bg-brand-surface-light-hover backdrop-blur-sm border-t border-brand-surface-light-active px-6 py-3 dark:border-brand-surface-dark-hover dark:bg-[#080f1c]">
      <div class="flex items-center justify-between text-xs text-brand-text-muted dark:text-brand-text-muted-dark">
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-success rounded-full"></span>
            <span>Koneksi Database: Stabil</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-success rounded-full"></span>
            <span>Server Status: Online</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-warning rounded-full"></span>
            <span>Sinkronisasi: 98.7%</span>
          </div>
        </div>
        <div>Geomecca v1.1.0</div>
      </div>
    </div>
  </div>
</template>
