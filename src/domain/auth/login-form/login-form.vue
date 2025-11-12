<script setup lang="ts">
import { computed, ref } from 'vue'

const emit = defineEmits<{
  (
    e: 'submit',
    value: {
      username: string
      password: string
    }
  ): void
}>()

defineProps<{
  isLoading?: boolean
}>()

const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)

const isValid = computed(() => username.value.length > 0 && password.value.length > 0)

const onSubmit = () => {
  emit('submit', {
    username: username.value.trim(),
    password: password.value
  })
}
</script>

<template>
  <form class="flex flex-col gap-6" @submit.prevent="onSubmit">
    <div class="space-y-2">
      <label for="email" class="block text-sm font-medium text-slate-600"> Email </label>
      <input
        id="email"
        v-model="username"
        type="text"
        placeholder="you@example.com"
        class="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="isLoading" />
    </div>

    <div class="space-y-2">
      <label for="password" class="block text-sm font-medium text-slate-600"> Password </label>
      <div class="relative">
        <input
          id="password"
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="••••••••"
          class="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 pr-12 text-base text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isLoading" />
        <button
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
          @click="showPassword = !showPassword">
          <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        </button>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
        <input
          v-model="rememberMe"
          type="checkbox"
          class="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
        Remember me
      </label>
      <a href="#" class="text-sm font-semibold text-rose-500 transition hover:text-rose-400"> Forgot Password </a>
    </div>

    <button
      type="submit"
      :disabled="!isValid || isLoading"
      class="w-full rounded-2xl bg-[#0c5a91] px-4 py-3 text-base font-semibold text-white shadow-lg shadow-[#0c5a91]/30 transition hover:bg-[#094873] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0c5a91] disabled:cursor-not-allowed disabled:opacity-60">
      {{ isLoading ? 'Logging in...' : 'Login' }}
    </button>

    <div class="text-center text-sm text-slate-500">
      Don't have an account?
      <a href="#" class="font-semibold text-rose-500 transition hover:text-rose-400">Contact Us</a>
    </div>
  </form>
</template>
