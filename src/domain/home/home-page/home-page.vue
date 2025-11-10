<script setup lang="ts">
import useGetAllEventList from '@src/hooks/use-get-all-event-list'
import { useRouter } from 'vue-router'

const router = useRouter()

// Mock data for monitoring cards
const monitoringCards = [
  {
    id: 'microseismic',
    title: 'Microseismic Monitoring',
    description: 'Event statistics, b-value trends, total events, and average magnitude with adjustable windows',
    route: '/eq-view',
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

// Fetch recent earthquakes - using a 7-day window
const endDate = Date.now()
const startDate = endDate - 7 * 24 * 60 * 60 * 1000 // 7 days ago

const { data: eventsData } = useGetAllEventList({
  page: 1,
  totalPerPage: 10,
  startDate,
  endDate
})

const navigateTo = (route: string) => {
  router.push(route)
}

const formatDistance = (km: number) => {
  return `${km.toFixed(1)} km`
}

const formatDateTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  })
}

const getMagnitudeColor = (magnitude: number) => {
  if (magnitude >= 7) return 'bg-red-600'
  if (magnitude >= 6) return 'bg-orange-600'
  if (magnitude >= 5) return 'bg-yellow-600'
  return 'bg-green-600'
}

const getMagnitudeText = (magnitude: number) => {
  if (magnitude >= 7) return 'Very Strong Shaking'
  if (magnitude >= 6) return 'Strong Shaking'
  if (magnitude >= 5) return 'Moderate Shaking'
  return 'Light Shaking'
}
</script>

<template>
  <div class="min-h-screen bg-base-100 transition-colors">
    <!-- Header -->
    <div class="bg-base-200/50 border-b border-base-content/10 px-6 py-6">
      <h1 class="text-2xl font-bold text-base-content mb-1">Dashboard</h1>
      <p class="text-sm text-base-content/70">
        Real-time visualization and analysis of earthquake activity across Indonesia.
      </p>
    </div>

    <!-- Main Content -->
    <div class="px-6 py-6 pb-20">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Section - Monitoring Cards -->
        <div class="lg:col-span-2 flex flex-col gap-6">
          <article
            v-for="card in monitoringCards"
            :key="card.id"
            class="group card rounded-[28px] border border-base-content/15 bg-base-200/80 p-5 shadow-lg shadow-base-300/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/30 hover:-translate-y-1 hover:bg-base-200 cursor-pointer lg:p-6">
            <div class="flex flex-col gap-5 lg:flex-row">
              <!-- Left Side - Preview Image -->
              <figure
                class="flex h-40 w-full shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-base-content/10 bg-base-100/40 lg:h-auto lg:w-60 group-hover:border-primary/30 transition-colors"
                @click="navigateTo(card.route)">
                <img
                  :src="card.image"
                  :alt="card.title"
                  class="h-full w-full object-cover transition-all duration-300 hover:scale-105"
                  @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')" />
                <div v-if="!card.image" class="absolute inset-0 flex items-center justify-center text-base-content/30">
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
                      <h2 class="text-xl font-semibold text-base-content transition-colors">{{ card.title }}</h2>
                      <p class="max-w-xl text-sm leading-relaxed text-base-content/70">
                        {{ card.description }}
                      </p>
                    </div>
                    <!-- Live Badge -->
                    <span
                      v-if="card.isLive"
                      class="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                      <span class="relative flex h-2 w-2">
                        <span
                          class="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                      </span>
                      Live
                    </span>
                  </div>
                </div>

                <!-- Bottom Section: Button -->
                <div class="flex w-full justify-end">
                  <button
                    class="btn btn-primary btn-sm gap-2 rounded-full px-8 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/50"
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
            class="rounded-[28px] border border-base-content/15 bg-base-200/80 shadow-lg shadow-base-300/30 overflow-hidden sticky top-6 transition-all duration-300 hover:shadow-xl hover:border-base-content/20">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-base-content/10">
              <div class="flex items-center justify-between">
                <h3 class="text-base font-semibold text-base-content">Nearby Earthquake</h3>
                <button
                  class="text-xs text-primary hover:text-primary-focus font-medium transition-colors"
                  @click="navigateTo('/eq-view')">
                  Lihat
                </button>
              </div>
            </div>

            <!-- Earthquake List -->
            <div class="overflow-y-auto max-h-[calc(100vh-200px)]">
              <div v-if="!eventsData || eventsData.data.length === 0" class="px-6 py-12 text-center">
                <p class="text-sm text-base-content/60">No recent earthquakes</p>
              </div>

              <div v-else class="divide-y divide-base-content/10">
                <div
                  v-for="event in eventsData.data"
                  :key="event.event_id"
                  class="px-6 py-4 hover:bg-base-300/50 transition-all duration-200 cursor-pointer hover:translate-x-1 border-l-4 border-transparent hover:border-primary"
                  @click="navigateTo(`/origin-locator-view/events/${event.event_id}`)">
                  <!-- Magnitude -->
                  <div class="flex items-start gap-4">
                    <div class="text-center min-w-[60px]">
                      <div class="text-2xl font-bold text-base-content">
                        {{ event.magnitude?.toFixed(1) || 'N/A' }}
                      </div>
                      <div class="text-xs text-base-content/60">km</div>
                    </div>

                    <!-- Event Details -->
                    <div class="flex-1 min-w-0">
                      <!-- Location -->
                      <div class="flex items-start gap-2 mb-2">
                        <svg class="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fill-rule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clip-rule="evenodd" />
                        </svg>
                        <p class="text-sm font-medium text-base-content line-clamp-2">
                          {{ event.location || 'Unknown location' }}
                        </p>
                      </div>

                      <!-- Time -->
                      <p class="text-xs text-base-content/60 mb-3">
                        {{ formatDateTime(event.origin_time) }}
                      </p>

                      <!-- Alert Level & Distance -->
                      <div class="flex items-center justify-between">
                        <div class="space-y-1">
                          <p class="text-xs text-base-content/60">Pager Alert Level: Green</p>
                          <div class="flex items-center gap-2">
                            <span
                              :class="[
                                'px-2 py-0.5 rounded text-xs font-medium text-white',
                                getMagnitudeColor(event.magnitude || 0)
                              ]">
                              VII
                            </span>
                            <span class="text-xs text-base-content/60">
                              ({{ getMagnitudeText(event.magnitude || 0) }})
                            </span>
                          </div>
                        </div>
                        <div class="text-right">
                          <p class="text-sm font-semibold text-base-content">
                            {{ formatDistance(event.depth || 0) }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Status Bar -->
    <div
      class="fixed bottom-0 left-0 right-0 bg-base-200/95 backdrop-blur-sm border-t border-base-content/10 px-6 py-3">
      <div class="flex items-center justify-between text-xs">
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-success rounded-full"></span>
            <span class="text-base-content/70">Koneksi Database: Stabil</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-success rounded-full"></span>
            <span class="text-base-content/70">Server Status: Online</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-warning rounded-full"></span>
            <span class="text-base-content/70">Sinkronisasi: 98.7%</span>
          </div>
        </div>
        <div class="text-base-content/60">Sistem Monitoring Gempa Indonesia v1.1.0</div>
      </div>
    </div>
  </div>
</template>
