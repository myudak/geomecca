<script setup lang="ts">
import { OriginDetail, StationMagnitude } from '@src/api-service/origin/types'
import { InformationList } from '@src/components/information-list'
import { formatDate } from '@src/utils/string'
import { ref, watch } from 'vue'

import { MockChart } from '../mock-chart'
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
      <div class="text-white">{{ origin.region }} Region</div>
      <div class="relative pb-[100%]">
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
          ]" />
      </div>
      <div class="divider" />
      <InformationList :informations="additionalInformations" />
    </div>
    <div class="w-[30%] max-md:w-full">
      <MockChart tab="magnitude" />
    </div>
  </div>
</template>
