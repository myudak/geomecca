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
  <div class="flex items-center justify-between bg-base-100 px-4 py-2 dark:border-base-300 dark:bg-[#1b2332]">
    <div
      role="tablist"
      class="tabs tabs-boxed tabs-sm rounded-2xl bg-base-200/70 p-1 shadow-inner dark:border-base-200/60 dark:bg-base-300/40 gap-3 flex">
      <button
        type="button"
        role="tab"
        class="tab tab-sm flex items-center gap-2 rounded-xl px-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all"
        :class="[
          status === 'ENABLED'
            ? 'tab-active border border-primary/40 bg-primary/10 text-primary ring ring-primary/30 dark:border-primary/60 dark:bg-primary/20 dark:text-primary-content dark:ring-primary/40'
            : 'border border-transparent text-base-content/70 hover:text-base-content'
        ]"
        @click="$emit('change-status', 'ENABLED')">
        <span>Enabled</span>
        <span
          class="rounded-full px-2 py-0.5 text-[10px] font-bold"
          :class="[
            status === 'ENABLED'
              ? 'bg-primary text-primary-content'
              : 'bg-base-100 text-base-content/80 dark:bg-base-200/70'
          ]">
          {{ totalEnabled }}
        </span>
      </button>
      <button
        type="button"
        role="tab"
        class="tab tab-sm flex items-center gap-2 rounded-xl px-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all"
        :class="[
          status === 'DISABLED'
            ? 'tab-active border border-secondary/40 bg-secondary/10 text-secondary ring ring-secondary/30 dark:border-secondary/60 dark:bg-secondary/20 dark:text-secondary-content dark:ring-secondary/40'
            : 'border border-transparent text-base-content/70 hover:text-base-content'
        ]"
        @click="$emit('change-status', 'DISABLED')">
        <span>Disabled</span>
        <span
          class="rounded-full px-2 py-0.5 text-[10px] font-bold"
          :class="[
            status === 'DISABLED'
              ? 'bg-secondary text-secondary-content'
              : 'bg-base-100 text-base-content/80 dark:bg-base-200/70'
          ]">
          {{ totalDisabled }}
        </span>
      </button>
    </div>

    <div class="flex items-center gap-2">
      <div class="join">
        <button
          class="join-item btn btn-sm btn-ghost"
          :class="{ 'btn-disabled': !isPrevEnabled }"
          @click="$emit('prev-page')">
          <v-icon name="io-chevron-back-sharp" scale="0.8" />
        </button>
        <button
          class="join-item btn btn-sm btn-ghost"
          :class="{ 'btn-disabled': !isNextEnabled }"
          @click="$emit('next-page')">
          <v-icon name="io-chevron-forward-sharp" scale="0.8" />
        </button>
      </div>
    </div>
  </div>
</template>
