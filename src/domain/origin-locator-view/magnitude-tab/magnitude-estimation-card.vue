<script setup lang="ts">
import { getBValuePlot } from '@src/api-service/magnitude'
import { computed, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    originId?: string
  }>(),
  {}
)

const imageData = ref<string | null>(null)
const bValue = ref<number | null>(null)
const aValue = ref<number | null>(null)
const totalEvents = ref<number>(0)
const loading = ref(true)
const error = ref<string | null>(null)

const imageUrl = computed(() => {
  if (!imageData.value) return null
  return `data:image/png;base64,${imageData.value}`
})

const equation = computed(() => {
  if (aValue.value === null || bValue.value === null) return 'Loading...'
  return `log₁₀ N = ${aValue.value.toFixed(3)} – ${bValue.value.toFixed(3)} M`
})

const fetchBValuePlot = async () => {
  if (!props.originId) return

  try {
    loading.value = true
    error.value = null

    const response = await getBValuePlot(props.originId)

    imageData.value = response.data.image
    bValue.value = response.data.b_value
    aValue.value = response.data.a_value
    totalEvents.value = response.data.total_events

    console.log('[MagnitudeEstimationCard] Loaded b-value plot:', {
      bValue: bValue.value,
      aValue: aValue.value,
      totalEvents: totalEvents.value
    })
  } catch (err) {
    console.error('[MagnitudeEstimationCard] Failed to load b-value plot:', err)
    error.value = 'Failed to load b-value diagram'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBValuePlot()
})

watch(() => props.originId, () => {
  fetchBValuePlot()
})
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
        <div v-if="loading" class="flex items-center justify-center h-64 text-slate-400 dark:text-slate-500">
          Loading b-value diagram...
        </div>
        <div v-else-if="error" class="flex items-center justify-center h-64 text-red-500 dark:text-red-400">
          {{ error }}
        </div>
        <img
          v-else-if="imageUrl"
          :src="imageUrl"
          alt="B-value chart"
          class="block h-full w-full object-contain bg-brand-surface-light p-6 dark:bg-brand-surface-darker" />
        <div v-else class="flex items-center justify-center h-64 text-slate-400 dark:text-slate-500">
          No data available
        </div>
      </div>
      <div class="mt-4 space-y-1 text-sm text-brand-text-muted dark:text-brand-text-muted-dark">
        <p>
          <span class="font-semibold text-brand-text-light dark:text-brand-text-dark">Equation:</span>
          {{ equation }}
        </p>
        <p>
          <span class="font-semibold text-brand-text-light dark:text-brand-text-dark">B-Value:</span>
          {{ bValue?.toFixed(3) ?? 'Loading...' }}
        </p>
        <p v-if="totalEvents > 0" class="text-xs text-brand-text-muted dark:text-brand-text-muted-dark">
          Based on {{ totalEvents }} seismic events
        </p>
      </div>
    </div>
  </div>
</template>
