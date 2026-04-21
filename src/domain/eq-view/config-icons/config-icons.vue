<script setup lang="ts">
defineEmits<{
  (e: 'open-list'): void
  (e: 'open-settings'): void
}>()
</script>

<template>
  <div class="flex gap-1 items-center">
    <button
      class="btn btn-square btn-sm border border-brand-surface-light-active bg-brand-surface-light-hover text-brand-text-light transition-all hover:border-brand-surface-normal hover:bg-brand-surface-light dark:border-brand-surface-dark-hover dark:bg-brand-surface-dark dark:text-brand-text-dark dark:hover:bg-brand-surface-dark-hover"
      @click="$emit('open-list')">
      <v-icon name="fa-list" scale="0.9" />
    </button>

    <button
      class="btn btn-square btn-sm border border-brand-surface-light-active bg-brand-surface-light-hover text-brand-text-light transition-all hover:border-brand-surface-normal hover:bg-brand-surface-light dark:border-brand-surface-dark-hover dark:bg-brand-surface-dark dark:text-brand-text-dark dark:hover:bg-brand-surface-dark-hover"
      @click="$emit('open-settings')">
      <v-icon name="md-settings" scale="0.9" />
    </button>
  </div>
</template>
