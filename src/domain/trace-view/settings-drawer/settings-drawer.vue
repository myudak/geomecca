<script setup lang="ts">
const NO_CHANNEL_OPTIONS = [5, 10, 15, 20, 30, 40, 50]
const FILTER_CONFIG_OPTIONS = [
  {
    low: 0.7,
    high: 2
  },
  {
    low: 1,
    high: 3
  },
  {
    low: 2,
    high: 4
  },
  {
    low: 4,
    high: 8
  }
]

interface FilterConfig {
  low: number
  high: number
}

defineProps<{
  maxChannels: number
  open: boolean
  filterConfig?: FilterConfig
}>()

const emit = defineEmits<{
  (e: 'change-max-channels', value: number): void
  (e: 'change-filter-config', filterConfig?: FilterConfig): void
  (e: 'close'): void
}>()

const onChange = (event) => {
  emit('change-max-channels', event.target.value)
}
</script>

<template>
  <div class="drawer drawer-end z-50">
    <input id="my-drawer" type="checkbox" class="drawer-toggle" :checked="open" />
    <div class="drawer-side">
      <label aria-label="close sidebar" class="drawer-overlay" @click="emit('close')" />

      <div class="w-80 min-h-full bg-white dark:bg-[#202020] text-base-content flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-2">
            <v-icon name="md-settings" scale="1" class="text-primary" />
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Trace View Settings</h2>
          </div>
          <button
            class="btn btn-ghost btn-sm btn-circle text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            @click="emit('close')">
            <v-icon name="md-close" scale="1" />
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-4">
          <div class="space-y-6">
            <!-- Number of channels -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Number of channels displayed</label>
              <select
                class="select select-bordered w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                :value="maxChannels"
                @change="onChange($event)">
                <option v-for="option in NO_CHANNEL_OPTIONS" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
            </div>

            <!-- Filter Section -->
            <div class="space-y-3">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Filter</label>

              <!-- Filter Options -->
              <div class="space-y-2">
                <div
                  v-for="(option, index) in FILTER_CONFIG_OPTIONS"
                  :key="index"
                  class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors border border-transparent"
                  :class="{
                    'border-primary bg-primary/5 dark:bg-primary/10': filterConfig?.low === option.low
                  }"
                  @click="$emit('change-filter-config', option)">
                  <span class="text-sm text-gray-900 dark:text-white font-medium">
                    {{ option.low }}-{{ option.high }} Hz
                  </span>
                  <input
                    type="radio"
                    name="filter"
                    class="radio radio-primary radio-sm"
                    :checked="filterConfig?.low === option.low"
                    @click.stop="$emit('change-filter-config', option)" />
                </div>

                <!-- Default Option -->
                <div
                  class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors border border-transparent"
                  :class="{
                    'border-primary bg-primary/5 dark:bg-primary/10': !filterConfig
                  }"
                  @click="$emit('change-filter-config')">
                  <span class="text-sm text-gray-900 dark:text-white font-medium">Default</span>
                  <input
                    type="radio"
                    name="filter"
                    class="radio radio-primary radio-sm"
                    :checked="!filterConfig"
                    @click.stop="$emit('change-filter-config')" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
