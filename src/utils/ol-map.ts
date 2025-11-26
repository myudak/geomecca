import { DEFAULT_MAP_ZOOM, MAP_MAX_ZOOM, MAP_MIN_ZOOM } from '@src/constants/map'
import plateBoundariesJson from '@src/geo-json/plate-boundaries.json'
import pusgenBandaJson from '@src/geo-json/pusgen-banda.json'
import pusgenJavaJson from '@src/geo-json/pusgen-java.json'
import pusgenKalimantanJson from '@src/geo-json/pusgen-kalimantan.json'
import pusgenMalukuJson from '@src/geo-json/pusgen-maluku.json'
import pusgenSulawesiJson from '@src/geo-json/pusgen-sulawesi.json'
import pusgenSumJson from '@src/geo-json/pusgen-sum.json'
import reservoirJson from '@src/geo-json/reservoir_merged.json'
import sesarJson from '@src/geo-json/Sesar1.json'
import trenchJson from '@src/geo-json/trench.json'
import volcanoesJson from '@src/geo-json/volcanoes.json'
import { Magnitude } from '@src/types/magnitude'
import { Origin } from '@src/types/origin'
import { Station } from '@src/types/station'
import { WSEvent } from '@src/types/ws-event'
import { Feature, Graticule, Map, MapBrowserEvent, View } from 'ol'
import { OverviewMap } from 'ol/control'
import { Coordinate } from 'ol/coordinate'
import { easeOut } from 'ol/easing'
import { FeatureLike } from 'ol/Feature'
import GeoJSON from 'ol/format/GeoJSON'
import { Circle as CircleGeometry, Geometry, LineString, Point } from 'ol/geom'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import { unByKey } from 'ol/Observable'
import { fromLonLat, transform } from 'ol/proj'
import { getVectorContext } from 'ol/render'
import RenderEvent from 'ol/render/Event'
import { Cluster, XYZ } from 'ol/source'
import VectorSource from 'ol/source/Vector'
import CircleStyle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import RegularShape from 'ol/style/RegularShape'
import Stroke from 'ol/style/Stroke'
import Style, { StyleFunction } from 'ol/style/Style'
import Text from 'ol/style/Text'

import { hexToRGB } from './color'
import { getDepthColor, getMagnitudeWidth } from './event'

const BASE_LAYER =
  'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
const HILL_SHADE_LAYER =
  'https://services.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}'
// const BASE_LAYER =
//   'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}'
// const LABEL_LAYER =
//   'https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}'
const ALL_PUSGEN_JSON = [
  pusgenBandaJson,
  pusgenJavaJson,
  pusgenKalimantanJson,
  pusgenMalukuJson,
  pusgenSulawesiJson,
  pusgenSumJson
]

const styles = {
  Volcano: new Style({
    image: new RegularShape({
      points: 3,
      radius: 5,
      fill: new Fill({ color: 'red' }),
      stroke: new Stroke({
        color: 'red',
        width: 1
      }),
      rotation: 0,
      angle: 0
    })
  }),

  TrenchLine: new Style({
    stroke: new Stroke({
      color: 'blue',
      width: 3
    })
  }),

  PlateLine: new Style({
    stroke: new Stroke({
      color: 'green',
      width: 2
    })
  }),

  FaultLine: new Style({
    stroke: new Stroke({
      color: '#c67b00',
      width: 2,
      lineDash: [8, 6]
    })
  }),

  ReservoirLine: new Style({
    stroke: new Stroke({
      color: '#0ea5e9',
      width: 2
    })
  }),

  PusgenLine: new Style({
    stroke: new Stroke({
      color: 'red',
      width: 1
    })
  }),

  Station: new Style({
    image: new RegularShape({
      fill: new Fill({ color: 'green' }),
      points: 6,
      radius: 5,
      stroke: new Stroke({
        color: 'green',
        width: 1
      }),
      rotation: 0,
      angle: 0
    })
  })
}

