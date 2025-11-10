<script setup lang="ts">
import { StationMagnitude } from '@src/api-service/origin/types'
import { Origin } from '@src/types/origin'
import { createMagnitudeFeature, createOpenLayerMap } from '@src/utils/ol-map'
import VectorLayer from 'ol/layer/Vector'
import { transform } from 'ol/proj'
import VectorSource from 'ol/source/Vector'
import { onMounted, ref } from 'vue'

const { origin, stationMagnitudes } = defineProps<{
  origin: Origin
  stationMagnitudes: StationMagnitude[]
}>()

const mapRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  const latLng = transform([origin.longitude, origin.latitude], 'EPSG:4326', 'EPSG:3857')

  const features = stationMagnitudes.map((magnitude) => createMagnitudeFeature(origin, magnitude))

  const eventSource = new VectorSource({
    features
  })

  const eventLayer = new VectorLayer({
    source: eventSource
  })

  const { map } = createOpenLayerMap(mapRef.value!)
  const view = map.getView()

  // map.addLayer(linesLayer)
  map.addLayer(eventLayer)
  map.getControls().clear()
  view.setCenter(latLng)
  view.setMinZoom(6)
  view.setZoom(7)
})
</script>

<template>
  <div ref="mapRef" class="absolute top-0 left-0 w-full h-full" />
</template>
