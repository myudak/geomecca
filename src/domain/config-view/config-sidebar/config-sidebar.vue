<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

import { CONFIG_MENU } from '../constants'

const route = useRoute()
</script>

<template>
  <div class="flex flex-col h-full card-shell">
    <!-- Header -->
    <div class="p-6 border-b border-brand-surface-light-active dark:border-brand-surface-dark-hover">
      <h2 class="text-xl font-bold text-brand-text-light dark:text-brand-text-dark">Configuration</h2>
      <p class="text-sm text-brand-text-muted dark:text-brand-text-muted-dark mt-1">Manage system settings</p>
    </div>

    <!-- Menu -->
    <nav class="flex-1 p-4">
      <ul class="space-y-2">
        <li v-for="menu in CONFIG_MENU" :key="menu.label">
          <RouterLink
            :to="menu.url"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-brand-text-light transition-all group dark:text-brand-text-dark"
            :class="{
              'bg-brand-surface-light-hover text-brand-surface-normal font-semibold dark:bg-brand-surface-dark dark:text-brand-text-dark':
                route.name === menu.routeName,
              'hover:bg-brand-surface-light-hover dark:hover:bg-brand-surface-dark-hover': route.name !== menu.routeName
            }">
            <v-icon
              :name="menu.label === 'User' ? 'fa-users' : 'gi-radar-dish'"
              scale="1.1"
              class="text-brand-text-muted dark:text-brand-text-muted-dark group-hover:text-brand-surface-normal transition-colors"
              :class="{
                'text-brand-surface-normal': route.name === menu.routeName
              }" />
            <span>{{ menu.label }}</span>
          </RouterLink>
        </li>
      </ul>
    </nav>
  </div>
</template>