const UTM_ZONE = 48
const isNorthernHemisphere = false

const utmToLonLat = (easting: number, northing: number): [number, number] => {
  const a = 6378137.0
  const e = 0.081819191
  const e1sq = 0.006739497
  const k0 = 0.9996

  const x = easting - 500_000.0
  let y = northing

  if (!isNorthernHemisphere) {
    y -= 10_000_000.0
  }

  const m = y / k0
  const mu =
    m / (a * (1 - Math.pow(e, 2) / 4 - (3 * Math.pow(e, 4)) / 64 - (5 * Math.pow(e, 6)) / 256))

  const e1 = (1 - Math.sqrt(1 - Math.pow(e, 2))) / (1 + Math.sqrt(1 - Math.pow(e, 2)))

  const j1 = (3 * e1) / 2 - (27 * Math.pow(e1, 3)) / 32
  const j2 = (21 * Math.pow(e1, 2)) / 16 - (55 * Math.pow(e1, 4)) / 32
  const j3 = (151 * Math.pow(e1, 3)) / 96
  const j4 = (1097 * Math.pow(e1, 4)) / 512

  const fp =
    mu +
    j1 * Math.sin(2 * mu) +
    j2 * Math.sin(4 * mu) +
    j3 * Math.sin(6 * mu) +
    j4 * Math.sin(8 * mu)

  const c1 = e1sq * Math.pow(Math.cos(fp), 2)
  const t1 = Math.pow(Math.tan(fp), 2)
  const r1 =
    (a * (1 - Math.pow(e, 2))) / Math.pow(1 - Math.pow(e, 2) * Math.pow(Math.sin(fp), 2), 1.5)
  const n1 = a / Math.sqrt(1 - Math.pow(e, 2) * Math.pow(Math.sin(fp), 2))
  const d = x / (n1 * k0)

  const q1 = (n1 * Math.tan(fp)) / r1
  const q2 = (Math.pow(d, 2) / 2)
  const q3 = ((5 + 3 * t1 + 10 * c1 - 4 * Math.pow(c1, 2) - 9 * e1sq) * Math.pow(d, 4)) / 24
  const q4 =
    ((61 + 90 * t1 + 298 * c1 + 45 * Math.pow(t1, 2) - 252 * e1sq - 3 * Math.pow(c1, 2)) *
      Math.pow(d, 6)) /
    720

  const lat = fp - q1 * (q2 - q3 + q4)

  const q5 = d
  const q6 = ((1 + 2 * t1 + c1) * Math.pow(d, 3)) / 6
  const q7 =
    ((5 - 2 * c1 + 28 * t1 - 3 * Math.pow(c1, 2) + 8 * e1sq + 24 * Math.pow(t1, 2)) *
      Math.pow(d, 5)) /
    120
  const lon =
    ((UTM_ZONE - 1) * 6 - 180 + 3) * (Math.PI / 180) + (q5 - q6 + q7) / Math.cos(fp)

  return [lon * (180 / Math.PI), lat * (180 / Math.PI)]
}

const convertSesarCoordinatesToLonLat = (geometry: any) => {
  if (!geometry || !geometry.coordinates) return geometry

  if (geometry.type === 'LineString') {
    return geometry.coordinates.map(([x, y]: [number, number]) => utmToLonLat(x, y))
  }

  if (geometry.type === 'MultiLineString') {
    return geometry.coordinates.map((line: [number, number][]) =>
      line.map(([x, y]) => utmToLonLat(x, y))
    )
  }

  return geometry.coordinates
}

const getSesarGeoJSON = () => {
  return {
    ...sesarJson,
    features: sesarJson.features.map((feature) => ({
      ...feature,
      geometry: feature.geometry
        ? {
            ...feature.geometry,
            coordinates: convertSesarCoordinatesToLonLat(feature.geometry)
          }
        : feature.geometry
    }))
  }
}

