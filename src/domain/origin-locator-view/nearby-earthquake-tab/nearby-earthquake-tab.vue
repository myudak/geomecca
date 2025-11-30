<script setup lang="ts">
import { getAllEventListAPI } from '@src/api-service/event'
import { GetAllEventListQuery } from '@src/api-service/event/types'
import { DateFilter } from '@src/components/date-filter'
import { EarthQuakeEvent } from '@src/types/event'
import { createDashedCircle, createOpenLayerMap } from '@src/utils/ol-map'
import { formatDate, formatDepth, formatLatLon, formatMagnitude } from '@src/utils/string'
import { endOfDay, startOfDay, subWeeks } from 'date-fns'
import { Feature, Map, MapBrowserEvent } from 'ol'
import { Point } from 'ol/geom'
import VectorLayer from 'ol/layer/Vector'
import { fromLonLat } from 'ol/proj'
import VectorSource from 'ol/source/Vector'
import CircleStyle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Style from 'ol/style/Style'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const mapRef = ref<HTMLDivElement | null>(null)
const map = ref<Map | null>(null)
const eventSource = new VectorSource()
const eventLayer = new VectorLayer({
  source: eventSource
})
const searchCircleLayer = ref<VectorLayer<Feature> | null>(null)

const totalEvents = ref(0)
const page = ref(1)
const totalPerPage = ref(1000)
const dateRange = ref({
  start: startOfDay(subWeeks(new Date(), 1)),
  end: endOfDay(new Date())
})
const startDate = computed(() => dateRange.value.start.toISOString())
const endDate = computed(() => dateRange.value.end.toISOString())
const rawEvents = ref<EarthQuakeEvent[]>([])

const latitude = ref('')
const longitude = ref('')
const radius = ref('50')
const filterSettings = ref<{ latitude: number; longitude: number; radius: number } | null>(null)

const params = computed(() => ({
  page: page.value,
  totalPerPage: totalPerPage.value,
  startDate: startDate.value,
  endDate: endDate.value
}))

const fetchEventList = (query: GetAllEventListQuery) => {
  getAllEventListAPI(query).then((response) => {
    rawEvents.value = response.data
    totalEvents.value = response.total ?? response.data.length
    syncEventFeatures()
  })
}

watch(
  params,
  (newParams) => {
    fetchEventList(newParams)
  },
  { immediate: true, deep: true }
)

const filteredEvents = computed(() => {
  if (!filterSettings.value) return rawEvents.value
  const { latitude: lat, longitude: lon, radius: rad } = filterSettings.value
  return rawEvents.value.filter((event) => {
    const evLat = event.origins.latitude
    const evLon = event.origins.longitude
    if (evLat === undefined || evLon === undefined) return false
    return getDistanceKm(lat, lon, evLat, evLon) <= rad
  })
})

const defaultStyle = new Style({
  image: new CircleStyle({
    radius: 7,
    fill: new Fill({ color: 'rgba(14, 148, 190, 0.85)' }),
    stroke: new Stroke({ color: 'rgba(255,255,255,0.9)', width: 2 })
  })
})

const createEventFeature = (event: EarthQuakeEvent) => {
  const feature = new Feature(
    new Point(
      fromLonLat([
        event.origins.longitude ?? 0,
        event.origins.latitude ?? 0
      ])
    )
  )
  feature.set('eventData', event)
  feature.setStyle(defaultStyle)
  return feature
}

const syncEventFeatures = () => {
  eventSource.clear()
  filteredEvents.value.forEach((event) => {
    if (event.origins.latitude === undefined || event.origins.longitude === undefined) return
    eventSource.addFeature(createEventFeature(event))
  })
  zoomToFitEvents()
}

const zoomToFitEvents = () => {
  if (!map.value) return
  const features = eventSource.getFeatures()
  if (features.length === 0) return

  const extent = eventSource.getExtent()
  const view = map.value.getView()

  view.fit(extent, {
    padding: [80, 80, 80, 80],
    maxZoom: 10,
    duration: 600
  })
}

watch(filteredEvents, () => {
  syncEventFeatures()
})

const applyFilter = () => {
  const lat = parseFloat(latitude.value)
  const lon = parseFloat(longitude.value)
  const rad = parseFloat(radius.value)
  if (Number.isFinite(lat) && Number.isFinite(lon) && Number.isFinite(rad) && rad > 0) {
    filterSettings.value = { latitude: lat, longitude: lon, radius: rad }
  } else {
    filterSettings.value = null
  }
  updateSearchCircle()
  syncEventFeatures()
}

const updateSearchCircle = () => {
  if (!map.value) return
  if (searchCircleLayer.value) {
    map.value.removeLayer(searchCircleLayer.value)
    searchCircleLayer.value = null
  }
  if (filterSettings.value) {
    searchCircleLayer.value = createDashedCircle(
      filterSettings.value.longitude,
      filterSettings.value.latitude,
      filterSettings.value.radius
    )
    map.value.addLayer(searchCircleLayer.value)
    map.value
      .getView()
      .animate({
        center: fromLonLat([filterSettings.value.longitude, filterSettings.value.latitude]),
        zoom: 5,
        duration: 600
      })
  }
}

const selectEvent = (event: EarthQuakeEvent) => {
  router.push(`/origin-locator-view/location/${event._id}`)
}

