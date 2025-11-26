<script setup lang="ts">
import { deleteStationAPI, getStationListAPI, postStationAPI, putStationAPI } from '@src/api-service/station'
import { GetStationListQuery } from '@src/api-service/station/types'
import { Input } from '@src/components/input/input'
import { Pagination } from '@src/components/pagination'
import { AddStationPayload, Station } from '@src/types/station'
import { useDebounceFn } from '@vueuse/core'
import { onMounted, ref, VNodeRef, watch } from 'vue'
import { toast } from 'vue3-toastify'

import { ConfigLayout } from '../config-layout'
import { StationForm } from '../station-form'

const stationFormModalRef = ref<VNodeRef | null>(null)
const stationDeleteModalRef = ref<VNodeRef | null>(null)

const stations = ref<Station[] | []>([])
const stationPayload = ref<AddStationPayload | null>(null)
const fetchQuery = ref<GetStationListQuery>({ page: 1, limit: 10 })
const isDataFetching = ref(false)
const isDeleting = ref(false)
const searchQuery = ref('')

// form
const isFormReset = ref(false)
const isFormLoading = ref(false)
const selectedStation = ref<Station | null>(null)
const stationFormUsage = ref('create')
const stationFormTitle = ref('Add Station')

// pagination
const totalPages = ref(1)
const totalData = ref(1)
const perPage = ref(10)
const currentPage = ref(1)

const debouncedSearch = useDebounceFn(() => {
  fetchStations()
}, 500)

watch(
  () => searchQuery.value,
  (newValue) => {
    fetchQuery.value = { ...fetchQuery.value, page: 1, q: newValue }
    debouncedSearch()
  }
)

onMounted(() => {
  fetchStations()
})

function resetPageProperty() {
  searchQuery.value = ''
  fetchQuery.value = { page: 1, limit: 10 }
  resetPage()
  fetchStations()
}

function fetchStations() {
  stations.value = []
  isDataFetching.value = true
  getStationListAPI(fetchQuery.value).then(({ data, total }) => {
    stations.value = data
    totalData.value = total as number
    totalPages.value = Math.ceil((total as number) / perPage.value)
    isDataFetching.value = false
  })
}

function addStation() {
  isFormLoading.value = true
  postStationAPI(stationPayload.value as AddStationPayload)
    .then(() => {
      isFormReset.value = true
      onStationFormModalClose()
      resetPageProperty()
      toast.success(`Berhasil menambahkan ${stationPayload.value?.name}.`, {
        autoClose: 3000,
        position: 'top-center'
      })
    })
    .catch((e: Error) => {
      toast.error(`Gagal menambahkan ${stationPayload.value?.name}. \n ${e.message}`, {
        autoClose: 3000,
        position: 'top-center'
      })
    })
    .finally(() => {
      isFormLoading.value = false
    })
}

function updateStation() {
  isFormLoading.value = true
  putStationAPI(selectedStation.value?._id as string, stationPayload.value as AddStationPayload)
    .then(() => {
      isFormReset.value = true
      onStationFormModalClose()
      resetPageProperty()
      toast.success(`Berhasil memperbarui ${stationPayload.value?.name}.`, {
        autoClose: 3000,
        position: 'top-center'
      })
    })
    .catch((e: Error) => {
      toast.error(`Gagal memperbarui ${stationPayload.value?.name}. \n ${e.message}`, {
        autoClose: 3000,
        position: 'top-center'
      })
    })
    .finally(() => {
      isFormLoading.value = false
    })
}

function removeStation() {
  isDeleting.value = true
  deleteStationAPI(selectedStation.value?._id as string)
    .then(() => {
      onModalDeleteClose()
      resetPageProperty()
      toast.success(`Berhasil menghapus ${selectedStation.value?.name}.`, {
        autoClose: 3000,
        position: 'top-center'
      })
      selectedStation.value = null
    })
    .catch((e: Error) => {
      toast.error(`Gagal menghapus ${selectedStation.value?.name}. \n ${e.message}`, {
        autoClose: 3000,
        position: 'top-center'
      })
    })
    .finally(() => {
      isDeleting.value = false
    })
}

function resetPage() {
  fetchQuery.value = { page: 1, limit: 10 }
  currentPage.value = 1
}

