<script setup lang="ts">
import { ConfigSidebar } from '../config-sidebar'
</script>

<template>
  <div class="flex h-full overflow-hidden bg-gray-50 dark:bg-[#1d1d1d]">
    <!-- Sidebar -->
    <div class="max-md:hidden h-full bg-white dark:bg-[#202020] w-72 border-r border-gray-200 dark:border-gray-700">
      <ConfigSidebar />
    </div>

    <!-- Main Content -->
    <div class="h-full w-full overflow-y-auto bg-gray-50 dark:bg-[#1d1d1d]">
      <slot />
    </div>
  </div>
</template>
