<script setup lang="ts">
import useGetAllEventList from '@src/hooks/use-get-all-event-list'
import { EarthQuakeEvent } from '@src/types/event'
import { getDefaultMagnitude } from '@src/utils/string'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const monitoringCards = [
  {
    id: 'weather',
    title: 'Meteorological Ops',
    description: 'National weather outlook, early warning bulletins, and coastal maritime advisories.',
    route: '/weather-view',
    image: '/images/weather-preview.svg',
    statusLabel: 'ACTIVE',
    statusClass: 'text-emerald-700 border-emerald-500/20 bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 dark:bg-emerald-500/20',
    pulse: true
  },
  {
    id: 'microseismic',
    title: 'Microseismic Monitoring',
    description: 'Event statistics, b-value trends, total events, and average magnitude with adjustable windows.',
    route: '/map-view',
    image: '/screenshots/eq-view.png',
    statusLabel: 'LIVE',
    statusClass: 'text-emerald-700 border-emerald-500/20 bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 dark:bg-emerald-500/20',
    pulse: false
  },
  {
    id: 'trace',
    title: 'Trace Monitoring',
    description: 'Waveform analytics, station trace visualization, and real-time feed diagnostics.',
    route: '/trace-view',
    image: '/screenshots/trace-view.png',
    statusLabel: 'LIVE',
    statusClass: 'text-emerald-700 border-emerald-500/20 bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 dark:bg-emerald-500/20',
    pulse: false
  },
  {
    id: 'analyst',
    title: 'Microseismic Analyst',
    description: 'Event processing, origin location review, and manual phase picking tools.',
    route: '/origin-locator-view/events',
    image: '/screenshots/origin-locator-view.png',
    statusLabel: 'LIVE',
    statusClass: 'text-emerald-700 border-emerald-500/20 bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 dark:bg-emerald-500/20',
    pulse: false
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
  if (km === undefined || km === null) return 'N/A'
  return `${km.toFixed(1)} KM`
}

const formatDateTime = (timestamp?: string) => {
  if (!timestamp) return 'UNKNOWN'
  const date = new Date(timestamp.includes('Z') ? timestamp : `${timestamp}Z`)
  return `${date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'UTC'
  })} UTC`
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
  if (magnitude === null) return 'UNKNOWN'
  if (magnitude >= 7) return 'CRITICAL'
  if (magnitude >= 6) return 'WARNING'
  if (magnitude >= 5) return 'ELEVATED'
  return 'NORMAL'
}

const getAlertBadgeClass = (magnitude: number | null) => {
  if (magnitude === null)
    return 'bg-stone-100 text-stone-500 border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700'
  if (magnitude >= 7)
    return 'bg-red-500/10 text-red-700 border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30'
  if (magnitude >= 6)
    return 'bg-orange-500/10 text-orange-700 border-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30'
  if (magnitude >= 5)
    return 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30'
  return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
}

const getAlertDotClass = (magnitude: number | null) => {
  if (magnitude === null) return 'bg-stone-400'
  if (magnitude >= 7) return 'bg-red-500'
  if (magnitude >= 6) return 'bg-orange-500'
  if (magnitude >= 5) return 'bg-amber-500'
  return 'bg-emerald-500'
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
</script>

<template>
  <div class="min-h-screen bg-[#F7F5F0] text-[#2A241B] dark:bg-[#110F0D] dark:text-[#F0EDE6] font-sans selection:bg-brand-surface-normal selection:text-white pb-16">
    
    <!-- HEADER BAR -->
    <header class="border-b border-[#E5DFD3] bg-white px-6 py-4 dark:border-[#2E2A24] dark:bg-[#1A1815]">
      <div class="mx-auto flex max-w-screen-2xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-xl font-bold uppercase tracking-wide">AI-Powered Multi-Hazard Early Warning System</h1>
            <span class="rounded bg-[#2A241B] px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest text-white dark:bg-[#F0EDE6] dark:text-[#110F0D]">
              MHEWS
            </span>
          </div>
          <p class="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Integrating Earthquake Detection and Weather Intelligence in a Unified Platform
          </p>
        </div>
        
        <div class="flex items-center gap-6 font-mono text-xs">
          <div class="flex flex-col items-end">
            <span class="text-stone-400">SYSTEM STATUS</span>
            <span class="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
              <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              ONLINE
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto max-w-screen-2xl p-6 space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left Section - Monitoring Modules -->
        <div class="lg:col-span-2 flex flex-col gap-6">
          <article
            v-for="card in monitoringCards"
            :key="card.id"
            class="group relative flex flex-col sm:flex-row gap-5 rounded-lg border border-[#E5DFD3] bg-white p-5 transition-colors hover:border-brand-surface-normal dark:border-[#2E2A24] dark:bg-[#1A1815] dark:hover:border-brand-surface-normal cursor-pointer"
            @click="navigateTo(card.route)">
            
            <!-- Module Preview Image -->
            <figure
              class="relative flex h-40 w-full sm:w-56 shrink-0 items-center justify-center overflow-hidden rounded border border-[#E5DFD3] bg-[#F7F5F0] dark:border-[#2E2A24] dark:bg-[#110F0D]">
              <img
                :src="card.image"
                :alt="card.title"
                class="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            </figure>

            <!-- Module Info -->
            <div class="flex flex-1 flex-col justify-between py-1">
              <div>
                <div class="flex items-start justify-between gap-3 mb-2">
                  <h2 class="text-lg font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 group-hover:text-brand-surface-normal transition-colors">
                    {{ card.title }}
                  </h2>
                  <span
                    class="flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest"
                    :class="card.statusClass">
                    <span v-if="card.pulse" class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {{ card.statusLabel }}
                  </span>
                </div>
                <p class="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                  {{ card.description }}
                </p>
              </div>
              
              <div class="mt-4 flex items-center justify-end">
                <span class="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-stone-500 group-hover:text-brand-surface-normal transition-colors">
                  Akses Modul
                  <v-icon name="bi-arrow-right" class="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </article>
        </div>

        <!-- Right Section - Recent Earthquakes -->
        <div class="lg:col-span-1">
          <div class="sticky top-6 flex flex-col h-[calc(100vh-140px)] rounded-lg border border-[#E5DFD3] bg-white dark:border-[#2E2A24] dark:bg-[#1A1815]">
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-[#E5DFD3] px-5 py-4 dark:border-[#2E2A24]">
              <h3 class="font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                Recent Seismic Events
              </h3>
              <button
                class="font-mono text-[10px] font-bold uppercase tracking-widest text-brand-surface-normal hover:text-brand-surface-dark transition-colors"
                @click="navigateTo('/eq-view')">
                View All
              </button>
            </div>

            <!-- List -->
            <div class="flex-1 overflow-y-auto divide-y divide-[#E5DFD3] dark:divide-[#2E2A24]">
              <div v-if="isEventsLoading" class="px-5 py-10 text-center font-mono text-xs text-stone-500">
                LOADING FEED...
              </div>

              <div v-else-if="eventList.length === 0" class="px-5 py-10 text-center font-mono text-xs text-stone-500">
                NO RECENT EVENTS
              </div>

              <article
                v-else
                v-for="event in eventList"
                :key="event._id"
                class="group flex flex-col gap-3 p-4 transition-colors hover:bg-[#F7F5F0] dark:hover:bg-[#110F0D] cursor-pointer"
                @click="navigateTo(`/origin-locator-view/events/${event._id}`)">
                
                <div class="flex items-start gap-3">
                  <!-- Magnitude Box -->
                  <div class="flex shrink-0 flex-col items-center justify-center rounded border border-[#E5DFD3] bg-white h-12 w-12 dark:border-[#2E2A24] dark:bg-[#1A1815] group-hover:border-brand-surface-normal transition-colors">
                    <span class="font-mono text-lg font-bold" :class="getPreferredMagnitudeValue(event) >= 5 ? 'text-brand-surface-normal' : 'text-stone-700 dark:text-stone-300'">
                      {{ formatMagnitudeValue(event) }}
                    </span>
                    <span class="font-mono text-[9px] text-stone-400">Mw</span>
                  </div>

                  <!-- Info -->
                  <div class="flex-1 min-w-0">
                    <h4 class="truncate font-bold text-sm text-stone-800 dark:text-stone-200 group-hover:text-brand-surface-normal transition-colors">
                      {{ getLocationLabel(event) }}
                    </h4>
                    <p class="font-mono text-[10px] text-stone-500 mt-0.5">
                      {{ formatDateTime(event.origins?.origin_time) }}
                    </p>
                  </div>
                </div>

                <!-- Footer Metriks -->
                <div class="flex items-center justify-between font-mono text-[10px]">
                  <div class="flex items-center gap-1.5">
                    <span class="text-stone-400">DEPTH:</span>
                    <span class="font-bold text-stone-700 dark:text-stone-300">{{ formatDistance(event.origins?.depth) }}</span>
                  </div>
                  
                  <div class="flex items-center gap-1.5">
                    <span class="text-stone-400">ALERT:</span>
                    <span :class="getAlertBadgeClass(getPreferredMagnitudeValue(event))" class="rounded px-1.5 py-0.5 font-bold tracking-widest border">
                      {{ getAlertLevel(getPreferredMagnitudeValue(event)) }}
                    </span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer Status Bar -->
    <div class="fixed bottom-0 left-0 right-0 z-10 flex items-center justify-between border-t border-[#E5DFD3] bg-white px-6 py-2 font-mono text-[10px] uppercase tracking-widest text-stone-500 dark:border-[#2E2A24] dark:bg-[#1A1815]">
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2">
          <span class="h-1.5 w-1.5 bg-emerald-500 rounded-full"></span>
          <span>DB: STABLE</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="h-1.5 w-1.5 bg-emerald-500 rounded-full"></span>
          <span>SYNC: 99.9%</span>
        </div>
      </div>
      <div>MHEWS System v1.2.0</div>
    </div>
  </div>
</template>