export const createStationIcon = (text: string, hasPick = false) => {
  const baseColor = '#14AE5C'
  const strokeColor = hasPick ? '#E0C300' : baseColor

  return new Style({
    // Draw a downward-facing triangle to match the Leaflet marker shape.
    image: new RegularShape({
      points: 3,
      radius: 16,
      fill: new Fill({ color: baseColor }),
      stroke: new Stroke({
        color: strokeColor,
        width: 3
      }),
      rotation: Math.PI, // point down
      angle: 0
    }),
    text: new Text({
      text,
      offsetY: 18, // place label under the triangle
      backgroundFill: new Fill({ color: '#ffffff' }),
      backgroundStroke: new Stroke({ color: strokeColor, width: 2 }),
      padding: [2, 8, 2, 8],
      fill: new Fill({
        color: baseColor
      })
    })
  })
}

export const createVolcanoLayers = () => {
  const vectorSource = new VectorSource({
    features: new GeoJSON().readFeatures(volcanoesJson, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    })
  })

  const volcanoesStyleFunction: StyleFunction = (feature) => {
    const type = feature.getGeometry()?.getType()
    return type === 'Point' ? styles.Volcano : undefined
  }

  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: volcanoesStyleFunction
  })

  return vectorLayer
}

export const createPlateBoundariesLayers = () => {
  const vectorSource = new VectorSource({
    features: new GeoJSON().readFeatures(plateBoundariesJson, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    })
  })

  const styleFunction: StyleFunction = (feature) => {
    const type = feature.getGeometry()?.getType()
    return type === 'LineString' ? styles.PlateLine : undefined
  }

  const vectorLayer = new VectorLayer({
    source: vectorSource,
    visible: false,
    style: styleFunction
  })

  return vectorLayer
}

export const createTrenchLayers = () => {
  const vectorSource = new VectorSource({
    features: new GeoJSON().readFeatures(trenchJson, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    })
  })

  const styleFunction: StyleFunction = (feature) => {
    const type = feature.getGeometry()?.getType()
    return type === 'LineString' ? styles.TrenchLine : undefined
  }

  const vectorLayer = new VectorLayer({
    source: vectorSource,
    visible: false,
    style: styleFunction
  })

  return vectorLayer
}

export const createPusgenLayers = () => {
  return ALL_PUSGEN_JSON.map((pusgenJSON) => {
    const vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(pusgenJSON, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })
    })

    const styleFunction: StyleFunction = (feature) => {
      const type = feature.getGeometry()?.getType()
      return type === 'LineString' ? styles.PusgenLine : undefined
    }

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      visible: false,
      style: styleFunction
    })

    return vectorLayer
  })
}

export const createFaultLayer = () => {
  const sesarGeoJSON = getSesarGeoJSON()
  const vectorSource = new VectorSource({
    features: new GeoJSON().readFeatures(sesarGeoJSON, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    })
  })

  const styleFunction: StyleFunction = (feature) => {
    const type = feature.getGeometry()?.getType()
    return type === 'LineString' || type === 'MultiLineString' ? styles.FaultLine : undefined
  }

  const vectorLayer = new VectorLayer({
    source: vectorSource,
    visible: false,
    style: styleFunction
  })

  return vectorLayer
}

export const createReservoirLayer = () => {
  const vectorSource = new VectorSource({
    features: new GeoJSON().readFeatures(reservoirJson, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    })
  })

  const styleFunction: StyleFunction = (feature) => {
    const type = feature.getGeometry()?.getType()
    return type === 'LineString' || type === 'MultiLineString' ? styles.ReservoirLine : undefined
  }

  const vectorLayer = new VectorLayer({
    source: vectorSource,
    visible: false,
    style: styleFunction
  })

  return vectorLayer
}

