<script setup lang="ts">
import { deleteUserAPI, getUsersAPI, postUserAPI, putUserAPI } from '@src/api-service/users'
import { GetAllUserListQuery } from '@src/api-service/users/types'
import { Input } from '@src/components/input/input'
import { Pagination } from '@src/components/pagination'
import { AddUserPayload, UpdateUserPayload, User } from '@src/types/user'
import { useDebounceFn } from '@vueuse/core'
import { onMounted, ref, VNodeRef, watch } from 'vue'
import Avatar from 'vue-boring-avatars'
import { toast } from 'vue3-toastify'

import { ConfigLayout } from '../config-layout'
import { UserForm } from '../user-form'
import { UserStationForm } from '../user-station-form'

const userFormModalRef = ref<VNodeRef | null>(null)
const userDeleteModalRef = ref<VNodeRef | null>(null)
const userStationModalRef = ref<VNodeRef | null>(null)

const users = ref<User[] | []>([])
const userPayload = ref<AddUserPayload | null>(null)
const fetchQuery = ref<GetAllUserListQuery>({ page: 1, limit: 10 })
const isDataFetching = ref(false)
const isDeleting = ref(false)
const searchQuery = ref('')

// form
const isFormReset = ref(false)
const isFormLoading = ref(false)
const selectedUser = ref<User | null>(null)
const userFormUsage = ref('create')
const userFormTitle = ref('Add User')
const selectedUserStation = ref<string[] | []>([])

// pagination
const totalPages = ref(1)
const totalData = ref(1)
const perPage = ref(10)
const currentPage = ref(1)

const debouncedSearch = useDebounceFn(() => {
  fetchUsers()
}, 1000)

watch(
  () => searchQuery.value,
  (newValue) => {
    fetchQuery.value = { ...fetchQuery.value, page: 1, q: newValue }
    debouncedSearch()
  }
)

onMounted(() => {
  fetchUsers()
})

function resetPageProperty() {
  searchQuery.value = ''
  fetchQuery.value = { page: 1, limit: 10 }
  resetPage()
  fetchUsers()
}

function fetchUsers() {
  users.value = []
  isDataFetching.value = true
  getUsersAPI(fetchQuery.value).then(({ data, total }) => {
    users.value = data
    totalData.value = total
    totalPages.value = Math.ceil(total / perPage.value)
    isDataFetching.value = false
  })
}

function addUser() {
  isFormLoading.value = true
  postUserAPI(userPayload.value as AddUserPayload)
    .then(() => {
      isFormReset.value = true
      onUserFormModalClose()
      resetPageProperty()
      toast.success(`Berhasil menambahkan ${userPayload.value?.username}.`, {
        autoClose: 3000,
        position: 'top-center'
      })
    })
    .catch((e: Error) => {
      toast.error(`Gagal menambahkan ${userPayload.value?.username}. \n ${e.message}`, {
        autoClose: 3000,
        position: 'top-center'
      })
    })
    .finally(() => {
      isFormLoading.value = false
    })
}

function updateUser() {
  isFormLoading.value = true
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...updatePayload } = userPayload.value as AddUserPayload
  putUserAPI(selectedUser.value?._id as string, updatePayload as UpdateUserPayload)
    .then(() => {
      isFormReset.value = true
      onUserFormModalClose()
      resetPageProperty()

      toast.success(`Berhasil memperbaruin ${selectedUser.value?.username}.`, {
        autoClose: 3000,
        position: 'top-center'
      })
    })
    .catch((e: Error) => {
      toast.error(`Gagal memperbaruin ${selectedUser.value?.username}. \n ${e.message}`, {
        autoClose: 3000,
        position: 'top-center'
      })
    })
    .finally(() => {
      isFormLoading.value = false
    })
}

function removeUser() {
  isDeleting.value = true
  deleteUserAPI(selectedUser.value?._id as string)
    .then(() => {
      onModalDeleteClose()
      resetPageProperty()
      toast.success(`Berhasil menghapus ${selectedUser.value?.username}.`, {
        autoClose: 3000,
        position: 'top-center'
      })
      selectedUser.value = null
      isDeleting.value = false
    })
    .catch((e: Error) => {
      toast.error(`Gagal menghapus ${selectedUser.value?.username}. \n ${e.message}`, {
        autoClose: 3000,
        position: 'top-center'
      })
    })
}

