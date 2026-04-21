import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const APP_BASE_URL = 'https://tews.myudak.com'

type PageMeta = {
  title?: string
  description?: string
  keywords?: string
  image?: string
  imageAlt?: string
}

declare module 'vue-router' {
  interface RouteMeta extends PageMeta {}
}

const defaultMeta: Required<PageMeta> = {
  title: 'AI-Powered Multi-Hazard Early Warning System: Integrating Earthquake Detection and Weather Intelligence in a Unified Platform',
  description:
    'MHEWS delivers a unified multi-hazard early warning platform combining earthquake detection, weather intelligence, waveform analytics, and operational monitoring across Indonesia.',
  keywords: 'MHEWS, multi-hazard early warning, earthquake detection, weather intelligence, BMKG-style dashboard',
  image: '/images/weather-preview.svg',
  imageAlt: 'MHEWS multi-hazard early warning dashboard preview'
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../domain/home/home-page'),
    meta: {
      title:
        'AI-Powered Multi-Hazard Early Warning System: Integrating Earthquake Detection and Weather Intelligence in a Unified Platform',
      description:
        'Stay ahead of operational hazards with MHEWS’s overview page combining weather intelligence, earthquake monitoring, and mission-critical shortcuts.',
      keywords: 'MHEWS home, multi-hazard dashboard, weather intelligence, seismic telemetry',
      image: '/images/weather-preview.svg',
      imageAlt: 'MHEWS multi-hazard situational awareness dashboard'
    }
  },
  {
    path: '/weather-view',
    component: () => import('@src/domain/weather-view/weather-view-page'),
    meta: {
      title: 'MHEWS | Weather Intelligence',
      description:
        'Review BMKG-style weather outlooks, warning bulletins, city forecasts, and coastal advisories in MHEWS’s unified multi-hazard workspace.',
      keywords: 'MHEWS weather intelligence, BMKG-style forecast, multi-hazard early warning',
      image: '/images/weather-preview.svg',
      imageAlt: 'Weather intelligence workspace within MHEWS dashboard'
    }
  },
  {
    path: '/login',
    component: () => import('../domain/auth/login-page'),
    meta: {
      title: 'MHEWS | Secure Access Portal',
      description:
        'Authenticate to access MHEWS’s multi-hazard workspace for earthquake detection and weather intelligence.',
      keywords: 'MHEWS login, secure access, multi-hazard early warning portal',
      image: '/images/logo-UI.png',
      imageAlt: 'MHEWS brand mark'
    }
  },
  {
    path: '/trace-view',
    component: () => import('../domain/trace-view/trace-view-page'),
    meta: {
      title: 'MHEWS | Trace View',
      description:
        'Stream real-time waveform traces, analyze amplitude trends, and validate phase picks across MHEWS’s multi-hazard monitoring network.',
      keywords: 'MHEWS trace view, waveform monitoring, seismic traces',
      image: '/screenshots/trace-view.png',
      imageAlt: 'Waveform trace analysis inside MHEWS dashboard'
    }
  },
  {
    path: '/station-view',
    component: () => import('../domain/station-view/station-view-page'),
    meta: {
      title: 'MHEWS | Station Health Monitor',
      description:
        'Visualize station uptime, telemetry quality, and sensor status with MHEWS’s interactive operational health map.',
      keywords: 'MHEWS station view, seismic stations, sensor uptime',
      image: '/screenshots/station-view.png',
      imageAlt: 'Station health map within MHEWS dashboard'
    }
  },
  {
    path: '/eq-view',
    component: () => import('@src/domain/eq-view/eq-view-page'),
    meta: {
      title: 'MHEWS | Earthquake Event Feed',
      description:
        'Track earthquake detections, review hypocenter solutions, and drill into magnitudes within MHEWS’s unified hazard feed.',
      keywords: 'MHEWS earthquake view, EQ catalog, hypocenter monitoring',
      image: '/screenshots/eq-view.png',
      imageAlt: 'Earthquake event list within MHEWS dashboard'
    }
  },
  {
    path: '/map-view',
    name: 'map-view',
    component: () => import('@src/domain/map-view/map-view-page'),
    meta: {
      title: 'MHEWS | Geospatial Operations Map',
      description:
        'Layer tectonic plates, stations, and live detections on MHEWS’s high-performance geospatial operations map.',
      keywords: 'MHEWS map view, tectonic layers, seismic GIS',
      image: '/screenshots/station-view.png',
      imageAlt: 'MHEWS geospatial operations map'
    }
  },
  {
    path: '/origin-locator-view/:tab',
    component: () => import('@src/domain/origin-locator-view/origin-locator-view-page'),
    meta: {
      title: 'MHEWS | Origin Locator Workspace',
      description:
        'Compare events, magnitudes, and Wadati plots in MHEWS’s origin locator to refine event source solutions.',
      keywords: 'MHEWS origin locator, Wadati plots, magnitude analysis',
      image: '/screenshots/origin-locator-view.png',
      imageAlt: 'Origin locator analytics inside MHEWS dashboard'
    }
  },
  {
    path: '/origin-locator-view/:tab/:id',
    component: () => import('@src/domain/origin-locator-view/origin-locator-view-page'),
    meta: {
      title: 'MHEWS | Origin Locator Workspace',
      description:
        'Compare events, magnitudes, and Wadati plots in MHEWS’s origin locator to refine event source solutions.',
      keywords: 'MHEWS origin locator, Wadati plots, magnitude analysis',
      image: '/screenshots/origin-locator-view.png',
      imageAlt: 'Origin locator analytics inside MHEWS dashboard'
    }
  },
  {
    path: '/origin-locator-view/:tab/:id/:originId',
    component: () => import('@src/domain/origin-locator-view/origin-locator-view-page'),
    meta: {
      title: 'MHEWS | Origin Locator Workspace',
      description:
        'Compare events, magnitudes, and Wadati plots in MHEWS’s origin locator to refine event source solutions.',
      keywords: 'MHEWS origin locator, Wadati plots, magnitude analysis',
      image: '/screenshots/origin-locator-view.png',
      imageAlt: 'Origin locator analytics inside MHEWS dashboard'
    }
  },
  {
    path: '/config',
    component: () => import('@src/domain/config-view/user-view-page'),
    meta: {
      title: 'MHEWS | Configuration Center',
      description:
        'Manage operators, access policies, and notification settings across the MHEWS multi-hazard early warning stack.',
      keywords: 'MHEWS configuration, user management, alert routing',
      image: '/screenshots/config-view.png',
      imageAlt: 'Configuration management inside MHEWS dashboard'
    }
  },
  {
    path: '/config/user',
    name: 'config-user',
    component: () => import('@src/domain/config-view/user-view-page'),
    meta: {
      title: 'MHEWS | User Administration',
      description:
        'Invite analysts, adjust privileges, and maintain audit-ready access controls within MHEWS.',
      keywords: 'MHEWS user admin, access control, TEWS users',
      image: '/screenshots/config-view.png',
      imageAlt: 'User administration in MHEWS dashboard'
    }
  },
  {
    path: '/config/station',
    name: 'config-station',
    component: () => import('@src/domain/config-view/station-view-page'),
    meta: {
      title: 'MHEWS | Station Configuration',
      description: 'Register new seismic stations, edit telemetry endpoints, and tune alert rules for field hardware.',
      keywords: 'MHEWS station config, telemetry setup, seismic hardware',
      image: '/screenshots/config-view.png',
      imageAlt: 'Station configuration tools in MHEWS dashboard'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const ensureAbsoluteUrl = (value: string): string => {
  if (!value) return APP_BASE_URL
  if (value.startsWith('http')) return value
  const normalized = value.startsWith('/') ? value : `/${value}`
  return `${APP_BASE_URL}${normalized}`
}

const upsertMetaTag = (identifier: string, content: string, attr: 'name' | 'property' = 'name') => {
  if (typeof document === 'undefined') return
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${identifier}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, identifier)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

const updateCanonicalLink = (href: string) => {
  if (typeof document === 'undefined') return
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

const applyRouteMeta = (meta: PageMeta | undefined, fullPath: string) => {
  if (typeof document === 'undefined') return
  const merged = { ...defaultMeta, ...(meta ?? {}) }
  document.title = merged.title
  upsertMetaTag('description', merged.description)
  upsertMetaTag('keywords', merged.keywords)
  upsertMetaTag('og:title', merged.title, 'property')
  upsertMetaTag('og:description', merged.description, 'property')
  upsertMetaTag('twitter:title', merged.title)
  upsertMetaTag('twitter:description', merged.description)

  const imageUrl = ensureAbsoluteUrl(merged.image)
  upsertMetaTag('og:image', imageUrl, 'property')
  upsertMetaTag('twitter:image', imageUrl)
  const imageAlt = merged.imageAlt ?? defaultMeta.imageAlt
  upsertMetaTag('og:image:alt', imageAlt, 'property')
  upsertMetaTag('twitter:image:alt', imageAlt)

  const pageUrl = ensureAbsoluteUrl(fullPath)
  upsertMetaTag('og:url', pageUrl, 'property')
  updateCanonicalLink(pageUrl)
}

router.afterEach((to) => {
  applyRouteMeta(to.meta, to.fullPath)
})

export default router
