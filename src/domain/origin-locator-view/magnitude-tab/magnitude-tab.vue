<script setup lang="ts">
import { getOriginDetail } from '@src/api-service/origin'
import { DateFilter } from '@src/components/date-filter'
import { useQuery } from '@tanstack/vue-query'
import { format } from 'date-fns'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { MagnitudeDetail } from '../magnitude-detail'
import { MagnitudeList } from '../magnitude-list'
import MagnitudeEstimationCard from './magnitude-estimation-card.vue'

const { originId } = defineProps<{
  originId?: string
}>()

const { data: originDetail } = useQuery({
  enabled: !!originId,
  queryKey: ['origin-detail', originId],
  queryFn: () => getOriginDetail(originId ?? '')
})

const selectedMagnitudeIndex = ref(0)
const stationMagnitudePerTypes = computed(() => originDetail.value?.station_magnitude_ids_per_type ?? [])
const magnitudeTypes = computed(() => stationMagnitudePerTypes.value.map((m) => m.type))
const selectedMagnitudes = computed(() => stationMagnitudePerTypes.value[selectedMagnitudeIndex.value])

const now = new Date()
const dateRange = ref({
  start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
  end: now
})

const formattedRange = computed(
  () => `${format(dateRange.value.start, 'dd MMM yyyy')} - ${format(dateRange.value.end, 'dd MMM yyyy')}`
)
</script>

<template>
  <div class="flex flex-col gap-6">
    <MagnitudeEstimationCard :origin-id="originId">
      <template #range>
        <DateFilter v-model:range="dateRange" variant="subtle" />
      </template>
    </MagnitudeEstimationCard>

    <section
      class="rounded-[32px] border border-brand-surface-light-active bg-brand-surface-light p-6 text-brand-text-light shadow dark:border-brand-surface-dark-hover dark:bg-brand-surface-darker dark:text-brand-text-dark">
      <div class="mb-4 flex flex-wrap items-center gap-4">
        <RouterLink
          to="/origin-locator-view/events"
          class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-sky-400 hover:text-sky-400 dark:border-slate-700 dark:text-slate-300 dark:hover:border-sky-400">
          <v-icon name="io-chevron-back-sharp" scale="1.1" />
        </RouterLink>
        <div>
          <p class="text-xs uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">Station Magnitudes</p>
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Magnitude Types</h3>
        </div>
      </div>

      <div role="tablist" class="tabs tabs-boxed bg-brand-surface-light-hover dark:bg-brand-surface-dark">
        <button
          v-for="(magnitudeType, index) in magnitudeTypes"
          :key="magnitudeType"
          role="tab"
          :class="['tab text-sm font-semibold', { 'tab-active': index === selectedMagnitudeIndex }]"
          @click="selectedMagnitudeIndex = index">
          {{ magnitudeType }}
        </button>
      </div>

      <div class="mt-6 flex flex-col gap-6">
        <MagnitudeDetail
          v-if="selectedMagnitudes && originDetail"
          :origin="originDetail"
          :station-magnitudes="selectedMagnitudes.station_magnitudes" />

        <div class="rounded-2xl border border-slate-200 bg-white/90 p-4 dark:border-slate-700 dark:bg-slate-900/40">
          <p class="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Station Magnitude List</p>
          <MagnitudeList v-if="selectedMagnitudes" :magnitudes="selectedMagnitudes.station_magnitudes" />
        </div>
      </div>
    </section>
  </div>
</template>
