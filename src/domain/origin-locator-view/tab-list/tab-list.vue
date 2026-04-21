<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const props = defineProps<{
  id: string
  selectedTab: string
  originId: string
}>()

const route = useRoute()

const analysisTools = computed(() => [
  {
    key: 'events',
    label: 'Event Logs',
    description: 'Historical list',
    icon: 'fa-list',
    to: '/origin-locator-view/events',
    disabled: false
  },
  {
    key: 'magnitude',
    label: 'B-Value',
    description: '1.04',
    icon: 'gi-sound-waves',
    to: props.id && props.originId ? `/origin-locator-view/magnitude/${props.id}/${props.originId}` : route.fullPath,
    disabled: !props.id || !props.originId
  },
  {
    key: 'origin',
    label: 'Wadati Diagram',
    description: 'Kumulatif',
    icon: 'la-dot-circle',
    to: props.id ? `/origin-locator-view/origin/${props.id}` : route.fullPath,
    disabled: !props.id
  },
  {
    key: 'nearby',
    label: 'Nearby Earthquake',
    description: 'Regional Data',
    icon: 'bi-geo-alt',
    to: `/origin-locator-view/nearby`,
    disabled: false
  },
  {
    key: 'location',
    label: 'Location Detail',
    description: 'Hypocenter Map',
    icon: 'fa-map',
    to: props.id && props.originId ? `/origin-locator-view/location/${props.id}/${props.originId}` : route.fullPath,
    disabled: !props.id || !props.originId
  }
])

const shouldHighlight = (toolKey: string) => toolKey !== 'events' && props.selectedTab === toolKey

const getItemClasses = (toolKey: string, disabled: boolean) => {
  if (disabled) {
    return 'cursor-not-allowed border border-dashed border-slate-200 bg-slate-100/80 text-slate-300 opacity-70 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-500'
  }

  return shouldHighlight(toolKey)
    ? 'border-amber-500 bg-amber-50 text-slate-900 shadow-[0_10px_30px_rgba(200,138,4,0.16)] dark:border-amber-400/70 dark:bg-amber-500/10 dark:text-white'
    : 'border-slate-200 text-slate-500 hover:border-amber-300 hover:text-slate-900 dark:border-white/10 dark:text-slate-300 dark:hover:border-amber-400/80 dark:hover:text-white'
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Analysis Tools</p>
    </div>
    <div class="space-y-3">
      <RouterLink
        v-for="tool in analysisTools"
        :key="tool.label"
        :to="tool.to"
        class="flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all"
        :class="getItemClasses(tool.key, tool.disabled)"
        :aria-disabled="tool.disabled ? 'true' : 'false'"
        :title="tool.disabled ? 'Select an event/origin to unlock this tool' : undefined"
        @click="tool.disabled && $event.preventDefault()">
        <div
          class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-slate-800 dark:text-amber-200"
          :class="{
            'bg-slate-200 text-slate-400 dark:bg-slate-800/70 dark:text-slate-500': tool.disabled,
            'bg-amber-500 text-white dark:bg-amber-400 dark:text-slate-900': !tool.disabled && shouldHighlight(tool.key)
          }">
          <v-icon :name="tool.icon" scale="1" />
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-semibold text-slate-700 dark:text-slate-100">{{ tool.label }}</span>
          <span class="text-xs text-slate-400" :class="{ 'text-slate-600 dark:text-slate-200': selectedTab === tool.key }">
            {{ tool.description }}
          </span>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
