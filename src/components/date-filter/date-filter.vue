<script setup lang="ts">
import 'v-calendar/style.css'

import { computed } from 'vue'
import { format as formatDate } from 'date-fns'
import { DatePicker } from 'v-calendar'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'subtle'
  }>(),
  {
    variant: 'primary'
  }
)

const range = defineModel<{
  start: Date
  end: Date
}>('range')

const buttonClass = computed(() =>
  props.variant === 'subtle'
    ? 'flex items-center gap-2 rounded-full border border-brand-surface-light-active bg-brand-surface-light px-5 py-2 text-sm font-semibold text-brand-text-light shadow-sm transition hover:border-brand-surface-normal focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-surface-light-active dark:border-brand-surface-dark-hover dark:bg-brand-surface-dark dark:text-brand-text-dark'
    : 'flex items-center gap-2 rounded-full bg-brand-surface-normal px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-surface-normal focus-visible:ring-offset-2 dark:bg-brand-surface-dark dark:text-brand-text-dark dark:focus-visible:ring-brand-surface-dark'
)

const iconClass = computed(() =>
  props.variant === 'subtle' ? 'h-4 w-4 text-brand-text-muted dark:text-brand-text-muted-dark' : 'h-4 w-4'
)

const textClass = computed(() =>
  props.variant === 'subtle' ? 'text-brand-text-light dark:text-brand-text-dark' : 'text-white dark:text-brand-text-dark'
)
</script>

<template>
  <div class="inline-flex">
    <DatePicker v-model.range="range">
      <template #default="{ togglePopover }">
        <button :class="buttonClass" @click="togglePopover">
          <v-icon name="fa-calendar" :class="iconClass" />
          <span :class="textClass">
            {{ formatDate(range?.start ?? new Date(), 'dd MMM yyyy') }} -
            {{ formatDate(range?.end ?? new Date(), 'dd MMM yyyy') }}
          </span>
        </button>
      </template>
    </DatePicker>
  </div>
</template>
