<script setup lang="ts">
import useGetStationWaveformStatus from '@src/hooks/use-get-station-waveform-status'
import { Station } from '@src/types/station'
import { computed } from 'vue'

import { SelectedStationWaveformList } from '../selected-station-waveform-list'

const { station } = defineProps<{
  station: Station
}>()

const { data } = useGetStationWaveformStatus(station._id)
const stationStatus = computed(() => data.value?.data)

const qualityParameters = computed(() => [
  { label: 'delay', value: `${stationStatus.value?.delay_second ?? 0} s` },
  { label: 'rms', value: 'x' },
  { label: 'spikes amplitude', value: stationStatus.value?.spike_amplitude ?? 'x' },
  { label: 'spikes count', value: 'x' },
  { label: 'spikes interval', value: 'x' },
  { label: 'timing quality', value: 'xx' }
])

const groundMotions = computed(() => [
  { label: 'acc', value: `${stationStatus.value?.acceleration ?? 0}`, unit: 'µm/s²' },
  { label: 'Vel', value: `${stationStatus.value?.velocity ?? 0}`, unit: 'µm/s' },
  { label: 'disp', value: `${stationStatus.value?.displacement ?? 0}`, unit: 'µm/s' }
])

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <div class="drawer z-[99999]">
    <input checked type="checkbox" class="drawer-toggle" />
    <div class="drawer-side">
      <label aria-label="close sidebar" class="drawer-overlay" @click="emit('close')" />
      <div
        id="selected-station-drawer"
        class="flex h-full w-full max-w-lg flex-col overflow-hidden bg-white dark:bg-brand-surface-darker">
        <!-- Header -->
        <div
          class="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-brand-surface-dark">
          <div class="flex items-center gap-3">
            <v-icon name="bi-broadcast-pin" scale="1.3" class="text-amber-600 dark:text-amber-300" />
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Station View</h2>
          </div>
          <button
            class="btn btn-sm btn-ghost text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            @click="emit('close')">
            <v-icon name="md-close" scale="1.2" />
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- Station Name -->
          <div class="text-sm text-gray-700 dark:text-gray-300">{{ station.code }} ({{ station.name }})</div>

          <!-- Quality Parameters Card -->
          <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-brand-surface-dark">
            <div class="flex items-center gap-2 mb-4">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/15">
                <v-icon name="md-circle" scale="0.6" class="text-amber-600 dark:text-amber-300" />
              </div>
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">Quality Parameters</h3>
            </div>
            <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div v-for="param in qualityParameters" :key="param.label" class="flex justify-between">
                <span class="text-gray-500 dark:text-gray-400">{{ param.label }}</span>
                <span class="text-gray-900 dark:text-gray-200">{{ param.value }}</span>
              </div>
            </div>
          </div>

          <!-- Ground Motion Card -->
          <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-brand-surface-dark">
            <div class="flex items-center gap-2 mb-4">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/15">
                <v-icon name="md-showchartrounded" scale="0.8" class="text-amber-600 dark:text-amber-300" />
              </div>
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">Ground Motion</h3>
            </div>
            <div class="grid grid-cols-3 gap-3 mb-4">
              <div
                v-for="motion in groundMotions"
                :key="motion.label"
                class="rounded-lg border border-gray-700 bg-gray-900 p-3 text-center dark:border-gray-600 dark:bg-brand-surface-darker">
                <div class="text-xs text-gray-400 dark:text-gray-500 mb-1">{{ motion.label }}</div>
                <div class="text-sm font-semibold text-white break-words">{{ motion.value }} {{ motion.unit }}</div>
              </div>
            </div>
            <!-- Waveforms -->
            <SelectedStationWaveformList :station="station" />
          </div>

          <!-- Trace Stasiun Card -->
          <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-brand-surface-dark">
            <div class="flex items-center gap-2 mb-4">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/15">
                <v-icon name="md-graphiceqoutlined" scale="0.8" class="text-amber-600 dark:text-amber-300" />
              </div>
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">Trace Stasiun</h3>
            </div>
            <SelectedStationWaveformList :station="station" />
          </div>

          <!-- Percentage Completeness Card -->
          <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-brand-surface-dark">
            <div class="flex items-center gap-2 mb-4">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/15">
                <v-icon name="md-barchartrounded" scale="0.8" class="text-amber-600 dark:text-amber-300" />
              </div>
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">Percentage Completeness</h3>
            </div>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500 dark:text-gray-400">Last 30d</span>
                <span class="text-lg font-bold text-gray-900 dark:text-white">90%</span>
              </div>
              <div class="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2.5">
                <div class="bg-green-500 h-2.5 rounded-full" style="width: 90%"></div>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Persentase ketersediaan data yang terekam oleh stasiun
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
