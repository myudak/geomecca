<script setup lang="ts">
import { PutEventCommitAPIArrival } from '@src/api-service/event/types'
import { CommitConfirmationModal } from '@src/domain/picking/commit-confirmation-modal'
import usePutEventCommit from '@src/hooks/use-put-event-commit'
import { usePickerStore } from '@src/stores/picker'
import { Arrival } from '@src/types/arrival'
import { EarthQuakeEventDetail } from '@src/types/event'
import { Pick } from '@src/types/pick'
import { Station } from '@src/types/station'
import { formatDate, getPreferredOrigin } from '@src/utils/string'
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { toast } from 'vue3-toastify'

interface SelectedPick {
  [pickId: string]: {
    selected: boolean
  }
}

const { event, originId } = defineProps<{
  event: EarthQuakeEventDetail
  originId?: string
}>()

const pickerStore = usePickerStore()
const { mutateAsync: commitEvent } = usePutEventCommit()

const isConfirmationModalShow = ref(false)
const selectedPicks = ref<SelectedPick>({})

const preferredOrigin = getPreferredOrigin(event, originId)!
const updatedPick = pickerStore.events[event._id]
const arrivals = computed(() => preferredOrigin.arrivals ?? [])
const selectedPickIds = computed(() =>
  Object.keys(selectedPicks.value).filter((pickId) => selectedPicks.value[pickId].selected)
)

const groupedArrivals = computed(() => {
  const groupedArrival: Record<
    string,
    {
      pick: Pick
      station: Station
      phase: {
        p?: Arrival & {
          original: string
          updated?: string
        }
        s?: Arrival & {
          original: string
          updated?: string
        }
      }
    }
  > = {}

  for (const arrival of arrivals.value) {
    if (!arrival.pick_details?._id) {
      continue
    }

    if (!groupedArrival[arrival.pick_details._id]) {
      groupedArrival[arrival.pick_details._id] = {
        pick: arrival.pick_details,
        station: arrival.station_details,
        phase: {}
      }
    }

    if (arrival.phase_type === 'P') {
      groupedArrival[arrival.pick_details._id].phase['p'] = {
        ...arrival,
        ...getPickerTimestamp(arrival)
      }
    } else {
      groupedArrival[arrival.pick_details._id].phase['s'] = {
        ...arrival,
        ...getPickerTimestamp(arrival)
      }
    }
  }

  return Object.values(groupedArrival)
})

const getPickerTimestamp = (arrival: Arrival) => {
  if (!updatedPick || !updatedPick[arrival.pick_details._id]) {
    return {
      original: arrival.timestamp
    }
  }

  if (arrival.phase_type === 'P') {
    return {
      original: arrival.timestamp,
      updated: updatedPick[arrival.pick_details._id]?.p?.timestamp
    }
  }

  return {
    original: arrival.timestamp,
    updated: updatedPick[arrival.pick_details._id]?.s?.timestamp
  }
}

const toggleSelectedArrival = (pickId: string) => {
  selectedPicks.value = {
    ...selectedPicks.value,
    [pickId]: {
      selected: !selectedPicks.value[pickId].selected
    }
  }
}

const onConfirmCommit = async () => {
  const usedArrivals: PutEventCommitAPIArrival[] = []

  const filteredPicks = groupedArrivals.value.filter((arrival) => selectedPickIds.value.includes(arrival.pick._id))

  filteredPicks.forEach((pick) => {
    if (pick.phase.s) {
      usedArrivals.push({
        ...pick.phase.s,
        pick_source_id: pick.pick._id,
        station_id: pick.station._id,
        timestamp: pick.phase.s.updated ?? pick.phase.s.original
      })
    }
    if (pick.phase.p) {
      usedArrivals.push({
        ...pick.phase.p,
        pick_source_id: pick.pick._id,
        station_id: pick.station._id,
        timestamp: pick.phase.p.updated ?? pick.phase.p.original
      })
    }
  })

  try {
    isConfirmationModalShow.value = false

    const { status, data: newEventData } = await commitEvent({
      eventId: event._id,
      originId: preferredOrigin._id,
      arrivals: usedArrivals
    })

    if (!status) {
      throw Error('unsuccessfull commit event')
    }

    toast.success('Successfully commit the event arrivals')
    //if (newEventData._id === event._id) {
    //  window.location.reload()
    //} else {
    //  router.replace(`/origin-locator-view/location/${newEventData._id}`)
    //}

    window.location.assign(`/origin-locator-view/location/${newEventData._id}/${newEventData.updated_origin_id}`)
  } catch (e) {
    toast.error('Failed to commit the event arrivals')
  }
}

