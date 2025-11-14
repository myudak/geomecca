<script setup lang="ts">
import { ConfigSidebar } from '../config-sidebar'
</script>

<template>
  <div class="flex h-full overflow-hidden bg-brand-surface-light text-brand-text-light dark:bg-brand-surface-darker dark:text-brand-text-dark">
    <!-- Sidebar -->
    <div class="max-md:hidden h-full w-72 border-r border-brand-surface-light-active bg-white/90 shadow-lg shadow-brand-surface-light-active/40 dark:border-brand-surface-dark-hover dark:bg-brand-surface-darker">
      <ConfigSidebar />
    </div>

    <!-- Main Content -->
    <div class="h-full w-full overflow-y-auto bg-transparent">
      <slot />
    </div>
  </div>
</template>
