# Frontend Fixes Applied

This document describes fixes applied to the frontend to work correctly with the backend.

## Issues Fixed

### 1. **Wadati Diagram Not Displaying**

**Problem:** The Wadati diagram was not showing, and the download button was disabled even though the backend was returning data.

**Root Cause:** MIME type mismatch - the backend returns base64-encoded **SVG** images, but the frontend was using `data:image/png;base64,` which prevented the browser from displaying the image.

**Location:** `src/domain/origin-locator-view/chart-tab-list/chart-tab-list.vue:23`

**Fix:**
```typescript
// Before:
const wadatiImageUrl = computed(() => (wadatiImage.value ? `data:image/png;base64,${wadatiImage.value}` : ''))

// After:
const wadatiImageUrl = computed(() => (wadatiImage.value ? `data:image/svg+xml;base64,${wadatiImage.value}` : ''))
```

**Impact:**
- ✅ Wadati diagram now displays correctly
- ✅ Download button is enabled when diagram data is available
- ✅ Users can click to view full-size diagram with VueEasyLightbox

---

### 2. **OLPreviewMap Not Rendering**

**Problem:** The OpenLayers preview map was not showing on the origin locator detail page, even when the `v-if="magnitude && preferredOrigin"` condition was met.

**Root Cause:** JavaScript error in the component - reference to undefined variable `event` that prevented the map from rendering.

**Location:** `src/components/ol-preview-map/ol-preview-map.vue:31`

**Fix:**
```typescript
// Before:
onMounted(() => {
  const latLng = transform([origin.longitude, origin.latitude], 'EPSG:4326', 'EPSG:3857')
  const feature = createMagnitudeFeature(origin, magnitude)
  feature.setProperties({ event })  // ❌ 'event' is not defined!

// After:
onMounted(() => {
  const latLng = transform([origin.longitude, origin.latitude], 'EPSG:4326', 'EPSG:3857')
  const feature = createMagnitudeFeature(origin, magnitude)
  feature.setProperties({ origin, magnitude })  // ✅ Use available props
```

**Impact:**
- ✅ Map now renders correctly with event location
- ✅ Displays magnitude marker at epicenter
- ✅ Shows lines connecting to stations with arrivals
- ✅ Renders uncertainty circle (err_epicenter) when available

---

## Backend Wadati Endpoint Created

**File:** `coba_backend/src/routes/wadati.ts` (NEW)

**Functionality:**
- Accepts `POST /wadati/getplot` with `{ origin_id: string }`
- Fetches origin and its arrivals from database
- Groups arrivals by station to find P-S wave pairs
- Performs linear regression to calculate Vp/Vs ratio
- Generates SVG Wadati diagram showing:
  - P-wave arrival times (x-axis)
  - S-wave arrival times (y-axis)
  - Regression line with Vp/Vs ratio
  - Data points for each station
- Returns base64-encoded SVG image

**Response Format:**
```json
{
  "data": {
    "image": "PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjUwMCI+Li4uPC9zdmc+",
    "total_event": 5,
    "ratio": 1.73
  }
}
```

**Added to:** `coba_backend/src/index.ts:16,36`
```typescript
import { wadatiRouter } from './routes/wadati'
app.use('/wadati', wadatiRouter)
```

---

## Verification Steps

### 1. Test Wadati Diagram
1. Navigate to `/origin-locator-view/location/{origin_id}`
2. Check "Wadati Diagram Event" section
3. Verify:
   - ✅ Diagram displays with axes and data points
   - ✅ Title shows "Wadati Diagram"
   - ✅ Vp/Vs ratio is displayed (e.g., "Vp/Vs ratio: 1.732")
   - ✅ Download button is enabled
   - ✅ Clicking image opens lightbox view
   - ✅ Download saves as PNG file

### 2. Test OLPreviewMap
1. Navigate to `/origin-locator-view/location/{origin_id}`
2. Check "Map" section
3. Verify:
   - ✅ Map displays with terrain/satellite tiles
   - ✅ Event location marked with magnitude indicator
   - ✅ Station locations shown as markers
   - ✅ Lines connecting event to stations
   - ✅ Uncertainty circle displayed (if err_epicenter exists)
   - ✅ Map centered on event epicenter

### 3. Test with Real Data
Using origin ID: `68e865f95b29e7c6f852c245`

Expected results:
- Wadati diagram shows multiple P-S pairs from different stations
- Map shows event location near Patuha, West Java (-7.18°, 107.42°)
- Magnitude approximately 1.8-2.0 (Mw)
- Multiple arrivals from stations PPL01-PPL08, TCH02, TCH04, etc.

---

## Notes

- **No frontend code changes required** for basic functionality - the frontend was already correctly structured
- The issues were:
  1. Missing backend endpoint (`/wadati/getplot`)
  2. Wrong MIME type for SVG data
  3. JavaScript error in map component
- All fixes maintain compatibility with existing frontend architecture
- Vite HMR automatically applied changes without requiring page refresh
