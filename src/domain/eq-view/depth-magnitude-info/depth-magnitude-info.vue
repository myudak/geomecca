<script setup lang="ts">
import { getDepthColor, getMagnitudeWidth } from '@src/utils/event'

const magnitudes = [...new Array(8)].map((_, index) => index + 1)
</script>

<template>
  <div
    class="max-md:hidden rounded-3xl bg-white/80 px-5 py-4 text-slate-900 shadow-xl backdrop-blur-lg dark:bg-slate-900/70 dark:text-white">
    <div>
      <p class="text-lg font-semibold tracking-wide">Depth (km)</p>
      <div class="mt-3 flex flex-wrap items-center gap-4 text-sm font-medium">
        <div
          v-for="legend in [
            { label: '< 50', depth: 25 },
            { label: '50', depth: 75 },
            { label: '100', depth: 125 },
            { label: '200', depth: 225 },
            { label: '> 300', depth: 350 }
          ]"
          :key="legend.label"
          class="flex items-center gap-2">
          <span class="inline-flex h-3 w-3 rounded-sm" :style="{ backgroundColor: getDepthColor(legend.depth) }"></span>
          <span>{{ legend.label }}</span>
        </div>
      </div>
    </div>

    <div class="my-4 h-px bg-slate-900/10 dark:bg-white/20"></div>

    <div>
      <p class="text-lg font-semibold tracking-wide">Magnitude</p>
      <div class="mt-4 flex items-end justify-between gap-3">
        <div v-for="magnitude in magnitudes" :key="magnitude" class="flex flex-col items-center gap-2 text-sm">
          <span
            class="flex items-center justify-center rounded-full border border-slate-900/10 bg-sky-600 dark:border-white/20"
            :style="{
              width: `${getMagnitudeWidth(magnitude)}px`,
              height: `${getMagnitudeWidth(magnitude)}px`
            }"></span>
          <span>{{ magnitude }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
