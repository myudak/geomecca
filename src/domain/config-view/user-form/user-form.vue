<script setup lang="ts">
import { Input } from '@src/components/input/input'
import { AddUserPayload, User } from '@src/types/user'
import { ref, watch } from 'vue'

const emit = defineEmits<{
  (e: 'onCancel', value: null): void
  (e: 'onSubmit', value: AddUserPayload): void
}>()

const props = defineProps<{
  usage: string
  userData?: User | null
  title: string
  isLoading: boolean
  isReset: boolean
}>()

const username = ref('')
const region = ref('')
const password = ref('')

function resetForm() {
  username.value = ''
  region.value = ''
  password.value = ''
}

watch(
  () => props.userData,
  (newValue) => {
    username.value = newValue?.username as string
    region.value = newValue?.region as string
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

function onSubmitForm() {
  emit('onSubmit', {
    username: username.value,
    region: region.value,
    password: password.value
  })
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white">{{ title }}</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Fill in the user details below</p>
    </div>
    <div class="flex flex-col gap-4">
      <Input v-model="username" label="Username" />
      <Input v-model="region" label="Region" />
      <Input v-if="usage !== 'edit'" v-model="password" type="password" label="Password" />
      <div class="flex gap-3 mt-4">
        <button
          class="btn btn-outline flex-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-700 dark:text-gray-300"
          @click="emit('onCancel', null)">
          Cancel
        </button>
        <button class="btn btn-primary flex-1 rounded-lg hover:shadow-lg" @click="onSubmitForm">
          <div v-if="isLoading" class="loading loading-spinner" />
          <span v-else>{{ usage === 'edit' ? 'Update User' : 'Create User' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
