<script setup lang="ts">
const model = defineModel<string>()

withDefaults(
  defineProps<{
    label?: string
    error?: string
    type?: string
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    disabled: false,
    placeholder: '',
    error: '',
    type: 'text',
    label: ''
  }
)
</script>

<template>
  <label class="flex w-full flex-col gap-1 text-sm font-medium text-brand-text-light dark:text-brand-text-dark ]">
    <span v-if="!!label">{{ label }}</span>
    <div
      class="flex w-full items-center rounded-xl border border-brand-surface-light-active bg-white/90 px-4 py-2 text-brand-text-light shadow-sm transition focus-within:border-brand-surface-normal focus-within:ring-2 focus-within:ring-brand-surface-normal/30 dark:border-brand-surface-dark-hover dark:bg-brand-surface-dark dark:text-brand-text-dark">
      <input
        v-model="model"
        :type="type"
        class="w-full border-none bg-transparent text-sm text-brand-text-light placeholder:text-brand-text-muted focus:outline-none dark:text-brand-text-dark dark:placeholder:text-brand-text-muted-dark"
        :disabled="disabled"
        :placeholder="placeholder" />
    </div>
    <span v-if="!!error" class="text-xs font-normal text-error">{{ error }}</span>
  </label>
</template>
