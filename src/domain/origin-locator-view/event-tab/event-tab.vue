<script setup lang="ts">
import { getAllEventListAPI } from '@src/api-service/event'
import { GetAllEventListQuery } from '@src/api-service/event/types'
import { DateFilter } from '@src/components/date-filter'
import { EventListTable } from '@src/components/event-list-table'
import { EarthQuakeEvent } from '@src/types/event'
import { endOfDay, startOfDay, subWeeks } from 'date-fns'
import { computed, ref, watch } from 'vue'

const page = ref(1)
const totalPerPage = ref(1000)
const dateRange = ref({
  start: startOfDay(subWeeks(new Date(), 1)),
  end: endOfDay(new Date())
})
const startDate = computed(() => dateRange.value.start.toISOString())
const endDate = computed(() => dateRange.value.end.toISOString())
const data = ref<EarthQuakeEvent[]>([])

const params = computed(() => ({
  page: page.value,
  totalPerPage: totalPerPage.value,
  startDate: startDate.value,
  endDate: endDate.value
}))
const eventList = computed(() => data.value ?? [])

const fetchEventList = (newParams: GetAllEventListQuery) => {
  getAllEventListAPI(newParams).then((response) => {
    data.value = response.data
  })
}

watch(
  params,
  (newParams) => {
    fetchEventList(newParams)
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <section class="flex flex-col gap-4 rounded-[32px] border border-brand-surface-light-active bg-brand-surface-light p-6 text-brand-text-light shadow dark:border-brand-surface-dark-hover dark:bg-brand-surface-darker dark:text-brand-text-dark">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-xs uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">Event Logs</p>
        <h2 class="text-xl font-semibold text-slate-900 dark:text-white">All Recorded Events</h2>
      </div>
      <DateFilter v-model:range="dateRange" />
    </div>
    <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/40">
      <EventListTable :events="eventList" />
    </div>
  </section>
</template>
