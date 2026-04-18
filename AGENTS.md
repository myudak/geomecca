# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3 + TypeScript seismic monitoring and earthquake early warning system (TEWS - Tsunami Early Warning System) built with Vite. The application provides real-time visualization and analysis of seismic data, station monitoring, waveform analysis, and event tracking for earthquake detection and analysis.

## Development Commands

### Setup
```bash
npm install
```

### Development
```bash
npm run dev          # Start development server with Vite
npm run preview      # Preview production build locally
```

### Building
```bash
npm run build        # Build for production (runs vite build)
npm run typecheck    # Type-check without emitting (vue-tsc --noEmit --skipLibCheck)
```

### Code Quality
```bash
npm run lint         # Run ESLint on src/**/*.{ts,vue} with auto-fix
npm run pretty       # Format src directory with Prettier
```

Note: Husky is configured with pre-commit hooks that run `lint-staged`, which automatically lints and formats staged `.ts` and `.vue` files.

## Project Architecture

### Technology Stack
- **Framework**: Vue 3 with Composition API (`<script setup>`)
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with DaisyUI (business theme)
- **State Management**: Pinia
- **Data Fetching**: TanStack Query (Vue Query) with custom configuration (no refetch on window focus, infinite stale time)
- **Routing**: Vue Router (web history mode)
- **Maps**: Dual implementation with both Leaflet and OpenLayers (ol)
- **Data Visualization**: D3.js for waveforms and charts
- **Real-time Communication**: Socket.IO client
- **HTTP Client**: Axios with JWT Bearer token authentication

### Directory Structure

**`src/domain/`** - Feature-based domain modules (main application features):
- `home/` - Landing page with navigation menu
- `auth/` - Login page and authentication forms
- `trace-view/` - Real-time waveform visualization and monitoring
- `station-view/` - Seismic station map visualization and status monitoring
- `eq-view/` - Earthquake event visualization and details
- `origin-locator-view/` - Origin location analysis with tabs for events, origins, magnitudes, and charts (Wadati plots)
- `picking/` - Manual seismic phase picking interface for arrival times
- `config-view/` - Configuration pages for users and stations

Each domain typically contains page components and domain-specific UI components.

**`src/components/`** - Reusable UI components:
- Map components: `ol-map/`, `ol-preview-map/`, `full-screen-map/`
- Tables: `event-list-table/`, `origin-list-table/`
- Common UI: `pagination/`, `date-filter/`, `admin-layout/`, `admin-navbar/`

**`src/api-service/`** - API client modules organized by resource (arrival, event, origin, station, users, wadati, record-stream). Each module has an `index.ts` (API functions) and `types.ts` (request/response types).

**`src/hooks/`** - Vue composables for data fetching and shared logic:
- Naming convention: `use-get-*`, `use-put-*`, `use-update-*`
- Wraps TanStack Query for API calls
- Examples: `use-get-event-detail.ts`, `use-get-station-list.ts`, `use-get-record-stream.ts`

**`src/types/`** - TypeScript type definitions for domain models (event, origin, station, arrival, magnitude, waveform, etc.)

**`src/utils/`** - Utility functions:
- `api.ts` - Axios instance with auth interceptors
- `map.ts`, `ol-map.ts` - Map-related utilities
- `waveform.ts` - Waveform data processing
- `event.ts`, `station.ts`, `filter.ts` - Domain-specific utilities
- `leaflet-plugins/` - Custom Leaflet plugins

**`src/constants/`** - Application constants:
- `env.ts` - Environment variable access with mock mode support
- `map.ts` - Map configuration
- `navbar.ts` - Navigation definitions
- `waveform.ts` - Waveform visualization settings

**`src/stores/`** - Pinia stores for global state (e.g., `picker.ts`)

**`src/routes/`** - Vue Router configuration with lazy-loaded route components

**`src/geo-json/`** - GeoJSON data for tectonic features (plate boundaries, megathrust zones, trenches, volcanoes, PUSGEN seismic zones for various Indonesian regions)

### Key Architecture Patterns

1. **Domain-Driven Structure**: Features are organized by domain/business capability rather than technical layer, making it easier to understand and modify specific features.

2. **Component Export Pattern**: Each component directory has an `index.ts` that re-exports the `.vue` file as default, enabling cleaner imports: `import { ComponentName } from '@src/components/component-name'`

3. **Path Alias**: `@src` is aliased to `./src` in Vite config for absolute imports.

4. **API Layer Separation**: API calls are isolated in `src/api-service/` modules, consumed by hooks/composables that add Vue Query caching.

5. **Authentication Flow**:
   - JWT tokens stored in cookies (`access_token`)
   - `src/utils/api.ts` adds Bearer token to all requests
   - 401 responses trigger cookie removal and page reload
   - `App.vue` checks profile and conditionally renders LoginPage or AdminLayout

6. **Environment Configuration**:
   - Multi-environment support via `.env` with separate URLs for API, WebSocket, and streaming services
   - Mock mode toggle via localStorage (`use-mock`)

7. **Map Abstraction**: The application supports both Leaflet and OpenLayers for mapping, with components in `src/components/ol-map/` and utilities for both libraries.

8. **Real-time Data**: Uses Socket.IO for real-time waveform streaming and event updates. WebSocket data stored in `window.socketData`.

9. **Dark/Light Mode**:
   - Implemented using Tailwind's `dark:` prefix and DaisyUI themes
   - Theme management hook: `src/hooks/use-theme.ts`
   - Supports three modes: `light`, `dark`, `system` (follows OS preference)
   - Theme preference persisted in localStorage
   - Theme toggle component in navbar: `src/components/theme-toggle/`
   - Use `dark:` prefix for dark mode styles: `<div class="bg-white dark:bg-gray-900">`
   - See `DARK_MODE_GUIDE.md` for detailed documentation

## Testing

No test framework is currently configured. When adding tests, consider using Vitest (integrates well with Vite).

## Deployment

The project includes a Dockerfile for containerized deployment:
- Uses nginx:alpine base image
- Serves static files from `dist/` directory
- Custom nginx.conf included
- Exposes port 8004

Build the production bundle before building the Docker image:
```bash
npm run build
docker build -t tews-ui .
```

## Code Style and Linting

- **ESLint**: Configured with Vue 3, TypeScript, and Prettier integration
- **Import Sorting**: Uses `simple-import-sort` plugin - imports are automatically sorted
- **Prettier**: Formats code with project-specific config
- Auto-fix is enabled for most rules
- Pre-commit hooks enforce code quality via lint-staged

## Important Notes

- The codebase uses Vue 3 `<script setup>` syntax throughout
- Type safety: TypeScript strict mode is not fully enabled; `@typescript-eslint/no-explicit-any` and `@typescript-eslint/ban-ts-comment` are set to warn
- Component naming: `vue/multi-word-component-names` rule is set to warn rather than error
- The application handles seismic data with specific scientific terminology (origins, arrivals, magnitudes, phase picks, Wadati diagrams)
- GeoJSON files in `src/geo-json/` are specific to Indonesian seismology (PUSGEN = Pusat Studi Gempa Nasional / National Earthquake Study Center)
