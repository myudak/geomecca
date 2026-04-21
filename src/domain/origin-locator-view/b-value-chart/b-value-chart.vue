<script setup lang="ts">
import { getBValuePlot } from '@src/api-service/magnitude'
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  originId: string
}>()

const imageData = ref<string | null>(null)
const bValue = ref<number | null>(null)
const aValue = ref<number | null>(null)
const totalEvents = ref<number>(0)
const loading = ref(true)
const error = ref<string | null>(null)

const imageUrl = computed(() => {
  if (!imageData.value) return null
  return imageData.value.startsWith('data:') ? imageData.value : `data:image/png;base64,${imageData.value}`
})

const fetchBValuePlot = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await getBValuePlot(props.originId)

    imageData.value = response.data.image
    bValue.value = response.data.b_value
    aValue.value = response.data.a_value
    totalEvents.value = response.data.total_events

    console.log('[BValueChart] Loaded b-value plot:', {
      bValue: bValue.value,
      aValue: aValue.value,
      totalEvents: totalEvents.value
    })
  } catch (err) {
    console.error('[BValueChart] Failed to load b-value plot:', err)
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
  <div class="w-full h-full flex items-center justify-center">
    <div v-if="loading" class="text-slate-400 dark:text-slate-500">Loading b-value diagram...</div>
    <div v-else-if="error" class="text-red-500 dark:text-red-400">{{ error }}</div>
    <div v-else-if="imageUrl" class="w-full h-full flex flex-col">
      <img :src="imageUrl" alt="B-Value Plot" class="w-full h-full object-contain" />
      <div class="mt-2 text-xs text-center text-slate-600 dark:text-slate-400">
        Based on {{ totalEvents }} events
      </div>
    </div>
    <div v-else class="text-slate-400 dark:text-slate-500">No data available</div>
  </div>
</template>
