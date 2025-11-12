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

const dateRange = '09 Sept 2025 – 16 Sept 2025'
const heroLatestEvent = {
  magnitude: '5.7',
  location: 'Makassar Sea, Sulawesi',
  time: '1 hour ago'
}

const featureColumns = [
  [
    'Real-Time Seismic Event Detection',
    'Automated Data Processing & Visualization',
    'Sensor Network Management',
    'Precision Event Tagging'
  ],
  [
    'Event Localization & Magnitude Analysis',
    'Custom Alerts & Notifications',
    'Cloud-Based Data Access & Reporting',
    'Resilient Network Health Monitoring'
  ]
]

const quickLinks = [
  { label: 'Events', icon: 'fa-calendar' },
  { label: 'Settings', icon: 'md-settings' }
]
</script>

<template>
  <div class="flex min-h-screen flex-col bg-slate-950/70 lg:flex-row">
    <!-- Left Side - Branding -->
    <div class="relative hidden overflow-hidden lg:flex lg:w-[58%]">
      <div class="absolute inset-0 bg-[url('/images/login-bg.jpg')] bg-cover bg-center" aria-hidden="true" />
      <div class="absolute inset-0 bg-gradient-to-br from-[#041426]/95 via-[#0c3153]/90 to-[#04213b]/95" />
      <!-- 
      <div class="absolute right-10 top-10 z-20 flex flex-col items-end gap-4 text-white/90">
        <div class="rounded-full border border-white/20 bg-white/10 px-6 py-2 text-sm font-semibold backdrop-blur">
          {{ dateRange }}
        </div>
        <div class="w-64 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.3em] text-cyan-200">Latest Event</p>
          <div class="mt-3 flex items-center gap-3">
            <div class="text-4xl font-black text-white">{{ heroLatestEvent.magnitude }}</div>
            <div class="text-sm leading-tight text-white/80">
              <p>{{ heroLatestEvent.location }}</p>
              <p>{{ heroLatestEvent.time }}</p>
            </div>
          </div>
          <button class="mt-4 text-xs font-semibold tracking-wide text-cyan-200 underline underline-offset-4">
            View Details
          </button>
        </div>
      </div> -->

      <div class="relative z-10 flex flex-col justify-center px-16 py-16 text-white xl:px-24">
        <div class="mb-10 flex items-center gap-4">
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur">
            <img src="/images/geomecca-logo.png" alt="Geomecca Logo" class="h-12 w-12 object-contain" />
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.3em] text-white/70">Geomecca</p>
            <p class="text-xl font-semibold tracking-wide">Microseismic Analytics Software</p>
          </div>
        </div>

        <div class="mb-10 max-w-2xl">
          <h1 class="text-4xl font-bold leading-tight text-white lg:text-5xl">
            Your All-in-One Digital Solution for Microseismic Monitoring
          </h1>
          <p class="mt-6 text-lg text-white/80">
            Seamlessly monitor, analyze, and report subsurface activities in real time – all from one powerful platform.
          </p>
        </div>

        <div class="grid gap-8 md:grid-cols-2">
          <div
            v-for="(column, columnIndex) in featureColumns"
            :key="columnIndex"
            class="space-y-4 text-base text-white/90">
            <div v-for="feature in column" :key="feature" class="flex items-start gap-3">
              <div class="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-cyan-400/20">
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M5.63063 8.81622L13.5431 5.01935C13.998 4.80169 14.4958 4.68871 15 4.68871C15.5042 4.68871 16.002 4.80169 16.4569 5.01935L24.3694 8.81622C24.6516 8.95248 24.8897 9.16543 25.0565 9.43071C25.2233 9.69599 25.312 10.0029 25.3125 10.3162V11.25C25.3124 13.9397 24.6355 16.5862 23.3442 18.9457C22.0529 21.3052 20.1886 23.3019 17.9231 24.7518L16.0744 25.935C15.7539 26.1409 15.381 26.2504 15 26.2504C14.619 26.2504 14.2461 26.1409 13.9256 25.935L12.0769 24.7537C9.81112 23.3036 7.94671 21.3066 6.65537 18.9468C5.36404 16.5869 4.6873 13.94 4.6875 11.25V10.3162C4.6875 9.67685 5.055 9.09372 5.63063 8.81622ZM12.3244 2.48435L4.41375 6.28122C3.65379 6.64677 3.0124 7.21934 2.5633 7.93312C2.11421 8.6469 1.87563 9.47291 1.875 10.3162V11.25C1.87484 14.4118 2.67027 17.5228 4.18801 20.2964C5.70575 23.0701 7.89702 25.4173 10.56 27.1218L12.4088 28.3031C13.182 28.799 14.0814 29.0626 15 29.0626C15.9186 29.0626 16.818 28.799 17.5912 28.3031L19.44 27.1218C22.103 25.4173 24.2942 23.0701 25.812 20.2964C27.3297 17.5228 28.1252 14.4118 28.125 11.25V10.3162C28.125 8.59497 27.1388 7.0256 25.5863 6.28122L17.6737 2.48435C16.8391 2.08443 15.9255 1.87683 15 1.87683C14.0745 1.87683 13.159 2.08443 12.3244 2.48435ZM20.8125 12.0937C20.9233 11.946 21.0039 11.7779 21.0498 11.599C21.0956 11.4201 21.1057 11.2339 21.0796 11.0511C21.0535 10.8683 20.9916 10.6924 20.8975 10.5335C20.8035 10.3746 20.679 10.2358 20.5312 10.125C20.3835 10.0142 20.2154 9.93355 20.0365 9.88772C19.8576 9.84189 19.6714 9.83174 19.4886 9.85786C19.3058 9.88397 19.1299 9.94584 18.971 10.0399C18.8121 10.134 18.6733 10.2585 18.5625 10.4062L13.9106 16.6087L11.3063 14.0062C11.0397 13.7578 10.6871 13.6226 10.3228 13.629C9.95846 13.6354 9.61086 13.783 9.35321 14.0407C9.09556 14.2983 8.94797 14.6459 8.94155 15.0102C8.93512 15.3746 9.07035 15.7271 9.31875 15.9937L13.0687 19.7437C13.2112 19.8861 13.3825 19.9963 13.5712 20.0667C13.7599 20.1371 13.9615 20.1662 14.1623 20.152C14.3632 20.1378 14.5587 20.0806 14.7356 19.9843C14.9124 19.8879 15.0666 19.7548 15.1875 19.5937L20.8125 12.0937Z"
                    fill="#00A5FF" />
                </svg>
              </div>
              <span>{{ feature }}</span>
            </div>
          </div>
        </div>

        <p class="mt-10 text-lg font-medium text-white/90">
          Empower your team with precision monitoring — anytime, anywhere.
        </p>
        <!-- 
        <div class="mt-8 flex gap-4">
          <div
            v-for="link in quickLinks"
            :key="link.label"
            class="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-white/80 backdrop-blur">
            <v-icon :name="link.icon" scale="1.1" />
            <span class="font-semibold tracking-wide">{{ link.label }}</span>
          </div>
        </div> -->
      </div>
    </div>

    <!-- Right Side - Login Form -->
    <div class="flex w-full items-center justify-center bg-white px-6 py-12 dark:bg-slate-950/70 lg:w-[42%]">
      <div
        class="w-full max-w-md rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-2xl shadow-slate-900/5 backdrop-blur-lg">
        <div class="mb-8 text-center lg:text-left">
          <p class="text-sm uppercase tracking-[0.4em] text-slate-400">Welcome back</p>
          <h2 class="mt-2 text-3xl font-bold text-slate-900">Geomecca Access</h2>
          <p class="text-sm text-slate-500">Login to access your Geomecca account</p>
        </div>
        <LoginForm :is-loading="isPending" @submit="login" />
      </div>
    </div>
  </div>
</template>
