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
  <div class="flex flex-col gap-5 rounded-3xl border border-brand-surface-light-active bg-white/95 p-6 shadow-xl shadow-brand-surface-light-active/40 dark:border-brand-surface-dark-hover dark:bg-brand-surface-darker">
    <div class="mb-2">
      <p class="text-xs font-semibold uppercase tracking-[0.3em] text-brand-text-muted dark:text-brand-text-muted-dark">Geomecca</p>
      <h3 class="text-2xl font-bold text-brand-text-light dark:text-brand-text-dark">{{ title }}</h3>
      <p class="mt-1 text-sm text-brand-text-muted dark:text-brand-text-muted-dark">Fill in the user details below</p>
    </div>
    <div class="flex flex-col gap-4">
      <Input v-model="username" label="Username" />
      <Input v-model="region" label="Region" />
      <Input v-if="usage !== 'edit'" v-model="password" type="password" label="Password" />
      <div class="mt-2 flex gap-3">
        <button
          class="inline-flex flex-1 items-center justify-center rounded-2xl border border-brand-surface-light-active px-4 py-2 text-sm font-semibold text-brand-text-light transition hover:border-brand-surface-normal hover:bg-brand-surface-light dark:border-brand-surface-dark-hover dark:text-brand-text-dark dark:hover:bg-brand-surface-dark-hover"
          @click="emit('onCancel', null)">
          Cancel
        </button>
        <button
          class="inline-flex flex-1 items-center justify-center rounded-2xl bg-brand-surface-normal px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-surface-normal/40 transition hover:bg-brand-surface-normal-hover"
          @click="onSubmitForm">
          <div v-if="isLoading" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <span v-else>{{ usage === 'edit' ? 'Update User' : 'Create User' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
