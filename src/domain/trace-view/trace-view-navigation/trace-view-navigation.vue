<script setup lang="ts">
import { ref, watch } from 'vue'

type Status = 'ENABLED' | 'DISABLED'

const props = defineProps<{
  status: Status
  page: number
  limit: number
  totalPage: number
  totalEnabled: number
  totalDisabled: number
}>()

defineEmits<{
  (e: 'change-status', newStatus: Status): void
  (e: 'change-limit', newLimit: number): void
  (e: 'next-page'): void
  (e: 'prev-page'): void
}>()

// const changeLimit = (event: Event) => {
//   const target = event.target as HTMLSelectElement
//   emit('change-limit', Number(target.value))
// }

const { page, totalPage } = props

const isPrevEnabled = ref(page > 1)
const isNextEnabled = ref(page < totalPage)

watch(
  () => props.page,
  (newPage) => {
    isPrevEnabled.value = newPage > 1
    isNextEnabled.value = newPage < totalPage
  }
)
</script>

<template>
  <div
    class="flex justify-between items-center bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-gray-700 px-4 py-2">
    <div role="tablist" class="tabs tabs-sm gap-1">
      <a
        role="tab"
        class="tab px-4 my-1 rounded-lg transition-all"
        :class="{
          'bg-primary text-white': status === 'ENABLED',
          'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700':
            status !== 'ENABLED'
        }"
        @click="$emit('change-status', 'ENABLED')">
        Enabled ({{ totalEnabled }})
      </a>
      <a
        role="tab"
        class="tab px-4 my-1 rounded-lg transition-all"
        :class="{
          'bg-primary text-white': status === 'DISABLED',
          'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700':
            status !== 'DISABLED'
        }"
        @click="$emit('change-status', 'DISABLED')">
        Disabled ({{ totalDisabled }})
      </a>
    </div>

    <div class="flex gap-2 items-center">
      <div class="join">
        <button
          :class="{
            'join-item btn btn-sm text-gray-700 dark:text-gray-300': true,
            'btn-disabled opacity-30 dark:bg-slate-500': !isPrevEnabled,
            'bg-gray-100 dark:bg-gray-200 hover:bg-primary hover:text-white border-gray-300 dark:text-white-300 dark:border-gray-600':
              isPrevEnabled
          }"
          @click="$emit('prev-page')">
          <v-icon name="io-chevron-back-sharp" scale="0.8" class="text-gray-700 dark:text-white" />
        </button>
        <button
          :class="{
            'join-item btn btn-sm text-gray-700 dark:text-gray-300': true,
            'btn-disabled opacity-30 dark:bg-slate-500': !isNextEnabled,
            'bg-gray-100 dark:bg-gray-200 hover:bg-primary hover:text-white border-gray-300 dark:border-gray-600':
              isNextEnabled
          }"
          @click="$emit('next-page')">
          <v-icon name="io-chevron-forward-sharp" scale="0.8" class="text-gray-700 dark:text-white" />
        </button>
      </div>
    </div>
  </div>
</template>
