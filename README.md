# GeoMecca Frontend + Backend

![GeoMecca mockup](mockup.png)

Vue 3 (Vite) frontend plus Node/Express backend (`coba_backend`). You can run locally with npm or via Docker.

## Prerequisites
- Node 20+
- npm
- MongoDB (local or Docker)
- MiniSEED archive at `coba_backend/data/mseed` (or set `MSEED_PATH` / `MSEED_HOST_PATH`)

## Environment
- Frontend: copy `.env.example` to `.env`; set API and socket URLs.
- Backend: copy `coba_backend/.env.example` to `coba_backend/.env`. Key vars:
  - `PORT` (default 4000)
  - `MONGODB_URI` (e.g., `mongodb://localhost:27017/tews`)
  - `MSEED_PATH` (default `coba_backend/data/mseed`)
  - JWT/admin defaults as needed

## Run locally (npm)
Backend:
```bash
cd coba_backend
npm install
npm run dev
```
Frontend:
```bash
npm install
npm run dev
```

## Run via Docker
Backend only:
```bash
docker compose -f docker-compose.backend.yml up --build
```
Full stack (Mongo + backend + frontend):
```bash
docker compose -f docker-compose.full.yml up --build
```

Notes for Docker:
- MiniSEED mounts read-only to `/data/mseed` in the backend. If the default relative path is not accessible, set `MSEED_HOST_PATH` to an absolute path (share the drive on Windows).
- Ports (full compose): backend 4002, Mongo 27018, frontend 8006.
- Auto import: `AUTO_IMPORT=1` (already set in the compose) runs the Mongo import scripts before the backend starts.

## Data
- Waveforms: read from the MiniSEED archive; stations without data return empty traces.
- Picks/arrivals: stored in Mongo; import scripts live in `coba_backend/scripts` (e.g., `npm run import:picks`, `npm run import:full`).

## Docs
- User guide: `PANDUAN_GEO_MECCA.md`.
