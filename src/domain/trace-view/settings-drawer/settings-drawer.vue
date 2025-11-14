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
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[9999] flex justify-end">
      <div class="absolute inset-0 bg-black/40" @click="emit('close')" />
      <div
        class="relative h-full w-80 lg:w-96 bg-brand-surface-light dark:bg-brand-surface-darker text-brand-text-light dark:text-brand-text-dark shadow-2xl border-l border-brand-surface-light-active dark:border-brand-surface-dark-hover flex flex-col">
        <div class="flex items-center justify-between p-4 border-b border-brand-surface-light-active dark:border-brand-surface-dark-hover">
          <div class="flex items-center gap-2">
            <v-icon name="md-settings" scale="1" class="text-brand-surface-normal" />
            <h2 class="text-lg font-semibold text-brand-text-light dark:text-brand-text-dark">Trace View Settings</h2>
          </div>
          <button
            class="btn btn-ghost btn-sm btn-circle text-brand-text-muted hover:text-brand-text-light dark:text-brand-text-muted-dark dark:hover:text-brand-text-dark"
            @click="emit('close')">
            <v-icon name="md-close" scale="1" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-6">
          <div class="space-y-2">
            <label class="text-sm font-medium text-brand-text-light dark:text-brand-text-dark">Number of channels displayed</label>
            <select
              class="select select-bordered w-full bg-brand-surface-light-hover dark:bg-brand-surface-dark border-brand-surface-light-active dark:border-brand-surface-dark-hover text-brand-text-light dark:text-brand-text-dark"
              :value="maxChannels"
              @change="onChange($event)">
              <option v-for="option in NO_CHANNEL_OPTIONS" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>

          <div class="space-y-3">
            <label class="text-sm font-medium text-brand-text-light dark:text-brand-text-dark">Filter</label>
            <div class="space-y-2">
              <div
                v-for="(option, index) in FILTER_CONFIG_OPTIONS"
                :key="index"
                class="flex items-center justify-between p-3 rounded-lg bg-brand-surface-light-hover dark:bg-brand-surface-dark hover:bg-brand-surface-light-active dark:hover:bg-brand-surface-dark-hover cursor-pointer transition-colors border border-transparent"
                :class="{ 'border-brand-surface-normal bg-brand-surface-light dark:bg-brand-surface-dark focus:ring-2 focus:ring-brand-surface-normal': filterConfig?.low === option.low }"
                @click="$emit('change-filter-config', option)">
                <span class="text-sm text-brand-text-light dark:text-brand-text-dark font-medium">
                  {{ option.low }}-{{ option.high }} Hz
                </span>
                <input
                  type="radio"
                  name="filter"
                  class="radio radio-primary radio-sm"
                  :checked="filterConfig?.low === option.low"
                  @click.stop="$emit('change-filter-config', option)" />
              </div>

              <div
                class="flex items-center justify-between p-3 rounded-lg bg-brand-surface-light-hover dark:bg-brand-surface-dark hover:bg-brand-surface-light-active dark:hover:bg-brand-surface-dark-hover cursor-pointer transition-colors border border-transparent"
                :class="{ 'border-brand-surface-normal bg-brand-surface-light dark:bg-brand-surface-dark': !filterConfig }"
                @click="$emit('change-filter-config')">
                <span class="text-sm text-brand-text-light dark:text-brand-text-dark font-medium">Default</span>
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
  </Teleport>
</template>
