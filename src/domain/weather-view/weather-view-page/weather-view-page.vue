<script setup lang="ts">
import { ref, onMounted } from 'vue'

type WeatherStatus = 'Normal' | 'Waspada' | 'Siaga'

type ForecastCard = {
  city: string
  window: string
  condition: string
  temperature: string
  humidity: string
  wind: string
  rainChance: string
  icon: string
}

const headlineWarnings = [
  'Hujan sedang hingga lebat berpotensi terjadi di pesisir barat Sumatra, selatan Jawa, dan sebagian Kalimantan.',
  'Angin kencang sesaat diperkirakan muncul pada sore hingga malam hari di beberapa koridor operasi tambang.',
  'Pemantauan radar cuaca regional menunjukkan aktivitas awan konvektif di utara ekuator.'
]

const forecastCards: ForecastCard[] = [
  { city: 'Jakarta', window: '13.00-19.00 WIB', condition: 'Berawan Tebal', temperature: '31°C', humidity: '74%', wind: '12 km/h NE', rainChance: '45%', icon: 'bi-cloud-sun' },
  { city: 'Bandung', window: '13.00-19.00 WIB', condition: 'Hujan Ringan', temperature: '28°C', humidity: '85%', wind: '10 km/h W', rainChance: '68%', icon: 'bi-cloud-rain-heavy' },
  { city: 'Semarang', window: '13.00-19.00 WIB', condition: 'Cerah Berawan', temperature: '33°C', humidity: '70%', wind: '14 km/h E', rainChance: '32%', icon: 'bi-cloud-sun' },
  { city: 'Surabaya', window: '13.00-19.00 WIB', condition: 'Panas Lembap', temperature: '34°C', humidity: '67%', wind: '16 km/h SE', rainChance: '20%', icon: 'bi-sunrise' },
  { city: 'Makassar', window: '13.00-19.00 WITA', condition: 'Hujan Sedang', temperature: '31°C', humidity: '89%', wind: '18 km/h NW', rainChance: '72%', icon: 'bi-cloud-rain-heavy' },
  { city: 'Jayapura', window: '13.00-19.00 WIT', condition: 'Badai Petir', temperature: '30°C', humidity: '92%', wind: '20 km/h E', rainChance: '81%', icon: 'bi-cloud-lightning-rain' }
]

const warningBulletins = [
  { region: 'Jawa Barat Selatan', phenomenon: 'Hujan lebat disertai petir pada siang-sore hari', window: '18 Apr 13.00-20.00 WIB', recommendation: 'Siapkan pengamanan lereng dan monitoring drainase area operasi.', status: 'Siaga' as WeatherStatus },
  { region: 'Kalimantan Timur', phenomenon: 'Potensi angin kencang sesaat di koridor pesisir', window: '18 Apr 14.00-19.00 WITA', recommendation: 'Batasi pekerjaan ketinggian dan cek ulang jalur logistik terbuka.', status: 'Waspada' as WeatherStatus },
  { region: 'Sulawesi Selatan', phenomenon: 'Hujan sedang dengan visibilitas menurun', window: '18 Apr 15.00-21.00 WITA', recommendation: 'Perkuat notifikasi perjalanan lapangan dan kesiapan pos hujan.', status: 'Waspada' as WeatherStatus }
]

const maritimeBulletins = [
  { area: 'Perairan Selatan Jawa', waveHeight: '2.5-4.0 m', wind: '22-30 knot', advisory: 'Waspadai operasional kapal kecil dan platform pesisir.', status: 'Siaga' as WeatherStatus },
  { area: 'Selat Makassar', waveHeight: '1.25-2.5 m', wind: '16-22 knot', advisory: 'Kondisi masih operasional dengan pemantauan berkala.', status: 'Waspada' as WeatherStatus },
  { area: 'Laut Banda', waveHeight: '0.75-1.5 m', wind: '10-16 knot', advisory: 'Kondisi relatif aman untuk patroli rutin.', status: 'Normal' as WeatherStatus }
]

const getStatusBadge = (status: WeatherStatus) => {
  if (status === 'Siaga') return 'bg-red-500/10 text-red-700 border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30'
  if (status === 'Waspada') return 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30'
  return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
}

const getStatusDot = (status: WeatherStatus) => {
  if (status === 'Siaga') return 'bg-red-500'
  if (status === 'Waspada') return 'bg-amber-500'
  return 'bg-emerald-500'
}

