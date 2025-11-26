<script setup lang="ts">
import { Input } from '@src/components/input/input'
import { AddStationPayload, Station } from '@src/types/station'
import { ref, watch } from 'vue'

const emit = defineEmits<{
  (e: 'onCancel', value: null): void
  (e: 'onSubmit', value: AddStationPayload): void
}>()

const props = defineProps<{
  usage?: string
  stationData?: Station | null
  title: string
  isLoading: boolean
  isReset: boolean
}>()

const name = ref('')
const code = ref('')
const network = ref('')
const latitude = ref<number | null>(null)
const longitude = ref<number | null>(null)
const elevation = ref<number | null>(null)
const server_seedlink = ref('')
const server_fdsn = ref('')
const channel = ref([''])

function resetForm() {
  name.value = ''
  code.value = ''
  network.value = ''
  latitude.value = null
  longitude.value = null
  elevation.value = null
  server_seedlink.value = ''
  server_fdsn.value = ''
  channel.value = ['']
}

watch(
  () => props.stationData,
  (newValue) => {
    if (newValue) {
      mappedDataToForm(newValue as Station)
    } else {
      resetForm()
    }
  }
)

watch(
  () => props.isReset,
  (newValue) => {
    if (newValue) {
      resetForm()
    }
  }
)

function mappedDataToForm(station: Station) {
  name.value = station.name
  code.value = station.code
  network.value = station.network
  latitude.value = station.latitude
  longitude.value = station.longitude
  elevation.value = station.elevation
  server_seedlink.value = station.server_seedlink
  server_fdsn.value = station.server_fdsn
  channel.value = station.channel
}

function onSubmitForm() {
  emit('onSubmit', {
    name: name.value,
    code: code.value,
    network: network.value,
    latitude: latitude.value as number,
    longitude: longitude.value as number,
    elevation: elevation.value as number,
    server_seedlink: server_seedlink.value,
    server_fdsn: server_fdsn.value,
    channel: channel.value
  })
}

function addChannel() {
  channel.value.push('')
}

function removeChannel(index: number) {
  channel.value.splice(index, 1)
}
</script>

<template>
  <div class="flex flex-col gap-5 rounded-3xl border border-brand-surface-light-active bg-white/95 p-6 shadow-xl shadow-brand-surface-light-active/40 dark:border-brand-surface-dark-hover dark:bg-[#080f1c]">
    <div class="mb-2">
      <p class="text-xs font-semibold uppercase tracking-[0.3em] text-brand-text-muted dark:text-brand-text-muted-dark">Geomecca</p>
      <h3 class="text-2xl font-bold text-brand-text-light dark:text-brand-text-dark">{{ title }}</h3>
      <p class="mt-1 text-sm text-brand-text-muted dark:text-brand-text-muted-dark">Fill in the station details below</p>
    </div>
    <div class="flex flex-col gap-4">
      <Input v-model="name" label="Name" />
      <Input v-model="code" label="Code" />
      <Input v-model="network" label="Network" />

      <div class="rounded-2xl border border-brand-surface-light-active bg-brand-surface-light-hover/80 p-4 dark:border-brand-surface-dark-hover dark:bg-brand-surface-dark">
        <div class="flex items-center justify-between mb-3">
          <div class="label pl-0 font-semibold pt-0">
            <span class="label-text text-brand-text-light dark:text-brand-text-dark">Channels</span>
          </div>
          <button class="btn btn-sm btn-primary rounded-lg gap-2" @click="addChannel">
            <v-icon name="md-add" scale="0.9" />
            Add Channel
          </button>
        </div>
        <div class="flex flex-col gap-3">
          <div v-for="(_, idx) in channel" :key="idx" class="flex gap-3">
            <Input v-model="channel[idx]" class="flex-1" />
            <button
              class="btn btn-square btn-ghost text-error hover:bg-red-50 dark:hover:bg-[#3a2a2a]"
              @click="removeChannel(idx)">
              <v-icon name="fa-regular-trash-alt" />
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3 max-md:grid-cols-1 gap-4">
        <Input v-model="latitude" label="Latitude" type="number" />
        <Input v-model="longitude" label="Longitude" type="number" />
        <Input v-model="elevation" label="Elevation" type="number" />
      </div>
      <Input v-model="server_seedlink" label="Server Seedlink" />
      <Input v-model="server_fdsn" label="Server FDSN" />

      <div class="flex gap-3 mt-2">
        <button
          class="inline-flex flex-1 items-center justify-center rounded-2xl border border-brand-surface-light-active px-4 py-2 text-sm font-semibold text-brand-text-light transition hover:border-brand-surface-normal hover:bg-brand-surface-light dark:border-brand-surface-dark-hover dark:text-brand-text-dark dark:hover:bg-brand-surface-dark-hover"
          @click="emit('onCancel', null)">
          Cancel
        </button>
        <button
          class="inline-flex flex-1 items-center justify-center rounded-2xl bg-brand-surface-normal px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-surface-normal/40 transition hover:bg-brand-surface-normal-hover"
          @click="onSubmitForm">
          <div v-if="isLoading" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <span v-else>{{ usage === 'edit' ? 'Update Station' : 'Create Station' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
