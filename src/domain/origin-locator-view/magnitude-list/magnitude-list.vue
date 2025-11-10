<script setup lang="ts">
import { StationMagnitude } from '@src/api-service/origin/types'
import { Station } from '@src/types/station'

defineProps<{
  magnitudes: StationMagnitude[]
}>()

const getChannel = (station: Station) => {
  const selectedChannel = station.channel.find((channel) => channel.toLowerCase().endsWith('z'))
  return selectedChannel ?? station.channel[0]
}
</script>

<template>
  <table class="table table-sm">
    <thead class="bg-base-200 sticky top-0">
      <tr class="text-center">
        <th width="100">Net</th>
        <th width="100">Sta</th>
        <th width="100">Loc/Cha</th>
        <th class="text-right">Mag</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="magnitude in magnitudes" :key="magnitude._id" class="text-center">
        <td>{{ magnitude.station_details[0].network }}</td>
        <td>{{ magnitude.station_details[0].code }}</td>
        <td>
          {{ getChannel(magnitude.station_details[0]) }}
        </td>
        <td class="text-right">{{ magnitude.value }}</td>
      </tr>
    </tbody>
  </table>
</template>