function onSubmitStationForm(payload: AddStationPayload) {
  isFormReset.value = false
  stationPayload.value = payload

  stationFormUsage.value === 'create' ? addStation() : updateStation()
}

function onDeleteButtonClick(station: Station) {
  isDeleting.value = false
  stationDeleteModalRef.value.showModal()
  selectedStation.value = station
}

function onEditButtonClick(station: Station) {
  selectedStation.value = station
  stationFormTitle.value = 'Edit Station'
  stationFormUsage.value = 'edit'
  stationFormModalRef.value.showModal()
}

function onStationFormModalClose() {
  stationFormModalRef.value.close()
}

function onModalDeleteClose() {
  stationDeleteModalRef.value.close()
}

function onAddStationButtonClick() {
  stationFormUsage.value = 'create'
  stationFormTitle.value = 'Add Station'
  selectedStation.value = null
  stationFormModalRef.value.showModal()
}

function showMore(page: number) {
  currentPage.value = page
  fetchQuery.value = { ...fetchQuery.value, page }
  fetchStations()
}
</script>

<template>
  <ConfigLayout>
    <div class="h-full w-full overflow-y-auto p-6 space-y-6">
      <!-- Header Card -->
      <div
        class="rounded-3xl border border-brand-surface-light-active bg-white/95 p-6 shadow-lg shadow-brand-surface-light-active/40 dark:border-brand-surface-dark-hover dark:bg-brand-surface-dark">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-brand-text-muted dark:text-brand-text-muted-dark">
              Geomecca
            </p>
            <h2 class="mt-1 text-3xl font-bold text-brand-text-light dark:text-brand-text-dark">Station Management</h2>
            <p class="text-sm text-brand-text-muted dark:text-brand-text-muted-dark">Manage seismic monitoring stations</p>
          </div>
          <button
            class="inline-flex items-center gap-2 rounded-2xl bg-brand-surface-normal px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-surface-normal/40 transition hover:bg-brand-surface-normal-hover"
            @click="onAddStationButtonClick">
            <v-icon name="md-add" scale="1.1" />
            Add Station
          </button>
        </div>
        <div class="mt-6 max-w-xl">
          <Input v-model="searchQuery" placeholder="Search stations by name, code, or network..." />
        </div>
      </div>

      <!-- Table Card -->
      <div
        class="rounded-3xl border border-brand-surface-light-active bg-white/95 shadow-xl shadow-brand-surface-light-active/40 dark:border-brand-surface-dark-hover dark:bg-brand-surface-darker">
        <div class="w-full overflow-x-auto">
          <table class="w-full table-auto text-left text-sm">
            <thead class="bg-brand-surface-light-hover/70 text-brand-text-light dark:bg-brand-surface-dark dark:text-brand-text-dark">
              <tr>
                <th class="px-6 py-4 font-semibold">Name</th>
                <th class="px-6 py-4 font-semibold">Code</th>
                <th class="px-6 py-4 font-semibold">Network</th>
                <th class="px-6 py-4 font-semibold">Channels</th>
                <th class="px-6 py-4 font-semibold">Position</th>
                <th class="px-6 py-4 font-semibold">Server</th>
                <th class="px-6 py-4 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody v-if="stations.length">
              <tr
                v-for="station in stations"
                :key="station._id"
                class="border-t border-brand-surface-light-active/60 text-brand-text-light transition hover:bg-brand-surface-light-hover/70 dark:border-brand-surface-dark-hover/40 dark:text-brand-text-dark dark:hover:bg-brand-surface-dark">
                <td class="px-6 py-4 font-semibold">{{ station.name }}</td>
                <td class="px-6 py-4">
                  <span class="rounded-full bg-brand-surface-light px-3 py-1 text-xs font-semibold text-brand-text-light dark:bg-brand-surface-dark-hover dark:text-brand-text-dark">
                    {{ station.code }}
                  </span>
                </td>
                <td class="px-6 py-4">{{ station.network }}</td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="(channel, idx) in station.channel"
                      :key="idx"
                      class="rounded-lg border border-brand-surface-light-active px-3 py-1 text-xs font-semibold text-brand-text-light dark:border-brand-surface-dark-hover dark:text-brand-text-dark">
                      {{ channel }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm">
                  <div class="flex flex-col">
                    <span>{{ station.latitude }} lat</span>
                    <span>{{ station.longitude }} lon</span>
                    <span>{{ station.elevation }} elv</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm">
                  <div class="flex flex-col">
                    <span>{{ station.server_seedlink }}</span>
                    <span class="text-brand-text-muted dark:text-brand-text-muted-dark">port {{ station.port }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex justify-center gap-3">
                    <button
                      class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-brand-surface-light-active text-brand-text-light transition hover:border-brand-surface-normal hover:bg-brand-surface-light dark:border-brand-surface-dark-hover dark:text-brand-text-dark"
                      @click="onEditButtonClick(station)">
                      <v-icon name="hi-pencil-alt" />
                    </button>
                    <button
                      class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-transparent text-error transition hover:border-error hover:bg-error/10"
                      @click="onDeleteButtonClick(station)">
                      <v-icon name="fa-regular-trash-alt" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr v-if="isDataFetching">
                <td colspan="7" class="px-6 py-12">
                  <div class="flex items-center justify-center gap-3 text-brand-text-muted dark:text-brand-text-muted-dark">
                    <div class="h-6 w-6 animate-spin rounded-full border-2 border-brand-surface-normal border-t-transparent" />
                    Loading stations...
                  </div>
                </td>
              </tr>
              <tr v-else>
                <td colspan="7" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center gap-2 text-brand-text-muted dark:text-brand-text-muted-dark">
                    <v-icon name="gi-radar-dish" scale="2" />
                    <p>No stations found</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="border-t border-brand-surface-light-active/60 px-6 py-4 dark:border-brand-surface-dark-hover/40">
          <Pagination
            :max-visible-buttons="5"
            :total-pages="totalPages"
            :total="totalData"
            :per-page="perPage"
            :current-page="currentPage"
            @pagechanged="showMore" />
        </div>
      </div>

      <!-- Station Form Modal -->
      <dialog id="station-form-modal" ref="stationFormModalRef" class="modal">
        <div class="modal-box max-w-3xl rounded-3xl border border-brand-surface-light-active bg-white/95 text-brand-text-light shadow-xl dark:border-brand-surface-dark-hover dark:bg-[#080f1c] dark:text-brand-text-dark">
          <StationForm
            :usage="stationFormUsage"
            :station-data="selectedStation"
            :title="stationFormTitle"
            :is-loading="isFormLoading"
            :is-reset="isFormReset"
            @on-cancel="onStationFormModalClose"
            @on-submit="onSubmitStationForm" />
          <div class="modal-action h-0">
            <form method="dialog" class="modal-backdrop">
              <button>close</button>
            </form>
          </div>
        </div>
      </dialog>

      <!-- Delete Confirmation Modal -->
      <dialog id="station-delete-modal" ref="stationDeleteModalRef" class="modal">
        <div class="modal-box rounded-3xl border border-brand-surface-light-active bg-white/95 text-brand-text-light shadow-xl dark:border-brand-surface-dark-hover dark:bg-brand-surface-dark dark:text-brand-text-dark">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <v-icon name="fa-exclamation-triangle" class="text-error" scale="1.2" />
            </div>
            <div>
              <h3 class="text-xl font-bold">Delete Station</h3>
              <p class="text-sm text-brand-text-muted dark:text-brand-text-muted-dark">This action cannot be undone</p>
            </div>
          </div>
          <p class="mb-6">
            Are you sure you want to delete station
            <span class="font-bold text-error">{{ selectedStation?.name }}</span
            >?
          </p>
          <div class="flex gap-3">
            <button
              class="inline-flex flex-1 items-center justify-center rounded-2xl border border-brand-surface-light-active px-4 py-2 font-semibold text-brand-text-light transition hover:border-brand-surface-normal hover:bg-brand-surface-light dark:border-brand-surface-dark-hover dark:text-brand-text-dark dark:hover:bg-brand-surface-dark-hover"
              @click="onModalDeleteClose">
              Cancel
            </button>
            <button
              class="inline-flex flex-1 items-center justify-center rounded-2xl bg-error px-4 py-2 font-semibold text-white shadow-md shadow-error/40 transition hover:bg-error/90"
              @click="removeStation">
              <div v-if="isDeleting" class="loading loading-spinner" />
              <span v-else>Delete Station</span>
            </button>
          </div>
          <div class="modal-action h-0">
            <form method="dialog" class="modal-backdrop">
              <button>close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  </ConfigLayout>
</template>


