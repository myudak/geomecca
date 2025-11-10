<script setup lang="ts">
import { Origin } from '@src/types/origin'
import { createDashedCircle, createMagnitudeFeature, createOpenLayerMap } from '@src/utils/ol-map'
import { getDefaultMagnitude } from '@src/utils/string'
import { Feature, Map } from 'ol'
import { Circle, Point } from 'ol/geom'
import VectorLayer from 'ol/layer/Vector'
import { transform } from 'ol/proj'
import VectorSource from 'ol/source/Vector'
import { ref, watch } from 'vue'

const props = defineProps<{
  selectedOrigin: Origin
  otherOrigins: Origin[]
}>()

type CircleVectorLayer = VectorLayer<Feature<Circle>>
type PointVectorLayer = VectorLayer<Feature<Point>>

const mapRef = ref<HTMLDivElement | null>(null)
const olMap = ref<Map | null>(null)
const eventLayer = ref<PointVectorLayer | null>(null)
const circleVector = ref<CircleVectorLayer | null>(null)

const renderOriginMap = (newSelectedOrigin: Origin, newOtherOrigins: Origin[], newMapRef: HTMLDivElement) => {
  const originLon = newSelectedOrigin.longitude
  const originLat = newSelectedOrigin.latitude
  const centerLatLng = transform([originLon, originLat], 'EPSG:4326', 'EPSG:3857')

  const features = newOtherOrigins
    .map((origin) => {
      const magnitude = getDefaultMagnitude(origin.magnitudes ?? [])
      if (!magnitude) return null
      const feature = createMagnitudeFeature(origin, magnitude)
      return feature
    })
    .filter((feature) => !!feature)

  const selectedOriginMagnitude = getDefaultMagnitude(newSelectedOrigin.magnitudes ?? [])
  if (selectedOriginMagnitude) {
    const selectedOriginFeature = createMagnitudeFeature(newSelectedOrigin, selectedOriginMagnitude, true)
    features.push(selectedOriginFeature)
  }

  const eventSource = new VectorSource({
    features
  })

  if (olMap.value) {
    if (eventLayer.value) {
      olMap.value.removeLayer(eventLayer.value as PointVectorLayer)
    }
    if (circleVector.value) {
      olMap.value.removeLayer(circleVector.value as CircleVectorLayer)
    }
  }

  if (newSelectedOrigin.err_epicenter) {
    circleVector.value = createDashedCircle(originLon, originLat, newSelectedOrigin.err_epicenter)
  }

  eventLayer.value = new VectorLayer({
    source: eventSource
  })

  if (!olMap.value) {
    const { map } = createOpenLayerMap(newMapRef)
    olMap.value = map
  }

  const view = olMap.value.getView()
  olMap.value.addLayer(eventLayer.value as PointVectorLayer)
  if (circleVector.value) {
    olMap.value.addLayer(circleVector.value as CircleVectorLayer)
  }
  olMap.value.getControls().clear()
  view.setCenter(centerLatLng)
  view.setZoom(10)
}

watch(
  [() => props.selectedOrigin, () => props.otherOrigins, mapRef],
  ([newSelectedOrigin, newOtherOrigins, newMapRef]) => {
    if (newMapRef) {
      renderOriginMap(newSelectedOrigin, newOtherOrigins, newMapRef)
    }
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <div ref="mapRef" class="w-full h-full" />
</template>
