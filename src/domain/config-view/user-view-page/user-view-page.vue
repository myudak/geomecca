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
    <div class="p-6 w-full h-full overflow-y-auto">
      <!-- Header Card -->
      <div class="bg-white dark:bg-[#202020] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage system users and permissions</p>
          </div>
          <button class="btn btn-primary gap-2 rounded-lg hover:shadow-lg transition-all" @click="onAddUserButtonClick">
            <v-icon name="md-add" scale="1.1" />
            Add User
          </button>
        </div>
        <Input v-model="searchQuery" class="max-w-md" placeholder="Search users by username or region..." />
      </div>

      <!-- Table Card -->
      <div
        class="bg-white dark:bg-[#202020] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="w-full overflow-x-auto">
          <table class="table">
            <thead class="bg-gray-100 dark:bg-[#1a1a1a]">
              <tr class="text-gray-700 dark:text-gray-300">
                <th class="font-semibold">Username</th>
                <th class="font-semibold">Region</th>
                <th class="min-w-[150px] font-semibold">Stations</th>
                <th class="font-semibold">Action</th>
              </tr>
            </thead>
            <tbody v-if="users.length" class="text-gray-700 dark:text-gray-300">
              <tr
                v-for="user in users"
                :key="user._id"
                class="hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors">
                <td class="font-medium">
                  <div class="flex items-center gap-2">
                    <Avatar
                      :size="32"
                      :name="user.username"
                      variant="beam"
                      :colors="['#0A0310', '#49007E', '#FF005B', '#FF7D10', '#FFB238']" />
                    {{ user.username }}
                  </div>
                </td>
                <td>
                  <span class="badge badge-ghost rounded-md">{{ user.region }}</span>
                </td>
                <td>
                  <div
                    class="badge badge-info badge-outline rounded-lg font-semibold cursor-pointer hover:bg-info hover:text-white transition-all"
                    @click="onStationBadgeClick(user.stations)">
                    <v-icon name="gi-radar-dish" scale="0.8" class="mr-1" />
                    {{ user.stations.length }} Stations
                  </div>
                </td>
                <td class="flex gap-2">
                  <button
                    class="btn btn-square btn-sm btn-ghost text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#2a2a3a] transition-all"
                    @click="onEditButtonClick(user)">
                    <v-icon name="hi-pencil-alt" />
                  </button>
                  <button
                    class="btn btn-square btn-sm btn-ghost text-error hover:bg-red-50 dark:hover:bg-[#3a2a2a] transition-all"
                    @click="onDeleteButtonClick(user)">
                    <v-icon name="fa-regular-trash-alt" />
                  </button>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr v-if="isDataFetching">
                <td colspan="4">
                  <div class="flex items-center justify-center gap-2 w-full py-8">
                    <div class="loading loading-spinner text-primary" />
                    <div class="text-gray-600 dark:text-gray-400">Loading users...</div>
                  </div>
                </td>
              </tr>
              <tr v-else>
                <td colspan="4" class="text-center py-8">
                  <div class="flex flex-col items-center gap-2">
                    <v-icon name="fa-users" scale="2" class="text-gray-400" />
                    <p class="text-gray-600 dark:text-gray-400">No users found</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="border-t border-gray-200 dark:border-gray-700 p-4">
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
        <div class="modal-box bg-white dark:bg-[#202020] rounded-xl border border-gray-200 dark:border-gray-700">
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
        <div class="modal-box bg-white dark:bg-[#202020] rounded-xl border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-[#3a2020] flex items-center justify-center">
              <v-icon name="fa-exclamation-triangle" class="text-error" scale="1.2" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">Delete User</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
            </div>
          </div>
          <p class="text-gray-700 dark:text-gray-300 mb-6">
            Are you sure you want to delete user
            <span class="font-bold text-error">{{ selectedUser?.username }}</span
            >?
          </p>
          <div class="flex gap-3">
            <button
              class="btn btn-outline flex-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-700 dark:text-gray-300"
              @click="onModalDeleteClose">
              Cancel
            </button>
            <button class="btn btn-error flex-1 rounded-lg hover:shadow-lg" @click="removeUser">
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
        <div class="modal-box bg-white dark:bg-[#202020] rounded-xl border border-gray-200 dark:border-gray-700">
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
