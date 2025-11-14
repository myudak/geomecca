<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    informations: {
      label: string
      value: string | number
      width?: string
    }[]
    variant?: 'dark' | 'light'
  }>(),
  {
    variant: 'dark'
  }
)
</script>

<template>
  <table class="table table-xs">
    <tr v-for="info in informations" :key="info.label">
      <td class="text-right text-slate-400" :width="info.width">
        {{ info.label }}
      </td>
      <td class="truncate">
        {{ info.value }}
      </td>
    </tr>
  </table>
</template>
