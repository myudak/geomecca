<script setup lang="ts">
import { OrderPhaseType } from '@src/types/waveform'

defineProps<{
  orderPhase: OrderPhaseType
}>()

defineEmits<{
  (e: 'change-order-phase', phase: OrderPhaseType): void
}>()

const phase = defineModel<string>('phase')
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <div class="flex flex-wrap items-center gap-2">
      <button
        class="rounded-full px-4 py-1 text-sm font-semibold transition"
        :class="
          orderPhase === 'OT'
            ? 'bg-brand-surface-normal text-white shadow-lg shadow-brand-numeric-400/40'
            : 'bg-brand-surface-light-hover text-brand-text-muted dark:bg-brand-surface-dark dark:text-brand-text-muted-dark'
        "
        @click="$emit('change-order-phase', 'OT')">
        OT
      </button>
      <button
        class="rounded-full px-4 py-1 text-sm font-semibold transition"
        :class="
          orderPhase === 'P'
            ? 'bg-brand-surface-normal text-white shadow-lg shadow-brand-numeric-400/40'
            : 'bg-brand-surface-light-hover text-brand-text-muted dark:bg-brand-surface-dark dark:text-brand-text-muted-dark'
        "
        @click="$emit('change-order-phase', 'P')">
        P
      </button>
      <button
        class="rounded-full px-4 py-1 text-sm font-semibold transition"
        :class="
          orderPhase === 'S'
            ? 'bg-brand-surface-normal text-white shadow-lg shadow-brand-numeric-400/40'
            : 'bg-brand-surface-light-hover text-brand-text-muted dark:bg-brand-surface-dark dark:text-brand-text-muted-dark'
        "
        @click="$emit('change-order-phase', 'S')">
        S
      </button>
    </div>

    <div class="flex items-center gap-3">
      <select
        v-model="phase"
        class="rounded-full border border-brand-surface-light-active bg-brand-surface-light px-3 py-1 text-sm text-brand-text-light outline-none dark:border-brand-surface-dark-hover dark:bg-brand-surface-dark dark:text-brand-text-dark">
        <option>P</option>
        <option>S</option>
      </select>

      <select
        class="rounded-full border border-slate-600 bg-slate-900/60 px-3 py-1 text-sm text-slate-500 outline-none"
        disabled>
        <option>No Filter</option>
      </select>

      <div class="flex items-center gap-1 text-xs font-semibold text-slate-500">
        <button class="rounded-full border border-brand-surface-light-active px-3 py-1 text-brand-text-muted dark:border-brand-surface-dark-hover dark:text-brand-text-muted-dark" disabled>
          Z
        </button>
        <button class="rounded-full border border-brand-surface-light-active px-3 py-1 text-brand-text-muted dark:border-brand-surface-dark-hover dark:text-brand-text-muted-dark" disabled>
          1(N)
        </button>
        <button class="rounded-full border border-brand-surface-light-active px-3 py-1 text-brand-text-muted dark:border-brand-surface-dark-hover dark:text-brand-text-muted-dark" disabled>
          2(E)
        </button>
      </div>
    </div>
  </div>
</template>
