<script setup lang="ts">
import { getEventDetailAPI } from '@src/api-service/event'
import { FullScreenLoading } from '@src/components/full-screen-loading'
import { PickingPage } from '@src/domain/picking/picking-page'
import { EarthQuakeEventDetail } from '@src/types/event'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { EventSummary } from '../event-summary'
import { EventTab } from '../event-tab'
import { LocationDetail } from '../location-detail'
import { MagnitudeTab } from '../magnitude-tab'
import { OriginTab } from '../origin-tab'
import { NearbyEarthquakeTab } from '../nearby-earthquake-tab'
import { TabList } from '../tab-list'

const route = useRoute()

const id = computed(() => route.params.id as string)
const originId = computed(() => route.params.originId as string)
const selectedTab = computed(() => route.params.tab as string)
const data = ref<EarthQuakeEventDetail | null>(null)
const isLoading = ref(false)
const selectedOriginId = ref('')
const showAnalysisColumn = computed(() => true)

watch(
  id,
  (newId) => {
    if (newId) {
      isLoading.value = true
      getEventDetailAPI(newId).then((response) => {
        data.value = response
        isLoading.value = false
      })
    }
  },
  { immediate: true }
)

watch(
  [() => originId.value, () => data.value?.preferred_origin_id],
  ([newOriginId, newPreferredId]) => {
    if (newOriginId) {
      selectedOriginId.value = newOriginId
    } else if (newPreferredId) {
      selectedOriginId.value = newPreferredId
    }
  },
  { immediate: true }
)
</script>

<template>
  <div
    class="flex h-full flex-1 flex-col gap-6 overflow-y-auto bg-slate-50/40 p-4 dark:bg-slate-950 md:flex-row md:overflow-hidden">
    <aside
      v-if="showAnalysisColumn"
      class="flex w-full flex-col gap-4 rounded-3xl md:w-80 md:flex-shrink-0 md:max-h-[calc(100vh-5rem)] md:overflow-y-auto md:pr-1">
      <div class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <TabList :id="id" :selected-tab="selectedTab" :origin-id="selectedOriginId" />
      </div>
      <div
        v-if="!isLoading && !!data"
        class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <EventSummary :event="data" :origin-id="selectedOriginId" />
      </div>
    </aside>

    <section
      class="flex-1 rounded-3xl border border-slate-200 bg-white/90 p-0 shadow-sm dark:border-white/10 dark:bg-slate-950/60 md:p-0">
      <div class="h-full w-full overflow-y-auto rounded-3xl p-4 text-slate-900 dark:text-slate-100">
        <LocationDetail
          v-if="!isLoading && selectedTab === 'location' && !!data"
          :event="data"
          :origin-id="selectedOriginId" />
        <MagnitudeTab v-if="!isLoading && selectedTab === 'magnitude'" :origin-id="selectedOriginId" />
        <PickingPage
          v-if="!isLoading && selectedTab === 'picking' && !!data"
          :event="data"
          :origin-id="selectedOriginId" />
        <OriginTab v-if="selectedTab === 'origin' && !!data" :event="data" />
        <EventTab v-if="selectedTab === 'events'" />
        <NearbyEarthquakeTab v-if="selectedTab === 'nearby'" />
      </div>
    </section>
    <FullScreenLoading v-if="isLoading" />
  </div>
</template>
