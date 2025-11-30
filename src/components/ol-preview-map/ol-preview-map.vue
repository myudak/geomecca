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
  console.log('[OLPreviewMap] Component mounted')
  console.log('[OLPreviewMap] Origin:', origin)
  console.log('[OLPreviewMap] Magnitude:', magnitude)
  console.log('[OLPreviewMap] mapRef:', mapRef.value)

  try {
    const latLng = transform([origin.longitude, origin.latitude], 'EPSG:4326', 'EPSG:3857')
    console.log('[OLPreviewMap] Transformed coordinates:', latLng)

    const feature = createMagnitudeFeature(origin, magnitude)
    console.log('[OLPreviewMap] Feature created:', feature)

    feature.setProperties({ origin, magnitude })

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

    // Calculate extent of all features (event + stations)
    const allFeatures = [
      ...eventSource.getFeatures(),
      ...stationsSource.getFeatures()
    ]

    if (allFeatures.length > 0) {
      const extent = eventSource.getExtent()
      stationsSource.getFeatures().forEach(feature => {
        const featureExtent = feature.getGeometry()?.getExtent()
        if (featureExtent) {
          extent[0] = Math.min(extent[0], featureExtent[0])
          extent[1] = Math.min(extent[1], featureExtent[1])
          extent[2] = Math.max(extent[2], featureExtent[2])
          extent[3] = Math.max(extent[3], featureExtent[3])
        }
      })

      // Fit view to extent with padding
      view.fit(extent, {
        padding: [50, 50, 50, 50],
        maxZoom: 12,
        duration: 0
      })
    } else {
      // Fallback if no stations
      view.setCenter(latLng)
      view.setZoom(7)
    }
    view.setMinZoom(6)

    console.log('[OLPreviewMap] Map initialization complete')
  } catch (error) {
    console.error('[OLPreviewMap] Error during map initialization:', error)
  }
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
