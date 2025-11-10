<script setup lang="ts">
import { LoginResponse } from '@src/types/auth'
import api from '@src/utils/api'
import { useMutation } from '@tanstack/vue-query'
import Cookies from 'js-cookie'
import { toast } from 'vue3-toastify'

import { LoginForm, LoginSchema } from '../login-form'

const showLoginError = () => toast.error('Silahkan cek kembali username dan password Anda')

const onLoginSuccess = (data: LoginResponse) => {
  if (!data.status) {
    showLoginError()
    return
  }

  Cookies.set('access_token', data.data.access_token, { expires: 1 })
  location.reload()
}

const { isPending, mutate: login } = useMutation({
  mutationFn: (data: LoginSchema) =>
    api<LoginResponse>({
      method: 'POST',
      url: '/user/login',
      data
    }),
  onSuccess({ data }) {
    if (data) onLoginSuccess(data)
  },
  onError: () => {
    showLoginError()
  }
})
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Left Side - Branding -->
    <div class="hidden lg:flex lg:w-[60%] relative overflow-hidden">
      <!-- Background image with overlay - PLACEHOLDER, replace with your image -->
      <div class="absolute inset-0 bg-[url('/images/login-bg.jpg')] bg-cover bg-center"></div>
      <div class="absolute inset-0 bg-gradient-to-br from-[#1e3a5f]/95 via-[#2c5f8d]/90 to-[#1e3a5f]/95"></div>

      <!-- Content -->
      <div class="relative z-10 flex flex-col justify-center px-16 xl:px-24 text-white">
        <!-- Logo - PLACEHOLDER, replace with your logo -->
        <div class="flex items-center gap-4 mb-8">
          <div class="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <img src="/images/geomecca-logo.png" alt="Logo" class="w-12 h-12 object-contain" />
          </div>
          <div class="text-lg font-semibold tracking-wide">GEOMECCA</div>
        </div>

        <!-- Heading -->
        <div class="mb-4">
          <div class="text-sm font-medium text-cyan-300 tracking-wider uppercase mb-3">
            Microseismic Analytics Software
          </div>
          <h1 class="text-4xl xl:text-5xl font-bold leading-tight mb-6">
            Your All-in-One Digital Solution for Microseismic Monitoring
          </h1>
          <p class="text-lg text-white/80 mb-12">
            Seamlessly monitor, analyze, and report subsurface activities in real time — all from one powerful platform.
          </p>
        </div>

        <!-- Features List -->
        <div class="grid grid-cols-1 gap-6 mb-12">
          <!-- Left Column Features -->
          <div class="space-y-4">
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 rounded-full bg-cyan-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-4 h-4 text-cyan-300" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd" />
                </svg>
              </div>
              <span class="text-base">Real-Time Seismic Event Detection</span>
            </div>

            <div class="flex items-start gap-3">
              <div class="w-6 h-6 rounded-full bg-cyan-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-4 h-4 text-cyan-300" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd" />
                </svg>
              </div>
              <span class="text-base">Automated Data Processing & Visualization</span>
            </div>

            <div class="flex items-start gap-3">
              <div class="w-6 h-6 rounded-full bg-cyan-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-4 h-4 text-cyan-300" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd" />
                </svg>
              </div>
              <span class="text-base">Sensor Network Management</span>
            </div>
          </div>

          <!-- Right Column Features -->
          <div class="space-y-4">
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 rounded-full bg-cyan-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-4 h-4 text-cyan-300" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd" />
                </svg>
              </div>
              <span class="text-base">Event Localization & Magnitude Analysis</span>
            </div>

            <div class="flex items-start gap-3">
              <div class="w-6 h-6 rounded-full bg-cyan-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-4 h-4 text-cyan-300" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd" />
                </svg>
              </div>
              <span class="text-base">Custom Alerts & Notifications</span>
            </div>

            <div class="flex items-start gap-3">
              <div class="w-6 h-6 rounded-full bg-cyan-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-4 h-4 text-cyan-300" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd" />
                </svg>
              </div>
              <span class="text-base">Cloud-Based Data Access and Reporting</span>
            </div>
          </div>
        </div>

        <!-- Tagline -->
        <p class="text-lg font-medium text-white/90">
          Empower your team with precision monitoring — anytime, anywhere.
        </p>
      </div>
    </div>

    <!-- Right Side - Login Form -->
    <div class="w-full lg:w-[40%] flex items-center justify-center bg-white px-6 py-12">
      <div class="w-full max-w-md">
        <LoginForm :is-loading="isPending" @submit="login" />
      </div>
    </div>
  </div>
</template>
