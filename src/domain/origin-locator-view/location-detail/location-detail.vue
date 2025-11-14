<script setup lang="ts">
import { InformationList } from '@src/components/information-list'
import { OLPreviewMap } from '@src/components/ol-preview-map'
import { EarthQuakeEventDetail } from '@src/types/event'
import { formatDate, getDefaultMagnitude, getPreferredOrigin } from '@src/utils/string'
import { computed, ref } from 'vue'

import { ArrivalList } from '../arrival-list'
import { ChartTabList } from '../chart-tab-list'

const { event, originId } = defineProps<{
  event: EarthQuakeEventDetail
  originId?: string
}>()

const preferredOrigin = computed(() => getPreferredOrigin(event, originId))
const magnitude = computed(() => getDefaultMagnitude(preferredOrigin.value?.magnitudes ?? []))
const totalStations = computed(() => preferredOrigin.value?.arrivals?.length ?? 0)

const wadatiImageUrl = ref('')

const informations = computed(() => [
  {
    label: 'ID Event:',
    value: event.name ?? event._id,
    width: '140'
  },
  {
    label: 'Origin Time:',
    value: preferredOrigin.value ? formatDate(preferredOrigin.value.origin_time) : '-'
  },
  {
    label: 'Latitude:',
    value: preferredOrigin.value?.latitude ?? '-'
  },
  {
    label: 'Longitude:',
    value: preferredOrigin.value?.longitude ?? '-'
  },
  {
    label: 'Depth:',
    value: preferredOrigin.value?.depth ? `${preferredOrigin.value.depth} km` : '-'
  },
  {
    label: 'Magnitude:',
    value: magnitude.value ? magnitude.value.value : '-'
  },
  {
    label: 'Phases:',
    value: preferredOrigin.value?.arrivals?.length ?? '-'
  },
  {
    label: 'RMS Residual (s):',
    value: preferredOrigin.value?.rms ?? '-'
  },
  {
    label: 'Az Gap (km):',
    value: preferredOrigin.value?.gap ?? '-'
  },
  {
    label: 'Err Epicenter (km):',
    value: preferredOrigin.value?.err_epicenter ?? '-'
  },
  {
    label: 'Earth Model:',
    value: 'IASP91'
  },
  {
    label: 'Updated:',
    value: event.created_at ? formatDate(event.created_at) : '-'
  }
])

const downloadWadati = () => {
  if (!wadatiImageUrl.value) return
  const link = document.createElement('a')
  link.href = wadatiImageUrl.value
  link.download = `wadati-${event._id}.png`
  link.click()
}

const handleWadatiReady = (url: string) => {
  wadatiImageUrl.value = url
}
</script>

<template>
  <div class="flex w-full flex-col gap-6">
    <section
      class="rounded-[32px] border border-brand-surface-light-active bg-brand-surface-light p-6 text-brand-text-light shadow-lg dark:border-brand-surface-dark-hover dark:bg-brand-surface-darker dark:text-brand-text-dark">
      <header class="mb-6 flex items-center gap-3">
        <div
          class="flex h-11 w-11 items-center justify-center rounded-full bg-sky-500/20 text-sky-500 dark:bg-sky-500/10">
          <v-icon name="gi-sound-waves" scale="1.2" />
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">Microseismic Analyst</p>
          <h1 class="text-2xl font-semibold text-slate-900 dark:text-white">Location Overview</h1>
        </div>
      </header>

      <div class="grid gap-6 lg:grid-cols-2 min-[1899px]:grid-cols-[1fr_0.9fr_1fr]">
        <div
          class="rounded-2xl border border-brand-surface-light-active bg-brand-surface-light-hover p-4 dark:border-brand-surface-dark-hover dark:bg-brand-surface-dark">
          <p
            class="text-xs font-semibold uppercase tracking-widest text-brand-text-muted dark:text-brand-text-muted-dark">
            Map
          </p>
          <div
            class="mt-3 aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60">
            <OLPreviewMap
              v-if="magnitude && preferredOrigin"
              :origin="preferredOrigin"
              :magnitude="magnitude"
              :full-height="true"
              class="h-full w-full" />
          </div>
        </div>

        <div
          class="rounded-2xl border border-brand-surface-light-active bg-brand-surface-light-hover p-4 dark:border-brand-surface-dark-hover dark:bg-brand-surface-dark">
          <p
            class="text-xs font-semibold uppercase tracking-widest text-brand-text-muted dark:text-brand-text-muted-dark">
            Event Details
          </p>
          <div class="mt-4 space-y-2 text-base">
            <InformationList :informations="informations" variant="light" />
          </div>
        </div>
        <div
          class="rounded-2xl border border-brand-surface-light-active bg-brand-surface-light-hover p-4 dark:border-brand-surface-dark-hover dark:bg-brand-surface-dark">
          <div class="mb-4">
            <p
              class="text-xs font-semibold uppercase tracking-widest text-brand-text-muted dark:text-brand-text-muted-dark">
              Wadati Diagram Event
            </p>
          </div>
          <div
            class="rounded-xl border border-brand-surface-light-active bg-brand-surface-light p-3 dark:border-brand-surface-dark-hover dark:bg-brand-surface-darker"
            style="min-height: 300px">
            <ChartTabList v-if="preferredOrigin" :origin-id="preferredOrigin._id" @ready="handleWadatiReady" />
          </div>
          <div class="mt-4 flex justify-end">
            <button
              class="group flex w-full items-center justify-center gap-2 rounded-xl border border-brand-surface-light-active bg-brand-surface-light px-4 py-2 text-xs font-semibold text-brand-text-light shadow-sm transition hover:-translate-y-0.5 hover:border-brand-surface-normal hover:bg-brand-surface-light-hover hover:text-brand-surface-normal focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-surface-normal disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 dark:border-brand-surface-dark-hover dark:bg-brand-surface-dark dark:text-brand-text-dark dark:hover:border-brand-surface-dark dark:hover:bg-brand-surface-dark-hover dark:hover:text-brand-surface-light"
              type="button"
              :disabled="!wadatiImageUrl"
              @click="downloadWadati">
              <v-icon
                name="hi-solid-download"
                class="text-brand-text-muted transition group-hover:text-brand-surface-normal dark:text-brand-text-muted-dark" />
              <span>Download Wadati</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <section
      class="rounded-[32px] border border-brand-surface-light-active bg-brand-surface-light p-6 text-brand-text-light shadow-lg dark:border-brand-surface-dark-hover dark:bg-brand-surface-darker dark:text-brand-text-dark">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-lg font-semibold text-slate-900 dark:text-white">Data Stasiun</p>
          <p class="text-sm text-slate-500 dark:text-slate-400">Showing {{ totalStations }} phases</p>
        </div>
      </div>
      <ArrivalList :event="event" :origin-id="originId" />
    </section>
  </div>
</template>
