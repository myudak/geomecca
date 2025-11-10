<script setup lang="ts">
import { InformationList } from '@src/components/information-list'
import { OLPreviewMap } from '@src/components/ol-preview-map'
import { EarthQuakeEventDetail } from '@src/types/event'
import { formatDate, getDefaultMagnitude, getPreferredOrigin } from '@src/utils/string'
import { computed } from 'vue'

import { ArrivalList } from '../arrival-list'
import { ChartTabList } from '../chart-tab-list'

const { event, originId } = defineProps<{
  event: EarthQuakeEventDetail
  originId?: string
}>()

const preferredOrigin = computed(() => getPreferredOrigin(event, originId))
const magnitude = computed(() => getDefaultMagnitude(preferredOrigin.value?.magnitudes ?? []))

const informations = [
  {
    label: 'Time:',
    value: preferredOrigin.value ? formatDate(preferredOrigin.value?.origin_time) : '-',
    width: '140'
  },
  {
    label: 'Depth:',
    value: preferredOrigin?.value?.depth ?? '-'
  },
  {
    label: 'Lat:',
    value: preferredOrigin?.value?.latitude ?? '-'
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
]

// TODO: this is mock
const additionalInformations = [
  {
    label: 'EventID:',
    value: 'xxx',
    width: '140'
  },
  {
    label: 'Agency:',
    value: 'xxx'
  },
  {
    label: 'Author:',
    value: 'xxx_xx'
  },
  {
    label: 'Evaluation:',
    value: 'x (A)'
  },
  {
    label: 'Method:',
    value: 'xxx'
  },
  {
    label: 'Earth model:',
    value: 'xxx'
  },
  {
    label: 'Updated:',
    value: 'xxxx-xx-xx xx:xx:xx'
  }
]
</script>

<template>
  <div class="flex-1 flex flex-col gap-4 w-full h-full">
    <div class="flex gap-4 max-md:grid-cols-1 max-md:flex-col">
      <div class="w-[30%] max-md:w-full">
        <div class="pb-[100%] relative">
          <OLPreviewMap
            v-if="magnitude && preferredOrigin"
            :origin="preferredOrigin"
            :magnitude="magnitude"
            :full-height="true"
            class="absolute w-full h-full max-md:w-full" />
        </div>
      </div>
      <div class="w-[330px] flex flex-col">
        <InformationList :informations="informations" />
        <div class="divider" />
        <InformationList :informations="additionalInformations" />
      </div>
      <div class="flex-1">
        <ChartTabList v-if="preferredOrigin" :origin-id="preferredOrigin._id" />
      </div>
    </div>

    <ArrivalList :event="event" :origin-id="originId" />
  </div>
</template>
