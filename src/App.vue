<script setup lang="ts">
import { AdminLayout } from './components/admin-layout'
import { FullScreenLoading } from './components/full-screen-loading'
import { isFrontendOnly } from './constants/env'
import LoginPage from './domain/auth/login-page'
import useGetProfile from './hooks/use-get-profile'
import { startFrontendOnlyRealtimeDemo } from './mocks/frontend-only/realtime'
import { useTheme } from './hooks/use-theme'
import { seedFrontendOnlySocketData } from './utils/frontend-only'

const { data: profile, isLoading } = useGetProfile()

// Initialize theme
useTheme()

window.socketData = {}
seedFrontendOnlySocketData()

if (isFrontendOnly) {
  startFrontendOnlyRealtimeDemo()
}
</script>

<template>
  <div class="w-full h-dvh">
    <FullScreenLoading v-if="isLoading" />
    <LoginPage v-else-if="!profile" />
    <AdminLayout v-else>
      <RouterView />
    </AdminLayout>
  </div>
</template>