const handleMapClick = (mapEvent: MapBrowserEvent<any>) => {
  if (!map.value) return
  map.value.forEachFeatureAtPixel(mapEvent.pixel, (feature) => {
    const eventData = feature.get('eventData') as EarthQuakeEvent | undefined
    if (eventData) {
      selectEvent(eventData)
      return true
    }
    return false
  })
}

onMounted(() => {
  if (!mapRef.value) return
  const { map: createdMap } = createOpenLayerMap(mapRef.value)
  createdMap.addLayer(eventLayer)
  createdMap.on('click', handleMapClick)
  map.value = createdMap
  syncEventFeatures()
})

onBeforeUnmount(() => {
  if (map.value) {
    map.value.un('click', handleMapClick)
  }
})

const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const toRad = (value: number) => (value * Math.PI) / 180
</script>

<template>
  <div class="flex flex-col gap-6">
    <section
      class="rounded-[32px] border border-brand-surface-light-active bg-brand-surface-light p-6 text-brand-text-light shadow-lg dark:border-brand-surface-dark-hover dark:bg-brand-surface-darker dark:text-brand-text-dark">
      <header class="flex flex-wrap items-center gap-4">
        <div>
          <p class="text-xs uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">Nearby Earthquake</p>
          <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">Regional Search</h2>
        </div>
        <div class="ml-auto">
          <DateFilter v-model:range="dateRange" variant="subtle" />
        </div>
      </header>

      <form
        class="mt-6 grid gap-4 rounded-2xl border border-brand-surface-light-active bg-brand-surface-light-hover p-4 dark:border-brand-surface-dark-hover dark:bg-brand-surface-dark md:grid-cols-[repeat(4,minmax(0,1fr))_auto]"
        @submit.prevent="applyFilter">
        <label class="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
          Latitude
          <div class="flex items-center gap-2 rounded-xl border border-slate-200 bg-black/5 px-3 py-2 dark:border-slate-700 dark:bg-white/5">
            <v-icon name="fa-location-arrow" class="text-slate-400 dark:text-slate-500" />
            <input
              v-model="latitude"
              type="text"
              placeholder="e.g -7.321"
              class="w-full bg-transparent text-base text-slate-700 outline-none dark:text-white" />
          </div>
        </label>
        <label class="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
          Longitude
          <div class="flex items-center gap-2 rounded-xl border border-slate-200 bg-black/5 px-3 py-2 dark:border-slate-700 dark:bg-white/5">
            <v-icon name="fa-compass" class="text-slate-400 dark:text-slate-500" />
            <input
              v-model="longitude"
              type="text"
              placeholder="e.g 107.321"
              class="w-full bg-transparent text-base text-slate-700 outline-none dark:text-white" />
          </div>
        </label>
        <label class="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
          Radius
          <div class="flex items-center gap-2 rounded-xl border border-slate-200 bg-black/5 px-3 py-2 dark:border-slate-700 dark:bg-white/5">
            <v-icon name="fa-pencil" class="text-slate-400 dark:text-slate-500" />
            <input
              v-model="radius"
              type="number"
              min="1"
              placeholder="50"
              class="w-full bg-transparent text-base text-slate-700 outline-none dark:text-white" />
            <span class="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">km</span>
          </div>
        </label>
        <div class="flex items-end">
          <button
            type="submit"
            class="w-full rounded-2xl bg-sky-600 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/30 transition hover:bg-sky-500">
            Apply
          </button>
        </div>
      </form>

      <div class="mt-6 overflow-hidden rounded-[28px] border border-brand-surface-light-active bg-brand-surface-light dark:border-brand-surface-dark-hover dark:bg-brand-surface-darker">
        <div ref="mapRef" class="h-[420px] w-full" />
      </div>
    </section>

    <section
      class="rounded-[32px] border border-brand-surface-light-active bg-brand-surface-light p-6 text-brand-text-light shadow dark:border-brand-surface-dark-hover dark:bg-brand-surface-darker dark:text-brand-text-dark">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">List Event</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Showing {{ filteredEvents.length }} of {{ totalEvents }} events
          </p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              <th class="py-3 pr-6">Time</th>
              <th class="py-3 pr-6">Latitude</th>
              <th class="py-3 pr-6">Longitude</th>
              <th class="py-3 pr-6">Magnitude</th>
              <th class="py-3 pr-6">Depth</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="event in filteredEvents"
              :key="event._id"
              class="border-t border-slate-100 text-sm transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/60"
              @click="selectEvent(event)">
              <td class="py-4 pr-6 font-semibold text-slate-700 dark:text-slate-50">
                {{ formatDate(event.origins.origin_time) }}
              </td>
              <td class="py-4 pr-6 text-slate-500 dark:text-slate-300">{{ formatLatLon(event.origins.latitude) }}</td>
              <td class="py-4 pr-6 text-slate-500 dark:text-slate-300">{{ formatLatLon(event.origins.longitude) }}</td>
              <td class="py-4 pr-6">
                <span class="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {{ formatMagnitude(event.origins.magnitudes?.[0]?.value ?? 0) }}
                </span>
              </td>
              <td class="py-4 pr-6">
                <span class="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {{ formatDepth(event.origins.depth) }}
                </span>
              </td>
            </tr>
            <tr v-if="!filteredEvents.length">
              <td colspan="5" class="py-6 text-center text-sm text-slate-400 dark:text-slate-500">
                No events found for the selected filters.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
