<script setup lang="ts">
import { ThemeToggle } from '@src/components/theme-toggle'
import { NAVBAR_MENUS } from '@src/constants/navbar'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const toolbarMenus = NAVBAR_MENUS.filter((menu) => menu.label !== 'Home')
const primaryMenus = toolbarMenus.filter((menu) => menu.label !== 'Config')
const configMenu = toolbarMenus.find((menu) => menu.label === 'Config')

const isActive = (path: string) => route.path === path || route.path.startsWith(path)
</script>

<template>
  <nav
    class="border-b border-slate-200 bg-slate-50 text-slate-800 shadow-sm transition-colors dark:border-white/5 dark:bg-[#0b1424] dark:text-slate-100">
    <div class="mx-auto flex w-full max-w-screen-2xl flex-wrap items-center gap-4 px-4 py-3 lg:px-10">
      <div class="min-w-0 flex flex-1 flex-wrap gap-2 overflow-x-auto pb-1 text-sm">
        <RouterLink
          v-for="menu in primaryMenus"
          :key="menu.path"
          :to="menu.path"
          class="flex items-center whitespace-nowrap rounded-full px-5 py-2 font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500/70 dark:focus-visible:outline-white/40"
          :class="
            isActive(menu.path)
              ? 'bg-sky-900 text-white shadow-[0_10px_30px_rgba(15,93,142,0.35)] dark:bg-[#0e4972]'
              : 'text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
          "
          :aria-current="isActive(menu.path) ? 'page' : undefined">
          {{ menu.label }}
        </RouterLink>
      </div>
      <div class="flex items-center gap-3">
        <RouterLink
          v-if="configMenu"
          :to="configMenu.path"
          class="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:focus-visible:outline-white/40"
          :class="
            isActive(configMenu.path)
              ? 'border-slate-400 bg-white/80 text-slate-900 dark:border-white/40 dark:bg-white/10 dark:text-white'
              : 'border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:border-white/15 dark:text-slate-200 dark:hover:border-white/40 dark:hover:text-white'
          ">
          <v-icon name="md-settings" scale="1" />
          <span>Config</span>
        </RouterLink>
        <ThemeToggle />
      </div>
    </div>
  </nav>
</template>
