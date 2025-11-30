<script setup lang="ts">
import { OriginDetail, StationMagnitude } from '@src/api-service/origin/types'
import { InformationList } from '@src/components/information-list'
import { formatDate } from '@src/utils/string'
import { ref, watch } from 'vue'

import { BValueChart } from '../b-value-chart'
import MagnitudePreviewMap from './magnitude-preview-map.vue'

const props = defineProps<{
  stationMagnitudes: StationMagnitude[]
  origin: OriginDetail
}>()

const { stationMagnitudes, origin } = props

const values = ref(stationMagnitudes.map((magnitude) => magnitude.value))

watch(
  () => props.stationMagnitudes,
  (newStationMagnitudes) => {
    values.value = newStationMagnitudes.map((magnitude) => magnitude.value)
  }
)

// TODO: this is mock data
const additionalInformations = [
  {
    label: 'Agency:',
    value: 'xxx',
    width: '100px'
  },
  {
    label: 'Author:',
    value: 'xxx'
  },
  {
    label: 'Evaluation:',
    value: 'x (A)'
  },
  {
    label: 'Method:',
    value: 'xxx'
  }
]
</script>

<template>
  <div class="flex gap-4 max-md:flex-col">
    <div class="w-[30%] flex flex-col gap-2 max-md:w-full">
      <div class="text-slate-900 dark:text-slate-100">{{ origin.region }} Region</div>
      <div class="relative pb-[100%]">
        <!-- <img
          src="/images/b-value.png"
          alt="B-Value Plot"
          class="absolute top-0 left-0 w-full h-full object-cover rounded-2xl shadow-md" /> -->
        <MagnitudePreviewMap :origin="origin" :station-magnitudes="stationMagnitudes" />
        <!-- <OLPreviewMap
          v-if="selectedMagnitude"
          :magnitude="selectedMagnitude"
          :origin="origin"
          class="absolute w-full h-full" /> -->
      </div>
    </div>
    <div class="flex-1 flex flex-col">
      <div class="flex-1">
        <InformationList
          :informations="[
            {
              label: 'Time:',
              value: formatDate(origin.origin_time),
              width: '100px'
            },
            {
              label: 'Count:',
              value: stationMagnitudes.length
            },
            {
              label: 'Min:',
              value: Math.min(...values)
            },
            {
              label: 'Max:',
              value: Math.max(...values)
            }
          ]"
          variant="light" />
      </div>
      <div class="divider" />
      <InformationList :informations="additionalInformations" variant="light" />
    </div>
    <div class="w-[30%] max-md:w-full">
      <BValueChart :origin-id="origin._id" />
    </div>
  </div>
</template>