export const createEventMarker = (event: WSEvent) => {
  const origin = event.preferred_origin
  const feature = new Feature(new Point(transform([origin.longitude, origin.latitude], 'EPSG:4326', 'EPSG:3857')))

  feature.setStyle(
    new Style({
      image: new CircleStyle({
        radius: 6,
        stroke: new Stroke({ color: 'red', width: 1 }),
        fill: new Fill({ color: 'rgb(255, 0, 0, 0.5)' })
      })
    })
  )

  feature.setId(event._id)

  return feature
}

export const createStationCluster = (stations: Station[]) => {
  const features = stations.map((station) => {
    const stationName = `${station.network}-${station.code}`
    const feature = new Feature(new Point(transform([station.longitude, station.latitude], 'EPSG:4326', 'EPSG:3857')))
    feature.setProperties({ station, station_name: stationName })
    feature.setId(stationName)
    return feature
  })

  const source = new VectorSource({
    features: features
  })

  const clusterSource = new Cluster({
    distance: 60,
    minDistance: 40,
    source: source
  })

  const styleCache: Record<string, Style> = {}

  const clusters = new VectorLayer({
    source: clusterSource,
    style: function (feature) {
      const childFeatures = feature.get('features') as FeatureLike[]
      const hasPick = childFeatures.some((childFeature) => childFeature.getProperties()?.hasPick ?? false)
      const size = childFeatures.length
      const station = size === 1 ? (childFeatures[0]?.getProperties()?.station as Station) : undefined
      const text = station?.code ?? size.toString()
      const key = `${text}-${hasPick}`

      if (styleCache[key]) {
        return styleCache[key]
      }

      const style = createStationIcon(text, hasPick)

      styleCache[key] = style
      return style
    }
  })

  return { clusters, clusterSource }
}

export const createSelectedEventStationFeatures = (origin: Origin) => {
  const features = origin.arrivals.map((arrival) => {
    const station = arrival.station_details
    const latLng = transform([station.longitude, station.latitude], 'EPSG:4326', 'EPSG:3857')
    const feature = new Feature(new Point(latLng))

    feature.setStyle(createStationIcon(station.code))
    return feature
  })
  return features
}

export const createEventStationLine = (origin: Origin) => {
  const eventLatLng = transform([origin.longitude, origin.latitude], 'EPSG:4326', 'EPSG:3857')
  const features = origin.arrivals.map((arrival) => {
    const station = arrival.station_details
    const latLng = transform([station.longitude, station.latitude], 'EPSG:4326', 'EPSG:3857')
    const coordinates = [eventLatLng, latLng]
    const feature = new Feature(new LineString(coordinates))
    return feature
  })
  return features
}

export const createMagnitudeFeature = (origin: Origin, magnitude: Magnitude, blackColor?: boolean) => {
  const latLng = transform([origin.longitude, origin.latitude], 'EPSG:4326', 'EPSG:3857')
  const width = getMagnitudeWidth(magnitude.value)
  const color = blackColor ? '#000000' : getDepthColor(origin.depth)
  const feature = new Feature(new Point(latLng))

  feature.setStyle(
    new Style({
      image: new CircleStyle({
        radius: width / 2,
        stroke: new Stroke({ color, width: 1 }),
        fill: new Fill({ color: hexToRGB(color, 0.5) })
      })
    })
  )

  return feature
}

const mapOnPointerMove = (event: MapBrowserEvent<any>, map: Map) => {
  const pixel = map.getEventPixel(event.originalEvent)
  const hit = map.hasFeatureAtPixel(pixel)
  map.getViewport().style.cursor = hit ? 'pointer' : ''
}

