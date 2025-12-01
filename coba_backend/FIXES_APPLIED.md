# Backend Fixes Applied

This document describes all the fixes applied to the `coba_backend` to ensure it works correctly with the frontend.

## Issues Fixed

### 1. **Login Response Format Mismatch**
**Problem:** The frontend expected `access_token` in the login response, but the backend was returning `token`.

**Location:** `coba_backend/src/routes/auth.ts` and `coba_backend/src/routes/users.ts`

**Fix:**
- `/auth/login` endpoint now returns:
  ```json
  {
    "status": true,
    "data": {
      "access_token": "...",
      "user": {
        "_id": "...",
        "username": "...",
        "role": "...",
        "region": "..."
      }
    }
  }
  ```

- `/user/login` endpoint now returns the format expected by the frontend:
  ```json
  {
    "status": true,
    "data": {
      "id": "...",
      "username": "...",
      "region": "...",
      "access_token": "..."
    }
  }
  ```

### 2. **Event Detail Missing Arrivals**
**Problem:** The `/event/getdetail` endpoint was returning origins without their associated arrivals populated.

**Location:** `coba_backend/src/routes/events.ts`

**Fix:**
- Modified the endpoint to fetch and populate arrivals for each origin:
  ```typescript
  const originsWithArrivals = await Promise.all(
    origins.map(async (origin) => {
      const arrivals = await ArrivalModel.find({ _id: { $in: origin.arrival_ids } })
      return {
        ...origin.toObject(),
        arrivals
      }
    })
  )
  ```

### 3. **Origin Detail Missing Arrivals**
**Problem:** The `/origin/getdetail` endpoint was not populating arrivals.

**Location:** `coba_backend/src/routes/origins.ts`

**Fix:**
- Added arrival population to the origin detail response:
  ```typescript
  const arrivals = await ArrivalModel.find({ _id: { $in: origin.arrival_ids } })
  return res.json({ data: [{ ...origin.toObject(), arrivals }] })
  ```

### 4. **Missing Wadati Plot Endpoint**
**Problem:** Frontend was getting 404 error when trying to fetch Wadati diagram for origin locator view.

**Location:** `coba_backend/src/routes/wadati.ts` (NEW FILE)

**Fix:**
- Created new Wadati endpoint `POST /wadati/getplot`:
  - Accepts `{ origin_id: string }` in request body
  - Fetches origin and arrivals from database
  - Groups arrivals by station to find P-S wave pairs
  - Calculates P and S wave travel times from timestamps
  - Performs linear regression to calculate Vp/Vs ratio
  - Generates SVG plot with:
    - P-wave arrival time (x-axis)
    - S-wave arrival time (y-axis)
    - Data points for each station
    - Regression line showing Vp/Vs relationship
    - Calculated Vp/Vs ratio displayed in title
  - Returns base64-encoded SVG image
  ```typescript
  return res.json({
    data: {
      image: base64EncodedSvg,
      total_event: numberOfPSPairs,
      ratio: vpVsRatio
    }
  })
  ```
- Added wadati router to main app (`src/index.ts:16,36`):
  ```typescript
  import { wadatiRouter } from './routes/wadati'
  app.use('/wadati', wadatiRouter)
  ```

## Current State

### Running Backend
✅ Backend is running successfully on port **4000**
✅ MongoDB connected at `mongodb://localhost:27017/tews`
✅ Default admin user created: `user_bmkg` / `superadmin123`
✅ 11 stations seeded successfully
⚠️ Kafka is not running (expected - optional component)

### Tested Endpoints
All critical endpoints have been tested and are working correctly:

- ✅ `GET /health` - Health check
- ✅ `POST /auth/login` - Authentication (returns correct format)
- ✅ `POST /user/login` - Alternative login endpoint (returns correct format)
- ✅ `GET /user/me` - Current user profile
- ✅ `GET /user/getall` - List all users
- ✅ `GET /station/getall` - List all stations
- ✅ `GET /event/getall` - List all events
- ✅ `GET /event/getdetail` - Get event details with populated origins and arrivals
- ✅ `GET /origin/getdetail` - Get origin details with populated arrivals
- ✅ `POST /wadati/getplot` - Generate Wadati diagram for an origin (returns base64 SVG)

### WebSocket Support
The backend includes comprehensive WebSocket support:

- **Socket.IO** (port 4000, path `/socket.io`):
  - Waveform streaming: Listen on `waveform` event, receive on `data-{channel}`

- **Plain WebSocket endpoints**:
  - `/wsevent` - Mock real-time events (every 5 seconds)
  - `/wspicking` - Mock picks (every 3 seconds)
  - `/wsarrivalpick` - Mock arrival picks (every 4 seconds)

### Environment Configuration
The backend uses the following configuration (from `.env`):

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/tews
JWT_SECRET=change-me
DEFAULT_ADMIN_USERNAME=user_bmkg
DEFAULT_ADMIN_PASSWORD=superadmin123
DEFAULT_ADMIN_REGION=central
KAFKA_BROKERS=localhost:29092
KAFKA_CLIENT_ID=tews-backend
KAFKA_GROUP_ID=tews-backend-consumer
SEEDLINK_HOST=localhost
SEEDLINK_PORT=18000
```

## Running the Backend

### Prerequisites
- MongoDB running on `localhost:27017`
- Node.js v20+ installed
- npm installed

### Start the backend
```bash
cd coba_backend
npm install
npm run dev
```

The API will be available at `http://localhost:4000`

### Testing with the Frontend
The frontend should be configured to point to the backend:
- API URL: `http://localhost:4000`
- WebSocket URL: `http://localhost:4000` (for Socket.IO)

## Data Import

The JSON data from `jsonBaru/` directory has been successfully imported:

✅ **13 Events** - Seismic events from Aug 2024 - Sep 2025
✅ **13 Origins** - Location data (lat/lon/depth) for each event
✅ **114 Arrivals** - P and S wave arrivals from various stations
✅ **23 Magnitudes** - Magnitude calculations (Mw, MLv, M100 types)

All events are now available in the database at `mongodb://localhost:27017/tews`

## Next Steps (Optional Improvements)

While the backend is now functional, here are some optional improvements that could be made:

1. **Import Additional Data**: If you have more seismic event data, you can import it using:
   ```bash
   npm run import:json
   ```

2. **Run Kafka (Optional)**: For real-time event ingestion, you can run Kafka using Docker:
   ```bash
   docker compose up -d
   ```

3. **Add More Validation**: Add request validation using Zod schemas for better error handling

4. **Add Tests**: Add unit and integration tests for API endpoints

5. **Improve Error Handling**: Add more detailed error messages and proper HTTP status codes

6. **Add API Documentation**: Generate OpenAPI/Swagger documentation for the API

## Notes

- The frontend is the **ground truth** - no frontend code was modified
- All backend routes now match the frontend API expectations
- The backend gracefully handles Kafka being unavailable (it's optional)
- Default admin credentials: `user_bmkg` / `superadmin123`
