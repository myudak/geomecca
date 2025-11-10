<script setup lang="ts">
import useGetProfile from '@src/hooks/use-get-profile'
import { Origin } from '@src/types/origin'
import { formatDate } from '@src/utils/string'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { OriginMagnitudeList } from './origin-magnitude-list'
import { OriginMap } from './origin-map'

const { origins, eventId } = defineProps<{
  eventId: string
  origins: Origin[]
  preferredOriginId: string
}>()

const { data: profile } = useGetProfile()
const selectedOrigin = ref<Origin | null>(null)

const otherOrigins = computed(() => {
  if (!selectedOrigin.value?._id) {
    return origins
  }
  return origins.filter((origin) => origin._id !== selectedOrigin.value?._id)
})

const formattedOrigins = computed(() =>
  origins
    .map((origin) => ({
      ...origin,
      totalPhases: origin.arrival_ids.length / 2
    }))
    .toSorted((a, b) => (a.totalPhases < b.totalPhases ? 1 : -1))
)
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="w-full overflow-x-auto">
      <table class="table table-sm whitespace-nowrap">
        <thead class="bg-base-200">
          <tr>
            <th>OT</th>
            <th>Phases</th>
            <th>Lat</th>
            <th>Lon</th>
            <th>Depth</th>
            <th>RMS Res (s)</th>
            <th>Az Gap (km)</th>
            <th>Err Epicenter (km)</th>
            <th>Region</th>
            <th class="sticky right-0 bg-base-200" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="origin in formattedOrigins"
            :key="origin._id"
            class="hover:cursor-pointer"
            :class="{
              'font-bold': origin._id === preferredOriginId,
              'text-teal-500': origin._id === preferredOriginId,
              'text-yellow-500': origin.modified_by === profile?._id,
              'bg-teal-500/20': origin._id === selectedOrigin?._id,
              'bg-yellow-500/20': origin.modified_by === profile?._id,
              'hover:bg-teal-800/20': origin._id !== selectedOrigin?._id,
              'hover:bg-yellow-800/20': origin.modified_by !== profile?._id
            }"
            @click="selectedOrigin = origin">
            <td>{{ formatDate(origin.origin_time) }}</td>
            <td>{{ origin.totalPhases }}</td>
            <td>{{ origin.latitude }}</td>
            <td>{{ origin.longitude }}</td>
            <td>{{ origin.depth }}</td>
            <td>{{ origin.rms }}</td>
            <td>{{ origin.gap }}</td>
            <td>{{ origin.err_epicenter }}</td>
            <td>{{ origin.sub_region }}, {{ origin.region }}</td>
            <td class="sticky right-0 bg-base-100">
              <RouterLink :to="`/origin-locator-view/location/${eventId}/${origin._id}`" class="btn btn-xs btn-primary"
                >Open</RouterLink
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="selectedOrigin" class="flex gap-2">
      <div class="w-64 h-64 min-w-64">
        <OriginMap :selected-origin="selectedOrigin" :other-origins="otherOrigins" />
      </div>
      <div class="flex-1 max-h-64 overflow-auto">
        <OriginMagnitudeList :magnitudes="selectedOrigin.magnitudes" />
      </div>
    </div>
  </div>
</template>
