import L, { LatLngTuple } from 'leaflet'

export const DEFAULT_MAP_CENTER: LatLngTuple = [107.4445627, -7.186050842]
export const DEFAULT_MAP_ZOOM = 5
export const MAP_MAX_ZOOM = 16
export const MAP_MIN_ZOOM = 3
export const INDONESIA_BOUNDS = L.latLngBounds(L.latLng(-11.08, 94.9), L.latLng(5.9, 141.05))
export const WORLD_BOUNDS = L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180))