function resetPage() {
  fetchQuery.value = { page: 1, limit: 10 }
  currentPage.value = 1
}

function onSubmitUserForm(payload: AddUserPayload) {
  isFormReset.value = false
  userPayload.value = payload
  switch (userFormUsage.value) {
    case 'create':
      addUser()
      break
    case 'edit':
      updateUser()
      break
    default:
      toast.error(`Unregister form usage`, {
        autoClose: 3000,
        position: 'top-center'
      })
      break
  }
}

function onUserStationFormSubmit(selectedStation: string[]) {
  console.log(selectedStation)
}

function onDeleteButtonClick(user: User) {
  isDeleting.value = false
  userDeleteModalRef.value.showModal()
  selectedUser.value = user
}

function onEditButtonClick(user: User) {
  selectedUser.value = user
  userFormTitle.value = 'Edit User'
  userFormUsage.value = 'edit'
  userFormModalRef.value.showModal()
}

function onStationBadgeClick(userStations: string[]) {
  selectedUserStation.value = userStations
  userStationModalRef.value.showModal()
}

function onUserFormModalClose() {
  userFormModalRef.value.close()
}

function onModalDeleteClose() {
  userDeleteModalRef.value.close()
}

function onUserStationFormModalClose() {
  selectedUserStation.value = []
  userStationModalRef.value.close()
}

function onAddUserButtonClick() {
  userFormUsage.value = 'create'
  userFormTitle.value = 'Add User'
  selectedUser.value = null
  userFormModalRef.value.showModal()
}

