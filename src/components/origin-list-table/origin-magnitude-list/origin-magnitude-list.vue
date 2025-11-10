<script setup lang="ts">
import { Magnitude } from '@src/types/magnitude'

defineProps<{
  magnitudes: Magnitude[]
}>()
</script>

<template>
  <table class="table table-sm">
    <thead class="bg-base-200">
      <tr>
        <th width="100">MType</th>
        <th>M</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="magnitude in magnitudes" :key="magnitude._id">
        <td>{{ magnitude.type }}</td>
        <td>{{ magnitude.value }}</td>
      </tr>
    </tbody>
  </table>
</template>
