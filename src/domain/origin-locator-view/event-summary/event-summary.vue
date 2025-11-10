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
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  event: EarthQuakeEventDetail
  originId?: string
}>()

const { event } = props
const preferredOrigin = ref<Origin>()
const magnitude = computed(() => getDefaultMagnitude(preferredOrigin.value?.magnitudes ?? []))
const originTime = computed(() => getOriginTimeFromEvent(event))

watch(
  () => props.originId,
  (newOriginId) => {
    preferredOrigin.value = undefined
    setTimeout(() => {
      preferredOrigin.value = getPreferredOrigin(event, newOriginId)
    }, 100)
  },
  { immediate: true }
)

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
  <div class="flex flex-col gap-2">
    <div class="text-slate-200 font-semibold">{{ originTime ? formatDate(originTime) : '-' }}</div>
    <div class="text-slate-200 font-semibold">M {{ magnitude?.value ? formatMagnitude(magnitude?.value) : '-' }}</div>
    <div class="text-slate-200 font-semibold">{{ preferredOrigin?.region ?? '-' }} Region</div>
    <div class="text-slate-200 font-semibold">
      Depth {{ preferredOrigin ? formatDepth(preferredOrigin.depth) : '-' }}km
    </div>

    <OLPreviewMap v-if="magnitude && preferredOrigin" :origin="preferredOrigin" :magnitude="magnitude" />

    <InformationList :informations="informations" />

    <DownloadButton v-if="preferredOrigin" :origin="preferredOrigin" />
  </div>
</template>
