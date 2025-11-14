<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    bValue?: number
    equation?: string
    mockGraph?: boolean
  }>(),
  {
    bValue: 1.944,
    equation: 'log₁₀ N = 2.962 – 1.944 M',
    mockGraph: true
  }
)
</script>

<template>
  <div
    class="rounded-[32px] border border-brand-surface-light-active bg-brand-surface-light p-6 text-brand-text-light shadow-lg dark:border-brand-surface-dark-hover dark:bg-brand-surface-darker dark:text-brand-text-dark">
    <header class="mb-6 flex items-center gap-3">
      <div
        class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 dark:border-slate-600 dark:text-slate-300">
        <v-icon name="gi-sound-waves" />
      </div>
      <div class="flex-1">
        <p class="text-xs uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">Microseismic Analyst</p>
        <h2 class="text-xl font-semibold text-slate-900 dark:text-white">B-value Estimation (Gutenberg–Richter)</h2>
      </div>
      <slot name="range" />
    </header>

    <div
      class="rounded-3xl border border-brand-surface-light-active bg-brand-surface-light-hover p-4 dark:border-brand-surface-dark-hover dark:bg-brand-surface-dark">
      <div
        class="overflow-hidden rounded-2xl border border-brand-surface-light-active bg-brand-surface-light dark:border-brand-surface-dark-hover dark:bg-brand-surface-darker">
        <img
          src="/images/b-value.png"
          alt="B-value chart"
          class="block h-full w-full object-contain bg-brand-surface-light p-6 dark:bg-brand-surface-darker" />
      </div>
      <div class="mt-4 space-y-1 text-sm text-brand-text-muted dark:text-brand-text-muted-dark">
        <p>
          <span class="font-semibold text-brand-text-light dark:text-brand-text-dark">Equation:</span>
          {{ props.equation }}
        </p>
        <p>
          <span class="font-semibold text-brand-text-light dark:text-brand-text-dark">B-Value:</span>
          {{ props.bValue?.toFixed(3) }}
        </p>
        <p class="text-xs text-brand-text-muted dark:text-brand-text-muted-dark">
          Kejadian seismik didominasi oleh nilai magnitudo kecil.
        </p>
      </div>
    </div>
  </div>
</template>
