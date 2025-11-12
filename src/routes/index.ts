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
  title: 'Geomecca | Tsunami Early Warning System Dashboard',
  description:
    'Geomecca delivers a unified tsunami early warning dashboard with live seismic insights, waveform analytics, and sensor health monitoring across Indonesia.',
  keywords: 'Geomecca, tsunami early warning, seismic dashboard, waveform analytics, BMKG',
  image: '/screenshots/station-view.png',
  imageAlt: 'Geomecca tsunami early warning dashboard preview'
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../domain/home/home-page'),
    meta: {
      title: 'Geomecca | Unified Situational Awareness',
      description:
        'Stay ahead of tsunami threats with Geomecca’s overview page combining alerts, live telemetry, and mission-critical shortcuts.',
      keywords: 'Geomecca home, tsunami overview, seismic telemetry',
      image: '/screenshots/station-view.png',
      imageAlt: 'Geomecca situational awareness dashboard'
    }
  },
  {
    path: '/login',
    component: () => import('../domain/auth/login-page'),
    meta: {
      title: 'Geomecca | Secure Access Portal',
      description: 'Authenticate to access Geomecca’s tsunami early warning and seismic intelligence workspace.',
      keywords: 'Geomecca login, secure access, tsunami early warning portal',
      image: '/images/geomecca-logo.png',
      imageAlt: 'Geomecca brand mark'
    }
  },
  {
    path: '/trace-view',
    component: () => import('../domain/trace-view/trace-view-page'),
    meta: {
      title: 'Geomecca | Trace View',
      description:
        'Stream real-time waveform traces, analyze amplitude trends, and validate phase picks across the Indonesian seismic network.',
      keywords: 'Geomecca trace view, waveform monitoring, seismic traces',
      image: '/screenshots/trace-view.png',
      imageAlt: 'Waveform trace analysis inside Geomecca'
    }
  },
  {
    path: '/station-view',
    component: () => import('../domain/station-view/station-view-page'),
    meta: {
      title: 'Geomecca | Station Health Monitor',
      description:
        'Visualize seismic station uptime, telemetry quality, and sensor status with Geomecca’s interactive health map.',
      keywords: 'Geomecca station view, seismic stations, sensor uptime',
      image: '/screenshots/station-view.png',
      imageAlt: 'Station health map within Geomecca'
    }
  },
  {
    path: '/eq-view',
    component: () => import('@src/domain/eq-view/eq-view-page'),
    meta: {
      title: 'Geomecca | Earthquake Event Feed',
      description:
        'Track earthquake detections, review hypocenter solutions, and drill into magnitudes with Geomecca’s EQ feed.',
      keywords: 'Geomecca earthquake view, EQ catalog, hypocenter monitoring',
      image: '/screenshots/eq-view.png',
      imageAlt: 'Earthquake event list within Geomecca'
    }
  },
  {
    path: '/map-view',
    name: 'map-view',
    component: () => import('@src/domain/map-view/map-view-page'),
    meta: {
      title: 'Geomecca | Geospatial Operations Map',
      description:
        'Layer tectonic plates, stations, and live detections on Geomecca’s high-performance geospatial operations map.',
      keywords: 'Geomecca map view, tectonic layers, seismic GIS',
      image: '/screenshots/station-view.png',
      imageAlt: 'Geomecca geospatial operations map'
    }
  },
  {
    path: '/origin-locator-view/:tab',
    component: () => import('@src/domain/origin-locator-view/origin-locator-view-page'),
    meta: {
      title: 'Geomecca | Origin Locator Workspace',
      description:
        'Compare events, magnitudes, and Wadati plots in Geomecca’s origin locator to refine tsunami source solutions.',
      keywords: 'Geomecca origin locator, Wadati plots, magnitude analysis',
      image: '/screenshots/origin-locator-view.png',
      imageAlt: 'Origin locator analytics inside Geomecca'
    }
  },
  {
    path: '/origin-locator-view/:tab/:id',
    component: () => import('@src/domain/origin-locator-view/origin-locator-view-page'),
    meta: {
      title: 'Geomecca | Origin Locator Workspace',
      description:
        'Compare events, magnitudes, and Wadati plots in Geomecca’s origin locator to refine tsunami source solutions.',
      keywords: 'Geomecca origin locator, Wadati plots, magnitude analysis',
      image: '/screenshots/origin-locator-view.png',
      imageAlt: 'Origin locator analytics inside Geomecca'
    }
  },
  {
    path: '/origin-locator-view/:tab/:id/:originId',
    component: () => import('@src/domain/origin-locator-view/origin-locator-view-page'),
    meta: {
      title: 'Geomecca | Origin Locator Workspace',
      description:
        'Compare events, magnitudes, and Wadati plots in Geomecca’s origin locator to refine tsunami source solutions.',
      keywords: 'Geomecca origin locator, Wadati plots, magnitude analysis',
      image: '/screenshots/origin-locator-view.png',
      imageAlt: 'Origin locator analytics inside Geomecca'
    }
  },
  {
    path: '/config',
    component: () => import('@src/domain/config-view/user-view-page'),
    meta: {
      title: 'Geomecca | Configuration Center',
      description:
        'Manage operators, access policies, and notification settings across the Geomecca tsunami early warning stack.',
      keywords: 'Geomecca configuration, user management, alert routing',
      image: '/screenshots/config-view.png',
      imageAlt: 'Configuration management inside Geomecca'
    }
  },
  {
    path: '/config/user',
    name: 'config-user',
    component: () => import('@src/domain/config-view/user-view-page'),
    meta: {
      title: 'Geomecca | User Administration',
      description: 'Invite analysts, adjust privileges, and maintain audit-ready access controls within Geomecca.',
      keywords: 'Geomecca user admin, access control, TEWS users',
      image: '/screenshots/config-view.png',
      imageAlt: 'User administration in Geomecca'
    }
  },
  {
    path: '/config/station',
    name: 'config-station',
    component: () => import('@src/domain/config-view/station-view-page'),
    meta: {
      title: 'Geomecca | Station Configuration',
      description: 'Register new seismic stations, edit telemetry endpoints, and tune alert rules for field hardware.',
      keywords: 'Geomecca station config, telemetry setup, seismic hardware',
      image: '/screenshots/config-view.png',
      imageAlt: 'Station configuration tools in Geomecca'
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
