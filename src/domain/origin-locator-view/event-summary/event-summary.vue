<script setup lang="ts">
import DownloadButton from '@src/components/download-button'
import { InformationList } from '@src/components/information-list'
import { OLPreviewMap } from '@src/components/ol-preview-map'
import { EarthQuakeEventDetail } from '@src/types/event'
import { Origin } from '@src/types/origin'
import {
  formatDate,
  formatDepth,
  formatMagnitude,
  getDefaultMagnitude,
  getOriginTimeFromEvent,
  getPreferredOrigin
} from '@src/utils/string'
import { computed } from 'vue'

const props = defineProps<{
  event: EarthQuakeEventDetail
  originId?: string
}>()

const preferredOrigin = computed<Origin | undefined>(() => getPreferredOrigin(props.event, props.originId))
const magnitude = computed(() => getDefaultMagnitude(preferredOrigin.value?.magnitudes ?? []))
const originTime = computed(() => getOriginTimeFromEvent(props.event))

const informations = computed(() => [
  {
    label: 'Lat:',
    value: preferredOrigin?.value?.latitude ?? '-',
    width: '140'
  },
  {
    label: 'Lon:',
    value: preferredOrigin?.value?.longitude ?? '-'
  },
  {
    label: 'Phases:',
    value: (preferredOrigin?.value?.arrivals?.length ?? 0) / 2
  },
  {
    label: 'RMS Res (s):',
    value: preferredOrigin?.value?.rms ?? '-'
  },
  {
    label: 'Az Gap (km):',
    value: preferredOrigin?.value?.gap ?? '-'
  },
  {
    label: 'Err Epicenter (km)',
    value: preferredOrigin?.value?.err_epicenter ?? '-'
  }
])
</script>

<template>
  <div class="space-y-4 rounded-2xl border border-brand-surface-light-active bg-brand-surface-light p-4 text-brand-text-light shadow-sm dark:border-brand-surface-dark-hover dark:bg-brand-surface-darker dark:text-brand-text-dark">
    <div class="space-y-1">
      <p class="text-xs font-semibold uppercase tracking-[0.4em] text-brand-text-muted dark:text-brand-text-muted-dark">
        Preferred Origin
      </p>
      <div class="text-lg font-semibold text-brand-text-light dark:text-brand-text-dark">
        {{ preferredOrigin?.region ?? '-' }} • Depth {{ preferredOrigin ? formatDepth(preferredOrigin.depth) : '-' }} km
      </div>
      <p class="text-sm text-brand-text-muted dark:text-brand-text-muted-dark">{{ originTime ? formatDate(originTime) : '-' }}</p>
      <p class="text-sm font-semibold text-brand-text-light dark:text-brand-text-dark">
        Magnitude:
        <span class="text-slate-900 dark:text-white">
          {{ magnitude?.value ? formatMagnitude(magnitude?.value) : '-' }}
        </span>
      </p>
    </div>

    <div class="overflow-hidden rounded-xl border border-brand-surface-light-active bg-brand-surface-light-hover dark:border-brand-surface-dark-hover dark:bg-brand-surface-dark">
      <OLPreviewMap v-if="magnitude && preferredOrigin" :origin="preferredOrigin" :magnitude="magnitude" />
      <div v-else class="flex aspect-video items-center justify-center text-sm text-slate-400 dark:text-slate-500">
        No map preview available
      </div>
    </div>

    <InformationList :informations="informations" variant="light" />

    <div class="pt-2">
      <DownloadButton
        v-if="preferredOrigin"
        :origin="preferredOrigin"
        class="btn btn-sm rounded-full border border-slate-200 bg-white text-slate-700 hover:border-amber-400 hover:text-amber-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200" />
    </div>
  </div>
</template>
