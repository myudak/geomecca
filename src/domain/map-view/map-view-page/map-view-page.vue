<script setup lang="ts">
import { getAllEventListAPI } from '@src/api-service/event'
import { GetAllEventListQuery } from '@src/api-service/event/types'
import { DateFilter } from '@src/components/date-filter'
import { OLMap } from '@src/components/ol-map'
import { DepthMagnitudeInfo } from '@src/domain/eq-view/depth-magnitude-info'
import { EventDetailDrawer } from '@src/domain/eq-view/event-detail-info'
import { EventListDrawer } from '@src/domain/eq-view/event-list-drawer'
import { SelectedStationClusterDrawer } from '@src/domain/station-view/selected-station-cluster-drawer'
import { SelectedStationDrawer } from '@src/domain/station-view/selected-station-drawer'
import useGetStationList from '@src/hooks/use-get-station-list'
import usePickingSocket from '@src/hooks/use-picking-socket'
import { EarthQuakeEvent } from '@src/types/event'
import { Station } from '@src/types/station'
import { WebsocketPickingResponse } from '@src/types/waveform'
import {
  createDashedCircle,
  createEventStationLine,
  createMagnitudeFeature,
  createSelectedEventStationFeatures,
  createStationCluster
} from '@src/utils/ol-map'
import { useToggle } from '@vueuse/core'
import { addSeconds, endOfDay, isAfter, startOfDay, subWeeks } from 'date-fns'
import { Feature, Map, MapBrowserEvent } from 'ol'
import { FeatureLike } from 'ol/Feature'
import { Circle, Geometry, LineString, Point } from 'ol/geom'
import VectorLayer from 'ol/layer/Vector'
import { fromLonLat } from 'ol/proj'
import { Cluster } from 'ol/source'
import VectorSource from 'ol/source/Vector'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import { MapControls } from '../map-controls'

// Map and layers
const map = ref<Map | null>(null)
const eventSource = new VectorSource()
const eventLayer = new VectorLayer({ source: eventSource })
const clusterLayer = ref<VectorLayer<Feature<Geometry>> | null>(null)
const clusterSource = ref<Cluster<Feature<Point>> | null>(null)

// Event state
const totalPerPage = ref(1000)
const totalEvents = ref(0)
const page = ref(1)
const dateRange = ref({
  start: startOfDay(subWeeks(new Date(), 1)),
  end: endOfDay(new Date())
})
const startDate = computed(() => dateRange.value.start.toISOString())
const endDate = computed(() => dateRange.value.end.toISOString())
const selectedEvent = ref<EarthQuakeEvent | null>(null)
const eventData = ref<EarthQuakeEvent[]>([])
const selectedStationsLayer = ref<VectorLayer<Feature<Point>>>()
const selectedLineLayer = ref<VectorLayer<Feature<LineString>>>()
const circleVector = ref<VectorLayer<Feature<Circle>>>()
const latestEvent = ref<EarthQuakeEvent | null>(null)

// Station state
const selectedStation = ref<Station | null>(null)
const selectedStations = ref<Station[] | null>(null)
const pickStations = ref<Record<string, Date>>({})
const interval = ref<number | null>(null)
const blinkState: Record<string, number> = {}

// UI toggles
const [isSettingOpen, toggleSettingOpen] = useToggle()
const [isListOpen, toggleListOpen] = useToggle()

// Hooks
usePickingSocket((newPick) => handleNewPick(newPick))
const { refetch: fetchStations } = useGetStationList()

// Event functions
const fetchEventList = (newParams: GetAllEventListQuery) => {
  closeEventDetailDrawer()
  getAllEventListAPI(newParams).then((response) => {
    eventData.value = response.data
    totalEvents.value = response.total

    if (!latestEvent.value && response.data[0]) {
      latestEvent.value = response.data[0]
    }
  })
}

const params = computed(() => ({
  page: page.value,
  totalPerPage: totalPerPage.value,
  startDate: startDate.value,
  endDate: endDate.value
}))

const eventList = computed(() => eventData.value ?? [])
const totalPage = computed(() => Math.ceil(totalEvents.value / totalPerPage.value))

const closeEventDetailDrawer = () => {
  selectedEvent.value = null

  if (selectedStationsLayer.value && map.value) {
    map.value.removeLayer(selectedStationsLayer.value)
  }
  if (selectedLineLayer.value && map.value) {
    map.value.removeLayer(selectedLineLayer.value)
  }
  if (circleVector.value && map.value) {
    map.value.removeLayer(circleVector.value)
  }
}

