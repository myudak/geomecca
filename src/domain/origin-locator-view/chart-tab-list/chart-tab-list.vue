<script setup lang="ts">
import useGetWadatiPlot from '@src/hooks/use-get-wadati-plot'
import { computed, ref } from 'vue'
import VueEasyLightbox from 'vue-easy-lightbox'

import { MockChart } from '../mock-chart'

const tabs = ['Distance', 'Azimuth', 'Travel Time', 'Move Out']

const props = defineProps<{
  originId: string
}>()

const selectedTab = ref('Distance')
const isImageShow = ref(false)

const { data } = useGetWadatiPlot(props.originId)
const wadatiImage = computed(() => data?.value?.data.image)
const wadatiImageUrl = computed(() => (wadatiImage.value ? `data:image/png;base64,${wadatiImage.value}` : ''))
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-if="false" class="flex overflow-x-auto">
      <div role="tablist" class="tabs tabs-boxed w-[400px]">
        <div
          v-for="tab in tabs"
          :key="tab"
          role="tab"
          :class="{
            tab: true,
            'tab-active': tab === selectedTab
          }"
          @click="selectedTab = tab">
          {{ tab }}
        </div>
      </div>
    </div>

    <div v-if="wadatiImageUrl" class="overflow-hidden">
      <img :src="wadatiImageUrl" class="scale-105" @click="isImageShow = true" />

      <VueEasyLightbox :visible="isImageShow" :imgs="[wadatiImageUrl]" :index="0" @hide="isImageShow = false" />
    </div>

    <MockChart v-if="false" :tab="selectedTab" />
  </div>
</template>
