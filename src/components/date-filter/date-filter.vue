<script setup lang="ts">
import 'v-calendar/style.css'

import { format as formatDate } from 'date-fns'
import { DatePicker } from 'v-calendar'

const range = defineModel<{
  start: Date
  end: Date
}>('range')
</script>

<template>
  <div class="inline-flex">
    <DatePicker v-model.range="range">
      <template #default="{ togglePopover }">
        <button
          class="flex items-center gap-2 rounded-full bg-[#0d4f73] px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 dark:bg-[#0a3a55] dark:text-slate-50 dark:focus-visible:ring-cyan-500"
          @click="togglePopover">
          <v-icon name="fa-calendar" class="h-4 w-4" />
          <span>
            {{ formatDate(range?.start ?? new Date(), 'dd MMM yyyy') }} -
            {{ formatDate(range?.end ?? new Date(), 'dd MMM yyyy') }}
          </span>
        </button>
      </template>
    </DatePicker>
  </div>
</template>
