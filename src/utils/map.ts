import { Magnitude } from '@src/types/magnitude'
import { Station } from '@src/types/station'
import { WSEvent } from '@src/types/ws-event'
import L, { LatLngTuple } from 'leaflet'

import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, MAP_MAX_ZOOM, MAP_MIN_ZOOM, WORLD_BOUNDS } from '../constants/map'
import { hexToRGB } from './color'
import { getDepthColor, getMagnitudeWidth } from './event'

const renderer = L.canvas()
const pulseIcon = L.icon({ iconUrl: '/images/pulse.webp', iconSize: [14, 14] })

export const createMapCanvas = (id: string, options?: L.MapOptions) => {
  const createdMap = L.map(id, {
    renderer,
    attributionControl: false,
    zoomControl: false,
    markerZoomAnimation: false,
    maxBoundsViscosity: 1.0,
    doubleClickZoom: false,
    minZoom: MAP_MIN_ZOOM,
    maxZoom: MAP_MAX_ZOOM,
    maxBounds: WORLD_BOUNDS,
    preferCanvas: true,
    layers: [
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}')
    ],
    ...options
  })

  createdMap.setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM)

  return createdMap
}

export const generateStationIcon = (code: string, hasPick: boolean) => {
  return L.divIcon({
    className: '', // remove default leaflet-icon styles
    iconSize: [29, 40],
    iconAnchor: [14.5, 26], // center X, tip of triangle Y
    html: `
      <div class="station-icon-wrapper ${hasPick ? 'station-icon-with-pick' : ''}">
        <div class="station-icon-triangle"></div>
        <div class="station-icon-label">
          <span class="station-name">${code}</span>
        </div>
      </div>
    `
  })
}


export const createStationMarker = (station: Station, hasPick: boolean) => {
  const lat = Number(station.latitude)
  const lng = Number(station.longitude)

  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    return null
  }

  const marker = L.marker([Number(station.latitude), Number(station.longitude)], {
    icon: generateStationIcon(station.code, hasPick),
    station
  })

  return marker
}

export const createEventMarker = (origin: Pick<WSEvent['preferred_origin'], 'latitude' | 'longitude'>) => {
  const latLng: LatLngTuple = [origin.latitude, origin.longitude]
  const marker = L.marker(latLng, {
    icon: pulseIcon
  })
  return marker
}

export const createMagnitudeMarker = (origin: WSEvent['preferred_origin'], magnitude: Magnitude) => {
  const latLng: LatLngTuple = [origin.latitude, origin.longitude]
  const width = getMagnitudeWidth(magnitude.value)
  const color = getDepthColor(origin.depth)
  const marker = L.marker(latLng, {
    icon: L.divIcon({
      iconSize: [width, width],
      html: `<div style="background-color: ${hexToRGB(color, 0.5)}; width: ${width}px; height: ${width}px; border-radius: 100%; border: 1px solid ${color};"></div>`
    })
  })
  return marker
}

export const createClusterIcon = (count: number, hasPick: boolean) => {
  return L.divIcon({
    iconSize: [26, 30],
    html: `<div class="station-icon ${hasPick ? 'station-icon-with-pick' : ''}"><div>${count}</div></div>`
  })
}
