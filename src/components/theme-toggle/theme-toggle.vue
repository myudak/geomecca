<script setup lang="ts">
import { useTheme } from '@src/hooks/use-theme'

const { theme, toggleTheme } = useTheme()
</script>

<template>
  <button
    class="group relative inline-flex h-9 w-20 items-center overflow-hidden rounded-full border border-slate-300 bg-slate-200/90 px-1 text-slate-900 transition hover:border-slate-400 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:border-white/40"
    :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggleTheme">
    <span
      class="absolute left-3 text-xs text-amber-500 transition-opacity duration-200 ease-out"
      :class="theme === 'dark' ? 'opacity-0' : 'opacity-100'">
      <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          d="M10 3a1 1 0 011 1v1a1 1 0 11-2 0V4a1 1 0 011-1zm0 8a4 4 0 100-8 4 4 0 000 8zm7-3a1 1 0 100-2h-1a1 1 0 100 2h1zm-6 7a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-7-6a1 1 0 100-2H3a1 1 0 000 2h1zm.293-5.707a1 1 0 011.414 0l.707.707A1 1 0 014.293 6.414l-.707-.707a1 1 0 010-1.414zm11.414 0a1 1 0 000 1.414l.707.707a1 1 0 101.414-1.414l-.707-.707a1 1 0 00-1.414 0zM5.05 14.536a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zm8.486 0a1 1 0 000 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 0z" />
      </svg>
    </span>
    <span
      class="absolute right-3 text-xs text-slate-200 transition-opacity duration-200 ease-out"
      :class="theme === 'dark' ? 'opacity-100' : 'opacity-0'">
      <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M17.293 13.293a8 8 0 01-10.586-10.586 8 8 0 1010.586 10.586z" />
      </svg>
    </span>
    <span
      class="absolute left-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-800 shadow-lg transition-transform duration-200 ease-in-out dark:bg-slate-100 dark:text-slate-900"
      :class="theme === 'dark' ? 'translate-x-9' : 'translate-x-0'">
      <svg v-if="theme === 'dark'" class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M17.293 13.293a8 8 0 01-10.586-10.586 8 8 0 1010.586 10.586z" />
      </svg>
      <svg v-else class="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
        <path
          d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM4 9a1 1 0 100 2H3a1 1 0 000-2h1zm13 0a1 1 0 100 2h-1a1 1 0 000-2h1zm-7 7a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4.95-2.536a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707zm9.9.707a1 1 0 10-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM6.464 4.05A1 1 0 005.05 5.464l.707.707A1 1 0 107.17 4.757l-.707-.707zm7.778.707l-.707-.707a1 1 0 111.414-1.414l.707.707a1 1 0 01-1.414 1.414zM10 5a4 4 0 100 8 4 4 0 000-8z" />
      </svg>
    </span>
  </button>
</template>
