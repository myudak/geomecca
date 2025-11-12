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
    <div class="p-6 w-full">
      <!-- Header Card -->
      <div class="bg-white dark:bg-[#202020] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Station Management</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage seismic monitoring stations</p>
          </div>
          <button
            class="btn btn-primary gap-2 rounded-lg hover:shadow-lg transition-all"
            @click="onAddStationButtonClick">
            <v-icon name="md-add" scale="1.1" />
            Add Station
          </button>
        </div>
        <Input v-model="searchQuery" class="max-w-md" placeholder="Search stations by name, code, or network..." />
      </div>

      <!-- Table Card -->
      <div
        class="bg-white dark:bg-[#202020] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="w-full overflow-x-auto">
          <table class="table max-md:table-sm">
            <thead class="bg-gray-100 dark:bg-[#1a1a1a]">
              <tr class="text-gray-700 dark:text-gray-300">
                <th class="min-w-[300px] font-semibold">Name</th>
                <th class="font-semibold">Code</th>
                <th class="font-semibold">Network</th>
                <th class="min-w-[200px] font-semibold">Channels</th>
                <th class="min-w-[200px] font-semibold">Position</th>
                <th class="font-semibold">Server</th>
                <th class="font-semibold">Action</th>
              </tr>
            </thead>
            <tbody v-if="stations.length" class="text-gray-700 dark:text-gray-300">
              <tr
                v-for="station in stations"
                :key="station._id"
                class="hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors">
                <td class="truncate max-w-[300px] font-medium">{{ station.name }}</td>
                <td>
                  <span class="badge badge-ghost rounded-md">{{ station.code }}</span>
                </td>
                <td>{{ station.network }}</td>
                <td class="flex gap-2 flex-wrap max-w-80">
                  <div
                    v-for="(channel, idx) in station.channel"
                    :key="idx"
                    class="badge badge-success badge-outline rounded-md font-bold">
                    {{ channel }}
                  </div>
                </td>
                <td class="text-sm">{{ station.latitude }}, {{ station.longitude }}</td>
                <td class="text-sm text-blue-600 dark:text-blue-400">{{ station.server_seedlink }}</td>
                <td class="flex gap-2">
                  <button
                    class="btn btn-square btn-sm btn-ghost text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#2a2a3a] transition-all"
                    @click="onEditButtonClick(station)">
                    <v-icon name="hi-pencil-alt" />
                  </button>
                  <button
                    class="btn btn-square btn-sm btn-ghost text-error hover:bg-red-50 dark:hover:bg-[#3a2a2a] transition-all"
                    @click="onDeleteButtonClick(station)">
                    <v-icon name="fa-regular-trash-alt" />
                  </button>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr v-if="isDataFetching">
                <td colspan="7">
                  <div class="flex items-center justify-center gap-2 w-full py-8">
                    <div class="loading loading-spinner text-primary" />
                    <div class="text-gray-600 dark:text-gray-400">Loading stations...</div>
                  </div>
                </td>
              </tr>
              <tr v-else>
                <td colspan="7" class="text-center py-8">
                  <div class="flex flex-col items-center gap-2">
                    <v-icon name="gi-radar-dish" scale="2" class="text-gray-400" />
                    <p class="text-gray-600 dark:text-gray-400">No stations found</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="border-t border-gray-200 dark:border-gray-700 p-4">
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
        <div
          class="modal-box max-w-3xl bg-white dark:bg-[#202020] rounded-xl border border-gray-200 dark:border-gray-700">
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
      <dialog id="station-form-modal" ref="stationDeleteModalRef" class="modal">
        <div class="modal-box bg-white dark:bg-[#202020] rounded-xl border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-[#3a2020] flex items-center justify-center">
              <v-icon name="fa-exclamation-triangle" class="text-error" scale="1.2" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">Delete Station</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
            </div>
          </div>
          <p class="text-gray-700 dark:text-gray-300 mb-6">
            Are you sure you want to delete station
            <span class="font-bold text-error">{{ selectedStation?.name }}</span
            >?
          </p>
          <div class="flex gap-3">
            <button
              class="btn btn-outline flex-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-700 dark:text-gray-300"
              @click="onModalDeleteClose">
              Cancel
            </button>
            <button class="btn btn-error flex-1 rounded-lg hover:shadow-lg" @click="removeStation">
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
