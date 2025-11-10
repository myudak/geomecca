<script setup lang="ts">
import { Magnitude } from '@src/types/magnitude'
import { Origin } from '@src/types/origin'
import {
  createDashedCircle,
  createEventStationLine,
  createMagnitudeFeature,
  createOpenLayerMap,
  createSelectedEventStationFeatures
} from '@src/utils/ol-map'
import VectorLayer from 'ol/layer/Vector'
import { transform } from 'ol/proj'
import VectorSource from 'ol/source/Vector'
import { onMounted, ref } from 'vue'

const {
  origin,
  magnitude,
  fullHeight = false
} = defineProps<{
  origin: Origin
  magnitude: Magnitude
  fullHeight?: boolean
}>()

const mapRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  const latLng = transform([origin.longitude, origin.latitude], 'EPSG:4326', 'EPSG:3857')
  const feature = createMagnitudeFeature(origin, magnitude)
  feature.setProperties({ event })

  const eventSource = new VectorSource({
    features: [feature]
  })

  const eventLayer = new VectorLayer({
    source: eventSource
  })

  const stationsSource = new VectorSource({
    features: createSelectedEventStationFeatures(origin)
  })

  const linesSource = new VectorSource({
    features: createEventStationLine(origin)
  })

  const stationsLayer = new VectorLayer({
    source: stationsSource
  })

  const linesLayer = new VectorLayer({
    source: linesSource
  })

  const { map } = createOpenLayerMap(mapRef.value!)
  const view = map.getView()

  if (origin.err_epicenter) {
    const circleVector = createDashedCircle(origin.longitude, origin.latitude, origin.err_epicenter)
    map.addLayer(circleVector)
  }

  map.addLayer(linesLayer)
  map.addLayer(eventLayer)
  map.addLayer(stationsLayer)
  map.getControls().clear()
  view.setCenter(latLng)
  view.setMinZoom(6)
  view.setZoom(7)
})
</script>

<template>
  <div
    ref="mapRef"
    class="w-full"
    :class="{
      'h-full': fullHeight,
      'h-[200px]': !fullHeight
    }" />
</template>
