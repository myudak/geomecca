<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

import { CONFIG_MENU } from '../constants'

const route = useRoute()
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="p-6 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">Configuration</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage system settings</p>
    </div>

    <!-- Menu -->
    <nav class="flex-1 p-4">
      <ul class="space-y-2">
        <li v-for="menu in CONFIG_MENU" :key="menu.label">
          <RouterLink
            :to="menu.url"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-all group"
            :class="{
              'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary font-semibold':
                route.name === menu.routeName
            }">
            <v-icon
              :name="menu.label === 'User' ? 'fa-users' : 'gi-radar-dish'"
              scale="1.1"
              class="text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors"
              :class="{
                'text-primary': route.name === menu.routeName
              }" />
            <span>{{ menu.label }}</span>
          </RouterLink>
        </li>
      </ul>
    </nav>
  </div>
</template>
