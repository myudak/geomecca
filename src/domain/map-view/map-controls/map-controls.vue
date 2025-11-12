<script setup lang="ts">
defineEmits<{
  (e: 'toggle-events'): void
  (e: 'toggle-settings'): void
}>()
</script>

<template>
  <div class="flex gap-2.5 p-2.5">
    <button
      class="group flex items-center gap-2.5 px-4 py-2.5 bg-white dark:bg-[#202020] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-[1.03] transition-all duration-200"
      @click="$emit('toggle-events')">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.66666 5H17.5" stroke="#0369A1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M6.66666 10H17.5" stroke="#0369A1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M6.66666 15H17.5" stroke="#0369A1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M2.5 5H2.50833" stroke="#0369A1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M2.5 10H2.50833" stroke="#0369A1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M2.5 15H2.50833" stroke="#0369A1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <span class="text-sm font-semibold text-gray-900 dark:text-white">Events</span>
    </button>

    <button
      class="group flex items-center gap-2.5 px-4 py-2.5 bg-white dark:bg-[#202020] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-[1.03] transition-all duration-200"
      @click="$emit('toggle-settings')">
      <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M1 2.66699H4.33333M16 2.66699H7.66667M1 8.50033H11M16 8.50033H14.3333M1 14.3337H2.66667M16 14.3337H6"
          stroke="#0369A1"
          stroke-width="2"
          stroke-linecap="round" />
        <path
          d="M6.00001 4.33333C6.92049 4.33333 7.66668 3.58714 7.66668 2.66667C7.66668 1.74619 6.92049 1 6.00001 1C5.07954 1 4.33334 1.74619 4.33334 2.66667C4.33334 3.58714 5.07954 4.33333 6.00001 4.33333Z"
          stroke="#0369A1"
          stroke-width="2"
          stroke-linecap="round" />
        <path
          d="M12.6667 10.1663C13.5871 10.1663 14.3333 9.42015 14.3333 8.49967C14.3333 7.5792 13.5871 6.83301 12.6667 6.83301C11.7462 6.83301 11 7.5792 11 8.49967C11 9.42015 11.7462 10.1663 12.6667 10.1663Z"
          stroke="#0369A1"
          stroke-width="2"
          stroke-linecap="round" />
        <path
          d="M4.33332 16.0003C5.2538 16.0003 5.99999 15.2541 5.99999 14.3337C5.99999 13.4132 5.2538 12.667 4.33332 12.667C3.41285 12.667 2.66666 13.4132 2.66666 14.3337C2.66666 15.2541 3.41285 16.0003 4.33332 16.0003Z"
          stroke="#0369A1"
          stroke-width="2"
          stroke-linecap="round" />
      </svg>
      <span class="text-sm font-semibold text-gray-900 dark:text-white">Settings</span>
    </button>
  </div>
</template>
