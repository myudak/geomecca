<script setup lang="ts">
import { Station } from '@src/types/station'
import { computed, ref } from 'vue'

defineEmits<{
  (e: 'close'): void
  (e: 'select-channel', station: Station): void
}>()

const { stations } = defineProps<{
  stations: Station[]
}>()

const keyword = ref('')

const sortedStations = computed(() => [...stations].sort((a, b) => (a.name < b.name ? -1 : 1)))
const filteredStations = computed(() => {
  if (!keyword.value) {
    return sortedStations.value
  }
  return sortedStations.value.filter((station) => {
    const q = keyword.value.toLowerCase().trim()
    return station.code.toLowerCase().includes(q) || station.name.toLowerCase().includes(q)
  })
})
</script>

<template>
  <div class="drawer z-[9999] text-slate-900 dark:text-white">
    <input checked type="checkbox" class="drawer-toggle" />
    <div class="drawer-side">
      <label aria-label="close sidebar" class="drawer-overlay" @click="$emit('close')" />
      <div class="flex h-full w-full max-w-sm flex-col bg-white dark:bg-slate-950 transition-colors duration-200">
        <div class="flex items-center justify-between border-b border-black/5 dark:border-white/10 px-5 py-4">
          <div class="flex items-center gap-2 text-base font-semibold">
            <svg
              class="h-5 w-auto text-sky-500 dark:text-sky-400"
              viewBox="0 0 18 23"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M17 9C17 15.5 9 21 9 21C9 21 1 15.5 1 9C1 6.87827 1.84285 4.84344 3.34315 3.34315C4.84344 1.84285 6.87827 1 9 1C11.1217 1 13.1566 1.84285 14.6569 3.34315C16.1571 4.84344 17 6.87827 17 9Z"
                stroke="currentColor"
                stroke-width="2" />
              <path
                d="M12 9C12 9.79565 11.6839 10.5587 11.1213 11.1213C10.5587 11.6839 9.79565 12 9 12C8.20435 12 7.44129 11.6839 6.87868 11.1213C6.31607 10.5587 6 9.79565 6 9C6 8.20435 6.31607 7.44129 6.87868 6.87868C7.44129 6.31607 8.20435 6 9 6C9.79565 6 10.5587 6.31607 11.1213 6.87868C11.6839 7.44129 12 8.20435 12 9Z"
                stroke="currentColor"
                stroke-width="2" />
            </svg>
            <span>List Stations</span>
          </div>
          <button class="btn btn-xs btn-circle btn-ghost text-slate-600 dark:text-white" @click="$emit('close')">
            <v-icon name="md-close" :scale="1" />
          </button>
        </div>

        <label
          class="mx-5 mt-4 flex items-center gap-3 rounded-full bg-slate-100/60 px-4 py-2 text-sm transition focus-within:bg-slate-200 dark:bg-white/5 dark:focus-within:bg-white/10">
          <v-icon name="fa-search" :scale="0.9" class="text-slate-500 dark:text-slate-400" />
          <input
            v-model="keyword"
            class="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-500"
            placeholder="Cari stasiun..." />
        </label>

        <div class="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          <div
            v-for="station in filteredStations"
            :id="`${station.network}-${station.code}`"
            :key="station._id"
            class="cursor-pointer rounded-2xl border border-black/5 bg-slate-100/60 px-4 py-3 transition hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            @click="$emit('select-channel', station)">
            <div class="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600 dark:text-sky-400">
              {{ station.code }}
            </div>
            <div class="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              {{ station.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
