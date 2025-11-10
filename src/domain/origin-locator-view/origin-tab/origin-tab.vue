<script setup lang="ts">
import { OriginListTable } from '@src/components/origin-list-table'
import { EarthQuakeEventDetail } from '@src/types/event'

const { event } = defineProps<{
  event: EarthQuakeEventDetail
}>()
</script>

<template>
  <div>
    <OriginListTable :event-id="event._id" :origins="event.origins" :preferred-origin-id="event.preferred_origin_id" />
  </div>
</template>
