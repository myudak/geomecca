<template>
  <div class="flex gap-2">
    <button
      class="btn btn-square btn-sm border border-brand-surface-light-active bg-brand-surface-light-hover text-brand-text-light transition-all hover:border-brand-surface-normal hover:bg-brand-surface-light dark:border-brand-surface-dark-hover dark:bg-brand-surface-dark dark:text-brand-text-dark dark:hover:bg-brand-surface-dark-hover"
      @click="emit('open-map')">
      <v-icon name="fa-map" scale="0.9" />
    </button>

    <button
      class="btn btn-square btn-sm border border-brand-surface-light-active bg-brand-surface-light-hover text-brand-text-light transition-all hover:border-brand-surface-normal hover:bg-brand-surface-light dark:border-brand-surface-dark-hover dark:bg-brand-surface-dark dark:text-brand-text-dark dark:hover:bg-brand-surface-dark-hover"
      @click="emit('open-settings')">
      <v-icon name="md-settings" scale="0.9" />
    </button>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'open-map'): void
  (e: 'open-list'): void
  (e: 'open-settings'): void
}>()
</script>
