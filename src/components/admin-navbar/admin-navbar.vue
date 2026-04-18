<script setup lang="ts">
import useGetProfile from '@src/hooks/use-get-profile'
import { getLatestEvent, getGlobalBValue } from '@src/api-service/dashboard'
import { isFrontendOnly } from '@src/constants/env'
import Cookies from 'js-cookie'
import { computed, onMounted, ref } from 'vue'
import Avatar from 'vue-boring-avatars'
import { RouterLink } from 'vue-router'

import { AdminMenu } from './admin-menu'
import { showFrontendOnlyToast } from '@src/utils/frontend-only'

const { data: profile } = useGetProfile()

const latestEvent = ref({
  time: 'Loading...',
  magnitude: '...',
  location: 'Loading...',
  depth: '...'
})

const bValue = ref('0.00')
const profileColors: string[] = ['#0A0310', '#49007E', '#FF005B', '#FF7D10', '#FFB238']
const profileName = computed(() => profile.value?.username ?? 'Analyst')

const fetchDashboardData = async () => {
  try {
    const [eventData, bValueData] = await Promise.all([
      getLatestEvent(),
      getGlobalBValue()
    ])

    latestEvent.value = eventData.data
    bValue.value = bValueData.data.b_value.toFixed(2)

    console.log('[Navbar] Dashboard data loaded:', { latestEvent: eventData.data, bValue: bValueData.data })
  } catch (error) {
    console.error('[Navbar] Failed to load dashboard data:', error)
  }
}

onMounted(() => {
  fetchDashboardData()
})

const logout = () => {
  Cookies.remove('access_token')
  location.reload()
}
</script>

<template>
  <header
    class="border-b border-slate-200 bg-white/95 text-slate-900 shadow-sm transition-colors dark:border-white/5 dark:bg-[#080f1c] dark:text-slate-100">
    <div class="mx-auto flex w-full max-w-screen-2xl flex-wrap items-center gap-4 px-4 py-4 lg:px-10">
      <RouterLink
        to="/"
        class="group flex items-center gap-3 text-lg font-semibold tracking-wide text-slate-800 transition hover:text-slate-900 dark:text-white/90 dark:hover:text-white">
        <img
          src="/images/geomecca-logo.png"
          alt="Geomecca Logo"
          class="h-12 w-12 rounded-full border border-transparent bg-white p-1 shadow-md transition duration-200 group-hover:scale-105 group-hover:border-sky-400 group-hover:ring-2 group-hover:ring-sky-300 group-hover:ring-offset-2 group-hover:ring-offset-white dark:bg-white/5 dark:group-hover:ring-sky-400/80 dark:group-hover:ring-offset-[#080f1c]" />
        <span
          class="hidden text-base font-semibold uppercase tracking-[0.2em] text-slate-500 transition group-hover:text-slate-700 dark:text-white/70 dark:group-hover:text-white sm:block">
          Geomecca
        </span>
      </RouterLink>
      <div class="flex flex-1 flex-wrap items-center justify-end gap-3">
        <div
          class="flex flex-wrap items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700 shadow-[0_0_20px_rgba(248,113,113,0.1)] transition dark:border-red-400/40 dark:bg-red-500/10 dark:text-red-100 sm:text-sm">
          <span
            class="flex items-center gap-1 text-[0.6rem] uppercase tracking-[0.3em] text-red-500 dark:text-red-300 sm:text-[0.65rem]">
            <v-icon name="io-information-circle-outline" scale="0.85" />
            Latest Event
          </span>
          <span class="font-semibold">
            {{ latestEvent.time }} | {{ latestEvent.magnitude }} | {{ latestEvent.location }} | {{ latestEvent.depth }}
          </span>
        </div>
        <div
          class="flex items-center gap-3 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs text-amber-800 shadow-[0_0_16px_rgba(251,191,36,0.12)] transition dark:border-amber-400/60 dark:bg-amber-500/10 dark:text-amber-100 sm:text-sm">
          <span
            class="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-amber-500 dark:text-amber-200">
            <v-icon name="gi-sound-waves" scale="0.95" />
            B-Value
          </span>
          <span class="text-base font-bold text-amber-600 dark:text-amber-200">{{ bValue }}</span>
        </div>
        <button
          class="rounded-full bg-red-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
          type="button"
          @click="logout">
          Logout
        </button>
        <div
          class="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/90 lg:flex">
          <Avatar :size="32" :name="profileName" variant="beam" :colors="profileColors" />
          <span class="max-w-[160px] truncate cursor-default">{{ profileName }}</span>
        </div>
        <div class="md:hidden">
          <AdminMenu />
        </div>
      </div>
    </div>
  </header>
</template>
