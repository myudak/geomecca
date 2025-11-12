<script setup lang="ts">
import { AdminNavbar, MonitoringToolbar } from '../admin-navbar'
import { AdminBottomMenu } from './admin-bottom-menu'
</script>

<template>
  <div class="flex h-dvh w-full flex-col overflow-hidden">
    <AdminNavbar />
    <MonitoringToolbar />
    <div class="h-full flex-1 overflow-y-auto">
      <slot />
    </div>
    <AdminBottomMenu />
  </div>
</template>
