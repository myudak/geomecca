<script setup lang="ts">
import { DateFilter } from '@src/components/date-filter'
import { OriginListTable } from '@src/components/origin-list-table'
import useGetWadatiPlot from '@src/hooks/use-get-wadati-plot'
import { EarthQuakeEventDetail } from '@src/types/event'
import type { WadatiPlotResponse } from '@src/types/wadati'
import { format } from 'date-fns'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

const { event } = defineProps<{
  event: EarthQuakeEventDetail
}>()

const defaultOriginId = event.preferred_origin_id ?? event.origins?.[0]?._id ?? ''

let wadatiData = ref<{ data: WadatiPlotResponse } | undefined>()
let isFetching = ref(false)

if (defaultOriginId) {
  const query = useGetWadatiPlot(defaultOriginId)
  wadatiData = query.data
  isFetching = query.isFetching
}

const wadatiImageUrl = computed(() => {
  const base64 = wadatiData.value?.data.image
  return base64 ? `data:image/png;base64,${base64}` : ''
})

const totalEvents = computed(() => wadatiData.value?.data.total_event ?? event?.origins?.length ?? 0)
const ratio = computed(() => {
  const value = wadatiData.value?.data.ratio
  return typeof value === 'number' ? value.toFixed(6) : 'N/A'
})

const now = new Date()
const dateRange = ref({
  start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
  end: now
})

const formattedRange = computed(() => {
  const startText = format(dateRange.value.start, 'dd MMM yyyy')
  const endText = format(dateRange.value.end, 'dd MMM yyyy')
  return `${startText} - ${endText}`
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <section
      class="rounded-[32px] border border-brand-surface-light-active bg-brand-surface-light p-6 text-brand-text-light shadow-lg dark:border-brand-surface-dark-hover dark:bg-brand-surface-darker dark:text-brand-text-dark">
      <header class="mb-6 flex items-center gap-3">
        <RouterLink
          to="/origin-locator-view/events"
          class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-sky-400 hover:text-sky-400 dark:border-slate-700 dark:text-slate-300 dark:hover:border-sky-400">
          <v-icon name="io-chevron-back-sharp" scale="1.1" />
        </RouterLink>
        <div>
          <p class="text-xs uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">Microseismic Analyst</p>
          <h1 class="text-2xl font-semibold text-slate-900 dark:text-white">Wadati Diagram Kumulatif</h1>
        </div>
        <div class="ml-auto">
          <DateFilter v-model:range="dateRange" variant="subtle" />
        </div>
      </header>

      <div class="rounded-3xl border border-brand-surface-light-active bg-brand-surface-light-hover p-4 dark:border-brand-surface-dark-hover dark:bg-brand-surface-dark">
        <div class="mb-3 flex items-center justify-between text-sm text-slate-500 dark:text-slate-300">
          <span>Wadati Diagram</span>
          <span class="hidden rounded-full border border-slate-200 px-4 py-1 text-xs font-semibold text-slate-500 dark:border-slate-600 dark:text-slate-200 md:flex">
            <v-icon name="fa-calendar" class="mr-2 text-slate-400 dark:text-slate-300" />
            {{ formattedRange }}
          </span>
        </div>
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <div
            v-if="wadatiImageUrl"
            class="flex items-center justify-center bg-white p-4 dark:bg-slate-950">
            <img :src="wadatiImageUrl" alt="Wadati Diagram" class="w-full max-w-[900px] rounded-lg shadow" />
          </div>
          <div
            v-else
            class="flex aspect-[3/2] items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-500">
            <div v-if="isFetching" class="loading loading-spinner loading-lg" />
            <p v-else>No Wadati diagram available</p>
          </div>
        </div>
        <div class="mt-4 flex flex-wrap items-center gap-6 text-sm text-slate-600 dark:text-slate-300">
          <p>
            <span class="font-semibold text-slate-900 dark:text-white">Jumlah event terakumulasi:</span>
            {{ totalEvents }} event
          </p>
          <p>
            <span class="font-semibold text-slate-900 dark:text-white">Rasio Vp/Vs:</span>
            {{ ratio }}
          </p>
        </div>
      </div>
    </section>

    <section
      class="rounded-[32px] border border-brand-surface-light-active bg-brand-surface-light p-6 text-brand-text-light shadow dark:border-brand-surface-dark-hover dark:bg-brand-surface-darker dark:text-brand-text-dark">
      <OriginListTable :event-id="event._id" :origins="event.origins" :preferred-origin-id="event.preferred_origin_id" />
    </section>
  </div>
</template>
