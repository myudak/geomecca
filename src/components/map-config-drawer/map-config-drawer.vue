<script setup lang="ts">
type SettingName = 'volcanoes' | 'trench' | 'plateBoundaries' | 'pusgen'

const props = defineProps<{
  value: Record<string, boolean>
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'change', name: SettingName, value: boolean): void
}>()

const OPTIONS = [
  {
    label: 'Show Trench',
    name: 'trench',
    icon: 'trench'
  },
  {
    label: 'Show Plate Boundaries',
    name: 'plateBoundaries',
    icon: 'plate'
  },
  {
    label: 'Show Volcanoes',
    name: 'volcanoes',
    icon: 'volcano'
  },
  {
    label: 'Show PUSGEN',
    name: 'pusgen',
    icon: 'pusgen'
  }
] as const

const onCheckboxClick = (name: SettingName) => {
  emit('change', name, !props.value[name])
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[9999] flex justify-start">
      <button
        class="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        type="button"
        aria-label="Close map settings"
        @click="$emit('close')" />
      <div
        class="relative flex h-full w-80 flex-col border-l border-base-200/80 bg-base-100 text-base-content shadow-2xl dark:border-white/5 dark:bg-[#070c1b] dark:text-white lg:w-96">
        <div class="flex items-center justify-between border-b border-base-200/80 px-6 py-5 dark:border-white/5">
          <div class="flex items-center gap-3">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/15">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4 7H20"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round" />
                <path
                  d="M4 12H20"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round" />
                <path
                  d="M4 17H20"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round" />
                <circle cx="8" cy="7" r="2" stroke="currentColor" stroke-width="1.6" />
                <circle cx="16" cy="12" r="2" stroke="currentColor" stroke-width="1.6" />
                <circle cx="10" cy="17" r="2" stroke="currentColor" stroke-width="1.6" />
              </svg>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.4em] text-base-content/60 dark:text-white/60">Control</p>
              <h2 class="text-xl font-semibold text-base-content dark:text-white">Setting</h2>
            </div>
          </div>
          <button
            class="flex h-9 w-9 items-center justify-center rounded-full text-base-content/60 transition hover:bg-base-200/70 hover:text-base-content dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
            type="button"
            aria-label="Close settings drawer"
            @click="$emit('close')">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15 5L5 15"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round" />
              <path
                d="M5 5L15 15"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </button>
        </div>
        <div
          class="border-b border-base-200/80 px-6 py-3 text-sm text-base-content/70 dark:border-white/5 dark:text-white/70">
          Atur lapisan untuk mempermudah analisis awal sebelum melompat ke detail event.
        </div>

        <div class="flex flex-col gap-4 overflow-y-auto px-6 py-6">
          <div
            v-for="option in OPTIONS"
            :key="option.name"
            class="flex items-center justify-between rounded-2xl border border-base-200/70 px-4 py-4 shadow-sm transition dark:border-white/5 dark:bg-white/5 dark:shadow-[0_8px_30px_rgba(3,8,20,0.35)]">
            <div class="flex items-center gap-3">
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-base-200/70 dark:bg-black/20">
                <svg
                  v-if="option.icon === 'trench'"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M18.2321 1.21777C18.522 1.21784 18.81 1.26501 19.0849 1.35746L21.1117 2.03912C21.2001 2.06877 21.2805 2.11853 21.3464 2.18447C21.4124 2.25042 21.4622 2.33076 21.4918 2.41918L22.1729 4.44455C22.3317 4.91708 22.3555 5.42454 22.2416 5.90984C22.1276 6.39514 21.8805 6.83901 21.5281 7.19152L17.7006 11.0189C17.5995 11.12 17.4623 11.1768 17.3193 11.1768C17.1763 11.1768 17.0391 11.12 16.9379 11.0189L16.7551 10.8361C16.7899 10.802 16.8217 10.7649 16.85 10.7253C17.3128 10.0577 17.737 9.36417 18.1207 8.64816C18.4714 7.98249 18.7144 7.40045 18.8423 6.91702C19.064 6.0797 18.9622 5.43643 18.5401 5.00471C18.345 4.80591 17.99 4.56812 17.4033 4.56812C16.6896 4.56812 15.7158 4.92474 14.4265 5.65918C13.5407 6.16337 12.8335 6.66179 12.8036 6.68312C12.7644 6.71135 12.7276 6.7429 12.6938 6.77743L12.511 6.59462C12.4098 6.49346 12.353 6.35628 12.353 6.21324C12.353 6.0702 12.4098 5.93302 12.511 5.83187L16.3378 2.00237C16.5865 1.75359 16.8819 1.55626 17.2069 1.42164C17.5319 1.28702 17.8803 1.21774 18.2321 1.21777ZM17.4017 5.4188C17.6239 5.4188 17.8057 5.47205 17.9293 5.5989C18.7954 6.48366 16.1512 10.2359 16.1512 10.2359C15.922 10.0067 15.5735 9.7509 15.227 9.7509C15.1353 9.75123 15.0445 9.77031 14.9604 9.80697C14.8762 9.84363 14.8005 9.89709 14.7378 9.96409L11.0772 13.6246L10.1231 13.4071L9.90569 12.4532L13.5663 8.79268C14.0358 8.32205 13.6361 7.7176 13.2939 7.37706C13.2939 7.37706 16.0655 5.4188 17.4017 5.4188ZM9.19263 13.1504L9.29444 13.5954C9.33015 13.7519 9.40931 13.8952 9.52283 14.0087C9.63634 14.1222 9.7796 14.2014 9.93611 14.2371L10.3811 14.3389L3.13249 21.5875C3.05495 21.6677 2.9622 21.7318 2.85966 21.7758C2.75712 21.8198 2.64683 21.843 2.53524 21.844C2.42365 21.8449 2.31298 21.8236 2.2097 21.7814C2.10641 21.7391 2.01258 21.6767 1.93367 21.5978C1.85476 21.5189 1.79236 21.425 1.7501 21.3218C1.70784 21.2185 1.68657 21.1078 1.68753 20.9962C1.68849 20.8846 1.71167 20.7743 1.75571 20.6718C1.79974 20.5693 1.86376 20.4765 1.94402 20.399L9.19263 13.1504Z"
                    fill="#1369EA" />
                </svg>
                <svg
                  v-else-if="option.icon === 'plate'"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M5.52834 2.36719L5.64694 7.05028L10.5835 9.8145L5.52834 2.36719ZM17.7583 3.42628L13.1909 5.11238L14.1724 13.125L17.7583 3.42628ZM23.1593 7.11769L16.8822 9.92719L20.0492 15.5405L20.3143 16.0122L19.7987 16.1749L15.952 17.3833L18.6444 19.6919L19.7577 20.647L18.3031 20.4595L6.38658 18.9213L4.72692 18.7075L6.2782 18.0805L12.2401 15.6737L8.13281 13.8295L0.925781 17.0581V23.1826H23.1592V7.11769H23.1593ZM6.38817 9.48347L1.86333 10.5454L13.4341 13.9365L6.38822 9.48337L6.38817 9.48347Z"
                    fill="#46CF68" />
                </svg>
                <svg
                  v-else-if="option.icon === 'volcano'"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9 8V7C9 6.46957 8.78929 5.96086 8.41421 5.58579C8.03914 5.21071 7.53043 5 7 5C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7M15 8V7C15 6.46957 15.2107 5.96086 15.5858 5.58579C15.9609 5.21071 16.4696 5 17 5C17.5304 5 18.0391 5.21071 18.4142 5.58579C18.7893 5.96086 19 6.46957 19 7M4 20L7.472 12.188C7.62911 11.8344 7.88543 11.5339 8.2099 11.323C8.53436 11.1122 8.91303 11 9.3 11H14.7C15.087 11 15.4656 11.1122 15.7901 11.323C16.1146 11.5339 16.3709 11.8344 16.528 12.188L20 20"
                    stroke="#FF534A"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round" />
                  <path
                    d="M6.19189 15.064C6.34709 15.0237 6.50657 15.0022 6.66689 15C7.19389 14.991 7.69289 15.178 7.99989 15.5C8.30689 15.82 8.80589 16.007 9.33289 16C9.85989 16.007 10.3589 15.82 10.6669 15.5C10.9739 15.178 11.4729 14.991 11.9999 15C12.5269 14.991 13.0259 15.178 13.3329 15.5C13.6409 15.82 14.1399 16.007 14.6669 16C15.1939 16.007 15.6929 15.82 15.9999 15.5C16.3069 15.178 16.8059 14.991 17.3329 15C17.4949 15.0033 17.6522 15.0247 17.8049 15.064M11.9999 8V4"
                    stroke="#FF534A"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
                <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clip-path="url(#clip0_760_2309)">
                    <path
                      d="M9.88007 23.05C8.65007 21.326 7.73307 18.417 7.39307 14.992M9.88007 1C9.04407 2.145 8.35207 3.88 7.88807 5.958M14.1201 23.05C15.3421 21.338 16.2551 18.456 16.6001 15.06M14.1201 1C15.1671 2.434 15.9881 4.794 16.4181 7.592"
                      stroke="#6C6BDB"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round" />
                    <path
                      d="M2.05 6.74988C10.054 5.21888 14.387 5.21088 21.95 6.74988M21.95 17.2499C13.947 18.7819 9.614 18.7889 2.05 17.2499M1 12.0049H6.64C6.70851 12.0055 6.77577 11.9865 6.83387 11.9502C6.89197 11.9139 6.9385 11.8617 6.968 11.7999L8.685 8.31488C8.71704 8.25035 8.76723 8.19657 8.82941 8.16015C8.89158 8.12373 8.96304 8.10626 9.035 8.10988C9.1071 8.11348 9.17644 8.13867 9.23404 8.18219C9.29164 8.2257 9.33483 8.28552 9.358 8.35388L11.689 14.8589C11.7131 14.9293 11.7578 14.9908 11.8174 15.0354C11.877 15.08 11.9486 15.1056 12.023 15.1089C12.0977 15.1121 12.1715 15.0919 12.2342 15.0512C12.297 15.0106 12.3455 14.9514 12.373 14.8819L14.623 9.74988C14.6512 9.68628 14.6967 9.6319 14.7543 9.59298C14.812 9.55407 14.8795 9.5322 14.949 9.52988C15.0189 9.52775 15.0878 9.546 15.1475 9.5824C15.2072 9.6188 15.2549 9.67179 15.285 9.73488L16.302 11.7999C16.3325 11.8611 16.3794 11.9127 16.4375 11.9489C16.4956 11.9851 16.5626 12.0045 16.631 12.0049H23"
                      stroke="#6C6BDB"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round" />
                    <path
                      d="M22.9872 9.572C21.8772 4.526 17.3802 0.75 12.0002 0.75C6.62018 0.75 2.12318 4.526 1.01318 9.572M22.9872 14.428C21.8772 19.474 17.3802 23.25 12.0002 23.25C6.62018 23.25 2.12318 19.474 1.01318 14.428"
                      stroke="#6C6BDB"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round" />
                  </g>
                  <defs>
                    <clipPath id="clip0_760_2309">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <span class="text-base font-medium text-base-content dark:text-white">{{ option.label }}</span>
            </div>

            <label class="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                class="peer sr-only"
                :checked="value[option.name] ?? false"
                @change="onCheckboxClick(option.name)" />
              <div
                class="peer h-6 w-11 rounded-full bg-base-200/70 transition-colors after:absolute after:left-[3px] after:top-[3px] after:h-5 after:w-5 after:rounded-full after:bg-base-100 after:shadow after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-5 peer-focus:outline-none dark:bg-white/20 dark:after:bg-white"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
