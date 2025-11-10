<script setup lang="ts">
import { getOriginDetail } from '@src/api-service/origin'
import { useQuery } from '@tanstack/vue-query'
import { computed, ref } from 'vue'

import { MagnitudeDetail } from '../magnitude-detail'
import { MagnitudeList } from '../magnitude-list'

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

// watch(
//   magnitudeTypes,
//   (newMagnitudeTypes) => {
//     if (newMagnitudeTypes.length > 0) {
//       selectedMagnitudeIndex.value = newMagnitudeTypes[0]
//     }
//   },
//   { immediate: true }
// )
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex">
      <div role="tablist" class="tabs tabs-boxed">
        <button
          v-for="(magnitudeType, index) in magnitudeTypes"
          :key="magnitudeType"
          role="tab"
          :class="{
            tab: true,
            'tab-active': index === selectedMagnitudeIndex
          }"
          @click="selectedMagnitudeIndex = index">
          {{ magnitudeType }}
        </button>
      </div>
    </div>

    <MagnitudeDetail
      v-if="selectedMagnitudes && originDetail"
      :origin="originDetail"
      :station-magnitudes="selectedMagnitudes.station_magnitudes" />

    <MagnitudeList v-if="selectedMagnitudes" :magnitudes="selectedMagnitudes.station_magnitudes" />
  </div>
</template>
