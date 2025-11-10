<script setup lang="ts">
import { computed, ref } from 'vue'

defineEmits<{
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
</script>

<template>
  <form class="flex flex-col gap-6" @submit.prevent="$emit('submit', { username, password })">
    <!-- Header -->
    <div class="mb-2">
      <h2 class="text-3xl font-bold text-gray-900 mb-2">Login</h2>
      <p class="text-gray-600 text-sm">Login to access your Geomecca account</p>
    </div>

    <!-- Email Input -->
    <div class="space-y-2">
      <label for="email" class="block text-sm font-medium text-gray-700"> Email </label>
      <input
        id="email"
        v-model="username"
        type="text"
        placeholder="Enter your email"
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
        :disabled="isLoading" />
    </div>

    <!-- Password Input -->
    <div class="space-y-2">
      <label for="password" class="block text-sm font-medium text-gray-700"> Password </label>
      <div class="relative">
        <input
          id="password"
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Enter your password"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-400 pr-12"
          :disabled="isLoading" />
        <button
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
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

    <!-- Remember Me & Forgot Password -->
    <div class="flex items-center justify-between">
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          v-model="rememberMe"
          type="checkbox"
          class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" />
        <span class="text-sm text-gray-700">Remember me</span>
      </label>
      <a href="#" class="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"> Forgot Password </a>
    </div>

    <!-- Login Button -->
    <button
      type="submit"
      :disabled="!isValid || isLoading"
      class="w-full py-3 px-4 bg-[#0c5a91] hover:bg-[#094873] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#0c5a91]">
      {{ isLoading ? 'Logging in...' : 'Login' }}
    </button>

    <!-- Sign Up Link -->
    <div class="text-center text-sm text-gray-600">
      Don't have an account?
      <a href="#" class="text-red-500 hover:text-red-600 font-medium transition-colors"> Contact Us </a>
    </div>
  </form>
</template>