watch(
  groupedArrivals,
  (newGroupedArrivals) => {
    const newSelectedPicks: SelectedPick = {}

    for (const groupedArrival of newGroupedArrivals) {
      const isPChecked = groupedArrival.phase.p?.checked ?? false
      const isSChecked = groupedArrival.phase.s?.checked ?? false
      newSelectedPicks[groupedArrival.pick._id] = {
        selected: isPChecked || isSChecked || false
      }
    }

    selectedPicks.value = newSelectedPicks
  },
  { immediate: true }
)
</script>

<template>
  <div v-if="arrivals.length > 0" class="flex flex-col gap-4 text-slate-900 dark:text-slate-100">
    <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
      <table class="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-800">
        <thead class="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-900/70 dark:text-slate-400">
          <tr>
            <th class="px-4 py-3 w-16 text-left">Used</th>
            <th class="px-4 py-3 text-left">Station</th>
            <th class="px-4 py-3 text-left">Network</th>
            <th class="px-4 py-3 text-right">P</th>
            <th class="px-4 py-3 text-right">S</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          <tr
            v-for="groupedArrival in groupedArrivals"
            :key="groupedArrival.pick._id"
            class="cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
            @click="toggleSelectedArrival(groupedArrival.pick._id)">
            <td class="px-4 py-3">
              <input
                v-if="selectedPicks[groupedArrival.pick._id]"
                v-model="selectedPicks[groupedArrival.pick._id].selected"
                type="checkbox"
                class="h-4 w-4 cursor-pointer rounded border-slate-300 text-sky-500 focus:ring-sky-400 dark:border-slate-600"
                @click.stop />
            </td>
            <td class="px-4 py-3 font-semibold text-slate-700 dark:text-slate-100">
              {{ groupedArrival.station.code }}
            </td>
            <td class="px-4 py-3 text-slate-500 dark:text-slate-300">
              {{ groupedArrival.station.network }}
            </td>
            <td class="px-4 py-3 text-right">
              <div v-if="groupedArrival.phase.p" class="space-y-1 text-xs text-slate-600 dark:text-slate-200">
                <div :class="groupedArrival.phase.p.updated ? 'line-through text-slate-400 dark:text-slate-500' : ''">
                  {{ formatDate(groupedArrival.phase.p.original) }}
                </div>
                <div v-if="groupedArrival.phase.p.updated" class="rounded-full bg-amber-100/60 px-2 py-0.5 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100">
                  updated: {{ formatDate(groupedArrival.phase.p.updated) }}
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-right">
              <div v-if="groupedArrival.phase.s" class="space-y-1 text-xs text-slate-600 dark:text-slate-200">
                <div :class="groupedArrival.phase.s.updated ? 'line-through text-slate-400 dark:text-slate-500' : ''">
                  {{ formatDate(groupedArrival.phase.s.original) }}
                </div>
                <div v-if="groupedArrival.phase.s.updated" class="rounded-full bg-amber-100/60 px-2 py-0.5 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100">
                  updated: {{ formatDate(groupedArrival.phase.s.updated!) }}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex flex-wrap items-center justify-end gap-3">
      <RouterLink
        :to="`/origin-locator-view/picking/${event._id}/${originId}`"
        class="rounded-full border border-slate-300 px-6 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-400 hover:text-sky-600 dark:border-slate-600 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:text-sky-300">
        Picker
      </RouterLink>
      <button
        class="rounded-full bg-sky-600 px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:opacity-70"
        type="button"
        :title="selectedPickIds.length < 4 ? 'Pick at least 4 arrivals before committing' : ''"
        :disabled="selectedPickIds.length < 4"
        @click="isConfirmationModalShow = true">
        Commit
      </button>
    </div>
  </div>

  <CommitConfirmationModal
    :total-arrivals="selectedPickIds.length"
    :is-open="isConfirmationModalShow"
    @close="isConfirmationModalShow = false"
    @confirm="onConfirmCommit()" />
</template>