function showMore(page: number) {
  currentPage.value = page
  fetchQuery.value = { ...fetchQuery.value, page }
  fetchUsers()
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
              MHEWS
            </p>
            <h2 class="mt-1 text-3xl font-bold text-brand-text-light dark:text-brand-text-dark">User Management</h2>
            <p class="text-sm text-brand-text-muted dark:text-brand-text-muted-dark">Manage system users and permissions</p>
          </div>
          <button
            class="inline-flex items-center gap-2 rounded-2xl bg-brand-surface-normal px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-surface-normal/40 transition hover:bg-brand-surface-normal-hover"
            @click="onAddUserButtonClick">
            <v-icon name="md-add" scale="1.1" />
            Add User
          </button>
        </div>
        <div class="mt-6 max-w-xl">
          <Input v-model="searchQuery" placeholder="Search users by username or region..." />
        </div>
      </div>

      <!-- Table Card -->
      <div
        class="rounded-3xl border border-brand-surface-light-active bg-white/95 shadow-xl shadow-brand-surface-light-active/40 dark:border-brand-surface-dark-hover dark:bg-brand-surface-darker">
        <div class="w-full overflow-x-auto">
          <table class="w-full table-auto text-left text-sm">
            <thead class="bg-brand-surface-light-hover/70 text-brand-text-light dark:bg-brand-surface-dark dark:text-brand-text-dark">
              <tr>
                <th class="px-6 py-4 font-semibold">Username</th>
                <th class="px-6 py-4 font-semibold">Region</th>
                <th class="px-6 py-4 font-semibold">Stations</th>
                <th class="px-6 py-4 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody v-if="users.length">
              <tr
                v-for="user in users"
                :key="user._id"
                class="border-t border-brand-surface-light-active/60 text-brand-text-light transition hover:bg-brand-surface-light-hover/70 dark:border-brand-surface-dark-hover/40 dark:text-brand-text-dark dark:hover:bg-brand-surface-dark">
                <td class="px-6 py-4 font-semibold">
                  <div class="flex items-center gap-3">
                    <Avatar
                      :size="36"
                      :name="user.username"
                      variant="beam"
                      :colors="['#0A0310', '#49007E', '#FF005B', '#FF7D10', '#FFB238']" />
                    <div class="flex flex-col">
                      <span>{{ user.username }}</span>
                      <span class="text-xs text-brand-text-muted dark:text-brand-text-muted-dark">ID: {{ user._id.slice(-6) }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="rounded-full bg-brand-surface-light px-3 py-1 text-xs font-semibold text-brand-text-light dark:bg-brand-surface-dark-hover dark:text-brand-text-dark">
                    {{ user.region }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <button
                    class="inline-flex items-center gap-2 rounded-xl border border-brand-surface-light-active px-4 py-2 font-semibold text-brand-text-light transition hover:border-brand-surface-normal hover:bg-brand-surface-light dark:border-brand-surface-dark-hover dark:text-brand-text-dark dark:hover:bg-brand-surface-dark-hover"
                    @click="onStationBadgeClick(user.stations)">
                    <v-icon name="gi-radar-dish" scale="0.9" />
                    {{ user.stations.length }} Stations
                  </button>
                </td>
                <td class="px-6 py-4">
                  <div class="flex justify-center gap-3">
                    <button
                      class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-brand-surface-light-active text-brand-text-light transition hover:border-brand-surface-normal hover:bg-brand-surface-light dark:border-brand-surface-dark-hover dark:text-brand-text-dark"
                      @click="onEditButtonClick(user)">
                      <v-icon name="hi-pencil-alt" />
                    </button>
                    <button
                      class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-transparent text-error transition hover:border-error hover:bg-error/10"
                      @click="onDeleteButtonClick(user)">
                      <v-icon name="fa-regular-trash-alt" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr v-if="isDataFetching">
                <td colspan="4" class="px-6 py-12">
                  <div class="flex items-center justify-center gap-3 text-brand-text-muted dark:text-brand-text-muted-dark">
                    <div class="h-6 w-6 animate-spin rounded-full border-2 border-brand-surface-normal border-t-transparent" />
                    Loading users...
                  </div>
                </td>
              </tr>
              <tr v-else>
                <td colspan="4" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center gap-2 text-brand-text-muted dark:text-brand-text-muted-dark">
                    <v-icon name="fa-users" scale="2" />
                    <p>No users found</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="border-t border-brand-surface-light-active/60 px-6 py-4 dark:border-brand-surface-dark-hover/40">
          <Pagination
            :total-pages="totalPages"
            :total="totalData"
            :per-page="perPage"
            :current-page="currentPage"
            @pagechanged="showMore" />
        </div>
      </div>

      <!-- User Form Modal -->
      <dialog ref="userFormModalRef" class="modal">
        <div class="modal-box rounded-3xl border border-brand-surface-light-active bg-white/95 text-brand-text-light shadow-xl dark:border-brand-surface-dark-hover dark:bg-brand-surface-dark dark:text-brand-text-dark">
          <UserForm
            :usage="userFormUsage"
            :user-data="selectedUser"
            :title="userFormTitle"
            :is-loading="isFormLoading"
            :is-reset="isFormReset"
            @on-cancel="onUserFormModalClose"
            @on-submit="onSubmitUserForm" />
          <div class="modal-action h-0 mt-0">
            <form method="dialog" class="modal-backdrop">
              <button>close</button>
            </form>
          </div>
        </div>
      </dialog>

      <!-- Delete Confirmation Modal -->
      <dialog ref="userDeleteModalRef" class="modal">
        <div class="modal-box rounded-3xl border border-brand-surface-light-active bg-white/95 text-brand-text-light shadow-xl dark:border-brand-surface-dark-hover dark:bg-brand-surface-dark dark:text-brand-text-dark">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <v-icon name="fa-exclamation-triangle" class="text-error" scale="1.2" />
            </div>
            <div>
              <h3 class="text-xl font-bold">Delete User</h3>
              <p class="text-sm text-brand-text-muted dark:text-brand-text-muted-dark">This action cannot be undone</p>
            </div>
          </div>
          <p class="mb-6">
            Are you sure you want to delete user
            <span class="font-bold text-error">{{ selectedUser?.username }}</span
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
              @click="removeUser">
              <div v-if="isDeleting" class="loading loading-spinner" />
              <span v-else>Delete User</span>
            </button>
          </div>
          <div class="modal-action h-0 mt-0">
            <form method="dialog" class="modal-backdrop">
              <button>close</button>
            </form>
          </div>
        </div>
      </dialog>

      <!-- User Station Modal -->
      <dialog ref="userStationModalRef" class="modal">
        <div class="modal-box rounded-3xl border border-brand-surface-light-active bg-white/95 text-brand-text-light shadow-xl dark:border-brand-surface-dark-hover dark:bg-brand-surface-dark dark:text-brand-text-dark">
          <UserStationForm
            :is-loading="false"
            :user-station="selectedUserStation"
            @on-cancel="onUserStationFormModalClose"
            @on-submit="onUserStationFormSubmit" />
          <div class="modal-action h-0 mt-0">
            <form method="dialog" class="modal-backdrop">
              <button>close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  </ConfigLayout>
</template>

