<script setup lang="ts">
import { downloadArrivalCatalog } from '@src/api-service/arrival'
import { Origin } from '@src/types/origin'
import { ref } from 'vue'

const { origin } = defineProps<{
  origin: Origin
}>()

const originId = origin._id
const isLoading = ref(false)

const downloadTextFile = (filename: string, content: string) => {
  const element = document.createElement('a')
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content))
  element.setAttribute('download', filename)

  element.style.display = 'none'
  document.body.appendChild(element)

  element.click()
  document.body.removeChild(element)
}

const download = async () => {
  try {
    isLoading.value = true
    const { file } = await downloadArrivalCatalog(originId)
    downloadTextFile(`${origin.name}.txt`, atob(file))
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <button v-if="isLoading" class="btn btn-primary btn-sm btn-disabled">
    <span class="loading loading-spinner" />
    Downloading...
  </button>
  <button v-else class="btn btn-primary btn-sm" @click="download">
    <v-icon name="fa-download" :scale="0.8" />
    Download
  </button>
</template>
