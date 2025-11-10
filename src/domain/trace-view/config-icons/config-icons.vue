<template>
  <div class="flex gap-2">
    <button
      class="btn btn-square btn-sm bg-gray-200 dark:bg-gray-700 hover:bg-primary border-gray-300 dark:border-gray-600 hover:border-primary transition-all text-gray-700 dark:text-gray-300 hover:text-white"
      @click="emit('open-map')">
      <v-icon name="fa-map" scale="0.9" />
    </button>

    <button
      class="btn btn-square btn-sm bg-gray-200 dark:bg-gray-700 hover:bg-primary border-gray-300 dark:border-gray-600 hover:border-primary transition-all text-gray-700 dark:text-gray-300 hover:text-white"
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