export const createOpenLayerMap = (target: HTMLDivElement) => {
  const tileLayer = new TileLayer({
    source: new XYZ({ url: BASE_LAYER }),
    zIndex: 0
  })
  const hillshadeLayer = new TileLayer({
    source: new XYZ({ url: HILL_SHADE_LAYER }),
    opacity: 0.35,
    zIndex: 1
  })
  // const labeLayer = new TileLayer({ source: new XYZ({ url: LABEL_LAYER }) })
  const graticuleLayer = new Graticule({
    strokeStyle: new Stroke({
      color: 'rgba(255, 255, 255, 0.4)',
      width: 2,
      lineDash: [0.5, 4]
    }),
    showLabels: true
  })

  const overviewMapControl = new OverviewMap({
    collapsed: false,
    collapsible: false,
    className: 'ol-overviewmap ol-custom-overviewmap top-1 left-1 bg-transparent',
    layers: [
      new TileLayer({
        source: new XYZ({ url: BASE_LAYER }),
        zIndex: 0
      }),
      new TileLayer({
        source: new XYZ({ url: HILL_SHADE_LAYER }),
        opacity: 0.35,
        zIndex: 1
      })
    ]
  })

  // Layer order keeps base darkest, hillshade adding relief, then overlays like graticule.
  const layers = [tileLayer, hillshadeLayer /*labeLayer*/, graticuleLayer]
  const defaultView = new View({
    center: fromLonLat([118.0149, -2.5489]),
    zoom: DEFAULT_MAP_ZOOM,
    maxZoom: MAP_MAX_ZOOM,
    minZoom: MAP_MIN_ZOOM,
    enableRotation: false
  })

  const map = new Map({
    target,
    layers,
    view: defaultView,
    controls: [overviewMapControl]
  })

  // map.getControls().clear()
  map.on('pointermove', (event) => mapOnPointerMove(event, map))

  return { tileLayer, hillshadeLayer, map }
}

export const flashEventMarker = (feature: Feature<Geometry>, tileLayer: TileLayer<XYZ>, map: Map) => {
  const start = Date.now()
  const duration = 20_000
  const flashGeom = feature.getGeometry()?.clone()

  const listenerKey = tileLayer.on('postrender', animate)

  function animate(event: RenderEvent) {
    const frameState = event.frameState
    if (!flashGeom) return
    if (!frameState) return
    const elapsed = frameState.time - start
    if (elapsed >= duration) {
      unByKey(listenerKey)
      return
    }
    const vectorContext = getVectorContext(event)
    const elapsedRatio = ((elapsed * 16) / duration) % 1
    // radius will be 5 at start and 30 at end.
    const radius = easeOut(elapsedRatio) * 25 + 5
    const opacity = easeOut(1 - elapsedRatio)

    const style = new Style({
      image: new CircleStyle({
        radius: radius,
        stroke: new Stroke({
          color: 'rgba(255, 0, 0, ' + opacity + ')',
          width: 0.25 + opacity
        })
      })
    })

    vectorContext.setStyle(style)
    vectorContext.drawGeometry(flashGeom)
    // tell OpenLayers to continue postrender animation
    map.render()
  }
}

export const createDashedCircle = (longitude: number, latitude: number, radiusInKm: number) => {
  // Convert longitude/latitude to map projection (typically EPSG:3857)
  const center = fromLonLat([longitude, latitude])

  // Calculate circle radius in map units
  // OpenLayers uses meters, so convert kilometers to meters
  const radiusInMeters = radiusInKm * 1000

  // Create circle geometry
  const circle = new CircleGeometry(center, radiusInMeters)

  // Create a feature from the circle
  const circleFeature = new Feature(circle)

  // Create a vector source and layer for the circle
  const vectorSource = new VectorSource({
    features: [circleFeature]
  })

  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: new Style({
      renderer: function (coordinates, state) {
        const [[x, y], [x1]] = coordinates as Coordinate[]
        const context = state.context

        // Set up the dashed line style
        context.strokeStyle = 'rgba(255, 0, 0, 0.7)' // Red with some transparency
        context.setLineDash([10, 10]) // 10px dash, 10px gap
        context.lineWidth = 2

        // Draw the circle
        context.beginPath()
        context.arc(x, y, Math.abs(x1 - x), 0, 2 * Math.PI)
        context.stroke()
      }
    })
  })

  return vectorLayer
}