const onNewEvent = () => {
  const newStartDate = startOfDay(subWeeks(new Date(), 1))
  const newEndDate = endOfDay(new Date())
  const newPage = 1

  dateRange.value = {
    start: newStartDate,
    end: newEndDate
  }
  page.value = newPage
  latestEvent.value = null

  fetchEventList({
    page: newPage,
    totalPerPage: totalPerPage.value,
    startDate: newStartDate.toISOString(),
    endDate: newEndDate.toISOString()
  })
}

const renderSelectedEventStations = (event: EarthQuakeEvent) => {
  if (!map.value) return

  const eventCoordinates = fromLonLat([event.origins.longitude, event.origins.latitude])

  const stationFeatures = createSelectedEventStationFeatures(event.origins)
  const stationsLayer = new VectorLayer({
    source: new VectorSource({ features: stationFeatures })
  })

  const lines = createEventStationLine(event.origins)
  const lineLayer = new VectorLayer({
    source: new VectorSource({ features: lines })
  })

  const dashedCircle = createDashedCircle(eventCoordinates, 100_000)
  const vector = new VectorLayer({
    source: new VectorSource({ features: [dashedCircle] })
  })

  map.value.addLayer(lineLayer)
  map.value.addLayer(stationsLayer)
  map.value.addLayer(vector)

  selectedStationsLayer.value = stationsLayer
  selectedLineLayer.value = lineLayer
  circleVector.value = vector
}

const animateToEvent = (event: EarthQuakeEvent) => {
  if (!map.value) return

  map.value.getView().animate({
    center: fromLonLat([event.origins.longitude, event.origins.latitude]),
    zoom: 9,
    duration: 1000
  })
}

const selectEvent = (event: EarthQuakeEvent) => {
  closeEventDetailDrawer()

  setTimeout(() => {
    selectedEvent.value = event
    animateToEvent(event)
    renderSelectedEventStations(event)
  }, 100)
}

// Station functions
const closeSelectedStationDrawer = () => {
  selectedStation.value = null
}

const closeSelectedStationClusterDrawer = () => {
  selectedStations.value = null
}

const onSelectStation = (station: Station) => {
  selectedStation.value = station
}

const onSelectCluster = (stations: Station[]) => {
  selectedStations.value = stations
}

const renderStations = async (mapCanvas: Map) => {
  const { data } = await fetchStations()
  const stations = data?.data ?? []

  const createdCluster = createStationCluster(stations)
  mapCanvas.addLayer(createdCluster.clusters)

  clusterLayer.value = createdCluster.clusters
  clusterSource.value = createdCluster.clusterSource
}

const getFeatureByStationName = (fullStationName: string): Feature<Point> | null => {
  if (!clusterSource.value) return null

  const features = clusterSource.value.getSource().getFeatures()

  for (const feature of features) {
    const stationName = feature.get('station_name') as string | undefined
    if (stationName === fullStationName) {
      return feature as Feature<Point>
    }
  }

  return null
}

const addBlinkToFeature = (fullStationName: string, feature: Feature<Point>) => {
  if (blinkState[fullStationName]) {
    clearInterval(blinkState[fullStationName])
  }

  let isYellow = false

  const intervalId = setInterval(() => {
    const currentStyle = feature.getStyle()
    if (currentStyle && typeof currentStyle === 'function') {
      return
    }

    isYellow = !isYellow
    feature.set('blink', isYellow)
    feature.changed()
  }, 500)

  blinkState[fullStationName] = intervalId
}

const removeBlinkFromFeature = (fullStationName: string, feature: Feature<Point>) => {
  if (blinkState[fullStationName]) {
    clearInterval(blinkState[fullStationName])
    delete blinkState[fullStationName]
  }

  feature.set('blink', false)
  feature.changed()
}

const handleNewPick = ({ station, network }: WebsocketPickingResponse) => {
  const fullStationName = `${network}-${station}`

  pickStations.value = {
    ...pickStations.value,
    [fullStationName]: addSeconds(new Date(), 30)
  }

  const feature = getFeatureByStationName(fullStationName)

  if (feature) {
    addBlinkToFeature(fullStationName, feature)
  }
}

const checkPickExpiration = () => {
  let hasDeletedPick = false
  const newPicksStations = { ...pickStations.value }
  for (const stationName of Object.keys(newPicksStations)) {
    if (isAfter(new Date(), newPicksStations[stationName])) {
      delete newPicksStations[stationName]
      const feature = getFeatureByStationName(stationName)
      if (feature) {
        removeBlinkFromFeature(stationName, feature)
      }
      hasDeletedPick = true
    }
  }

  if (hasDeletedPick) {
    pickStations.value = newPicksStations
  }
}

// Map event handlers
const onMapCreated = (mapCanvas: Map) => {
  map.value = mapCanvas
  mapCanvas.addLayer(eventLayer)
  renderStations(mapCanvas)
}