const isLoading = ref(true)

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 1200) // 1.2s delay to simulate secure data fetching
})
</script>

<template>
  <!-- Background menggunakan palet warna bumi yang solid dan gelap/terang -->
  <div class="min-h-screen bg-[#F7F5F0] text-[#2A241B] dark:bg-[#110F0D] dark:text-[#F0EDE6] font-sans selection:bg-brand-surface-normal selection:text-white">
    
    <!-- HEADER BAR: Operasional & Padat -->
    <header class="border-b border-[#E5DFD3] bg-white px-6 py-4 dark:border-[#2E2A24] dark:bg-[#1A1815]">
      <div class="mx-auto flex max-w-screen-2xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-xl font-bold uppercase tracking-wide">AI-Powered Multi-Hazard Early Warning System</h1>
            <span class="rounded bg-[#2A241B] px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest text-white dark:bg-[#F0EDE6] dark:text-[#110F0D]">
              MHEWS Intelligence
            </span>
          </div>
          <p class="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Integrating Earthquake Detection and Weather Intelligence in a Unified Platform
          </p>
        </div>
        
        <div class="flex items-center gap-6 font-mono text-xs">
          <div class="flex flex-col items-end">
            <span class="text-stone-400">SYSTEM TIME (WIB)</span>
            <span class="font-bold">18 APR 2026 09:42:10</span>
          </div>
          <div class="flex flex-col items-end">
            <span class="text-stone-400">DATA FEED</span>
            <span v-if="!isLoading" class="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
              <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              ACTIVE
            </span>
            <span v-else class="flex items-center gap-2 font-bold text-amber-500 dark:text-amber-400">
              <span class="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
              SYNCING...
            </span>
          </div>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-screen-2xl p-6 space-y-6">
      <transition name="fade" mode="out-in">
        <!-- LOADING SKELETON -->
        <div v-if="isLoading" class="space-y-6">
          <section class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div class="col-span-2 rounded-lg border border-[#E5DFD3] bg-white p-5 dark:border-[#2E2A24] dark:bg-[#1A1815]">
              <div class="mb-4 h-6 w-1/3 animate-pulse rounded bg-stone-200 dark:bg-stone-800"></div>
              <div class="space-y-4">
                <div class="flex gap-4"><div class="h-4 w-4 shrink-0 rounded bg-stone-200 dark:bg-stone-800"></div><div class="h-4 w-full rounded bg-stone-200 dark:bg-stone-800"></div></div>
                <div class="flex gap-4"><div class="h-4 w-4 shrink-0 rounded bg-stone-200 dark:bg-stone-800"></div><div class="h-4 w-5/6 rounded bg-stone-200 dark:bg-stone-800"></div></div>
                <div class="flex gap-4"><div class="h-4 w-4 shrink-0 rounded bg-stone-200 dark:bg-stone-800"></div><div class="h-4 w-4/6 rounded bg-stone-200 dark:bg-stone-800"></div></div>
              </div>
            </div>
            <div class="rounded-lg border border-[#E5DFD3] bg-white p-5 dark:border-[#2E2A24] dark:bg-[#1A1815]">
              <div class="mb-4 h-6 w-1/2 animate-pulse rounded bg-stone-200 dark:bg-stone-800"></div>
              <div class="grid grid-cols-2 gap-4">
                <div class="h-16 animate-pulse rounded border border-[#E5DFD3] bg-stone-50 dark:border-[#2E2A24] dark:bg-[#201D19]"></div>
                <div class="h-16 animate-pulse rounded border border-[#E5DFD3] bg-stone-50 dark:border-[#2E2A24] dark:bg-[#201D19]"></div>
              </div>
              <div class="mt-4 h-[76px] animate-pulse rounded bg-stone-50 dark:bg-[#201D19]"></div>
            </div>
          </section>

          <section>
            <div class="mb-4 h-6 w-1/4 animate-pulse rounded bg-stone-200 dark:bg-stone-800"></div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
              <div v-for="i in 6" :key="i" class="h-36 animate-pulse rounded-lg border border-[#E5DFD3] bg-white p-4 dark:border-[#2E2A24] dark:bg-[#1A1815]">
                <div class="mb-6 h-5 w-1/2 rounded bg-stone-200 dark:bg-stone-800"></div>
                <div class="space-y-3">
                  <div class="h-4 w-full rounded bg-stone-100 dark:bg-stone-800/50"></div>
                  <div class="h-4 w-5/6 rounded bg-stone-100 dark:bg-stone-800/50"></div>
                </div>
              </div>
            </div>
          </section>

          <section class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div class="h-64 animate-pulse rounded-lg border border-[#E5DFD3] bg-white dark:border-[#2E2A24] dark:bg-[#1A1815]"></div>
            <div class="h-64 animate-pulse rounded-lg border border-[#E5DFD3] bg-white dark:border-[#2E2A24] dark:bg-[#1A1815]"></div>
          </section>
        </div>

        <!-- LOADED CONTENT -->
        <div v-else class="space-y-6">
          <!-- TOP SECTION: OUTLOOK & RINGKASAN -->
          <section class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <!-- Bulletins -->
            <div class="col-span-2 rounded-lg border border-[#E5DFD3] bg-white p-5 dark:border-[#2E2A24] dark:bg-[#1A1815]">
              <div class="mb-4 flex items-center justify-between border-b border-[#E5DFD3] pb-3 dark:border-[#2E2A24]">
                <h2 class="font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">24-Hour National Outlook</h2>
                <v-icon name="bi-broadcast" class="text-brand-surface-normal" />
              </div>
              <ul class="space-y-3">
                <li v-for="warning in headlineWarnings" :key="warning" class="flex gap-4 text-sm leading-relaxed">
                  <span class="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-amber-500/20 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                    <v-icon name="bi-exclamation-triangle-fill" scale="0.6" />
                  </span>
                  <span class="text-stone-700 dark:text-stone-300">{{ warning }}</span>
                </li>
              </ul>
            </div>

            <!-- Metrics -->
            <div class="rounded-lg border border-[#E5DFD3] bg-white p-5 dark:border-[#2E2A24] dark:bg-[#1A1815]">
              <h2 class="mb-4 border-b border-[#E5DFD3] pb-3 font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                Status Terkini
              </h2>
              <div class="grid grid-cols-2 gap-4">
                <div class="rounded border border-[#E5DFD3] p-3 dark:border-[#2E2A24]">
                  <span class="text-[10px] font-bold uppercase tracking-widest text-stone-500">Provinsi Prioritas</span>
                  <p class="mt-1 font-mono text-2xl font-bold text-brand-surface-normal">12</p>
                </div>
                <div class="rounded border border-[#E5DFD3] p-3 dark:border-[#2E2A24]">
                  <span class="text-[10px] font-bold uppercase tracking-widest text-stone-500">Alerts Aktif</span>
                  <p class="mt-1 font-mono text-2xl font-bold text-red-500">07</p>
                </div>
              </div>
              <div class="mt-4 flex flex-col gap-2 font-mono text-xs">
                <div class="flex justify-between rounded bg-stone-50 px-3 py-2 dark:bg-[#201D19]">
                  <span class="text-stone-500">SIAGA</span><span class="font-bold text-red-500">04 AREA</span>
                </div>
                <div class="flex justify-between rounded bg-stone-50 px-3 py-2 dark:bg-[#201D19]">
                  <span class="text-stone-500">WASPADA</span><span class="font-bold text-amber-500">11 AREA</span>
                </div>
              </div>
            </div>
          </section>

          <!-- MIDDLE SECTION: FORECAST GRID -->
          <section>
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-lg font-bold uppercase tracking-wider">Prakiraan Kota Utama</h2>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
              <article 
                v-for="forecast in forecastCards" 
                :key="forecast.city"
                class="group relative flex flex-col justify-between rounded-lg border border-[#E5DFD3] bg-white p-4 transition-colors hover:border-brand-surface-normal dark:border-[#2E2A24] dark:bg-[#1A1815] dark:hover:border-brand-surface-normal">
                
                <div class="flex items-start justify-between">
                  <div>
                    <h3 class="font-bold">{{ forecast.city }}</h3>
                    <p class="mt-1 font-mono text-[10px] text-stone-500">{{ forecast.window }}</p>
                  </div>
                  <v-icon :name="forecast.icon" scale="1.2" class="text-stone-400 group-hover:text-brand-surface-normal transition-colors" />
                </div>
                
                <div class="mt-4 border-t border-[#E5DFD3] pt-3 dark:border-[#2E2A24]">
                  <p class="text-sm font-semibold text-stone-800 dark:text-stone-200">{{ forecast.condition }}</p>
                  <div class="mt-3 grid grid-cols-2 gap-x-2 gap-y-3 font-mono text-xs">
                    <div>
                      <span class="block text-[9px] text-stone-400">SUHU</span>
                      <span class="font-bold">{{ forecast.temperature }}</span>
                    </div>
                    <div>
                      <span class="block text-[9px] text-stone-400">ANGIN</span>
                      <span class="font-bold">{{ forecast.wind }}</span>
                    </div>
                    <div>
                      <span class="block text-[9px] text-stone-400">RH</span>
                      <span class="font-bold">{{ forecast.humidity }}</span>
                    </div>
                    <div>
                      <span class="block text-[9px] text-stone-400">HUJAN</span>
                      <span class="font-bold">{{ forecast.rainChance }}</span>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <!-- BOTTOM SECTION: PRIORITY BULLETINS & MARITIME -->
          <section class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            
            <!-- Warning Bulletins -->
            <div class="rounded-lg border border-[#E5DFD3] bg-white dark:border-[#2E2A24] dark:bg-[#1A1815]">
              <div class="border-b border-[#E5DFD3] px-5 py-4 dark:border-[#2E2A24]">
                <h2 class="font-bold uppercase tracking-wider">Warning Bulletin</h2>
              </div>
              <div class="divide-y divide-[#E5DFD3] dark:divide-[#2E2A24]">
                <article v-for="bulletin in warningBulletins" :key="bulletin.region" class="flex flex-col gap-4 p-5 sm:flex-row">
                  <div class="shrink-0 pt-1">
                    <div :class="[getStatusDot(bulletin.status), bulletin.status === 'Siaga' ? 'ring-red-500' : 'ring-amber-500']" class="h-3 w-3 rounded-full ring-4 ring-opacity-20 shadow-sm"></div>
                  </div>
                  <div class="flex-1 space-y-2">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                      <h3 class="font-bold">{{ bulletin.region }}</h3>
                      <span :class="getStatusBadge(bulletin.status)" class="rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest">
                        {{ bulletin.status }}
                      </span>
                    </div>
                    <p class="text-sm font-semibold text-stone-700 dark:text-stone-300">{{ bulletin.phenomenon }}</p>
                    <div class="rounded bg-[#F7F5F0] p-3 text-xs dark:bg-[#110F0D]">
                      <span class="mb-1 block font-mono text-[10px] text-stone-500">REKOMENDASI OPERASI</span>
                      <span class="text-stone-700 dark:text-stone-300">{{ bulletin.recommendation }}</span>
                    </div>
                    <p class="font-mono text-[10px] text-stone-500">{{ bulletin.window }}</p>
                  </div>
                </article>
              </div>
            </div>

            <!-- Maritime Advisory -->
            <div class="rounded-lg border border-[#E5DFD3] bg-white dark:border-[#2E2A24] dark:bg-[#1A1815]">
              <div class="border-b border-[#E5DFD3] px-5 py-4 dark:border-[#2E2A24]">
                <h2 class="font-bold uppercase tracking-wider">Marine Advisory</h2>
              </div>
              <div class="divide-y divide-[#E5DFD3] dark:divide-[#2E2A24]">
                <article v-for="item in maritimeBulletins" :key="item.area" class="p-5">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <h3 class="font-bold">{{ item.area }}</h3>
                    <span :class="getStatusBadge(item.status)" class="rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest">
                      {{ item.status }}
                    </span>
                  </div>
                  <p class="mt-2 text-sm text-stone-600 dark:text-stone-400">{{ item.advisory }}</p>
                  
                  <div class="mt-4 flex gap-6 font-mono text-xs">
                    <div>
                      <span class="block text-[10px] text-stone-500">GELOMBANG</span>
                      <span class="font-bold text-stone-800 dark:text-stone-200">{{ item.waveHeight }}</span>
                    </div>
                    <div>
                      <span class="block text-[10px] text-stone-500">ANGIN</span>
                      <span class="font-bold text-stone-800 dark:text-stone-200">{{ item.wind }}</span>
                    </div>
                  </div>
                </article>
              </div>
            </div>

          </section>
        </div>
      </transition>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