// Watch for event updates and render them on the map
watch([map, eventList], ([newMap, newEventList], [, oldEventList]) => {
  if (!newMap) return

  eventSource.clear(true)

  if (newEventList !== oldEventList) {
    const filteredEvents = newEventList.filter((event) =>
      event.origins.magnitudes.some((info) => info.type.toLowerCase() === 'mw')
    )
    filteredEvents.forEach((event) => {
      const magnitude = event.origins.magnitudes.find((info) => info.type.toLowerCase() === 'mw')
      if (magnitude) {
        const feature = createMagnitudeFeature(event.origins, magnitude)
        feature.setProperties({ event })
        eventSource.addFeature(feature)
      }
    })
  }
})

const onMapClick = (event: MapBrowserEvent<any>) => {
  // Check for event clicks
  eventLayer.getFeatures(event.pixel).then((clickedFeatures) => {
    if (clickedFeatures.length) {
      const earthquakeEvent = clickedFeatures[0].get('event') as EarthQuakeEvent | undefined
      if (earthquakeEvent) {
        selectEvent(earthquakeEvent)
        return
      }
    }
  })

  // Check for station clicks
  if (!clusterLayer.value) return

  const clusters = clusterLayer.value

  clusters.getFeatures(event.pixel).then((clickedFeatures) => {
    if (!clickedFeatures.length) return

    const features = clickedFeatures[0].get('features') as FeatureLike[]
    const stations = features.map((feature) => feature.getProperties()?.station as Station | undefined)
    const isStationMarkers = stations.every((station) => !!station)

    if (!isStationMarkers) return
    if (!stations.length) return

    if (stations.length > 1) {
      setTimeout(() => {
        onSelectCluster(stations)
      }, 100)
    } else {
      onSelectStation(stations[0])
    }
  })
}

// Lifecycle
onMounted(() => {
  interval.value = setInterval(() => {
    checkPickExpiration()
  }, 10_000)
})

onUnmounted(() => {
  if (interval.value) {
    clearInterval(interval.value)
  }
})

watch(
  params,
  (newParams, oldParams) => {
    if (oldParams) {
      if (oldParams?.startDate !== newParams.startDate || oldParams?.endDate !== newParams.endDate) {
        page.value = 1
        fetchEventList({
          ...newParams,
          page: 1
        })
      } else {
        fetchEventList(newParams)
      }
    } else {
      fetchEventList(newParams)
    }
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <div class="w-full h-full relative">
    <!-- Map -->
    <OLMap
      :is-settings-open="isSettingOpen"
      @close-settings="toggleSettingOpen"
      @new-event="onNewEvent()"
      @map-created="onMapCreated"
      @map-click="onMapClick" />

    <!-- Date Filter (Top Right) -->
    <div class="absolute top-4 right-4 z-[999] max-md:left-0 max-md:right-0">
      <DateFilter v-model:range="dateRange" class="max-md:text-center" />
    </div>

    <!-- Map Controls (Bottom Left) -->
    <div class="absolute bottom-4 left-4 z-[999]">
      <MapControls @toggle-events="toggleListOpen()" @toggle-settings="toggleSettingOpen" />
    </div>

    <!-- Latest Event Box (Top Right) -->
    <!-- <div v-if="!!latestEvent" class="absolute right-4 top-20 z-[999]">
      <LatestEventBox :event="latestEvent" @click="selectEvent(latestEvent)" />
    </div> -->

    <!-- Depth/Magnitude Legend (Bottom Right) -->
    <div class="absolute right-4 bottom-4 z-[999]">
      <DepthMagnitudeInfo />
    </div>

    <!-- Event List Drawer -->
    <EventListDrawer
      v-if="isListOpen"
      v-model:start-date="startDate"
      v-model:end-date="endDate"
      :events="eventList"
      :total-page="totalPage"
      :page="page"
      @change-page="(newPage) => (page = newPage)"
      @close="toggleListOpen()">
      <DateFilter v-model:range="dateRange" />
    </EventListDrawer>

    <!-- Event Detail Drawer -->
    <div v-if="!!selectedEvent" class="relative z-[9999]">
      <EventDetailDrawer :event="selectedEvent" @close="closeEventDetailDrawer" />
    </div>

    <!-- Station Drawers -->
    <SelectedStationDrawer v-if="selectedStation" :station="selectedStation" @close="closeSelectedStationDrawer" />

    <SelectedStationClusterDrawer
      v-if="selectedStations"
      :stations="selectedStations"
      @select-channel="onSelectStation"
      @close="closeSelectedStationClusterDrawer" />
  </div>
</template>
