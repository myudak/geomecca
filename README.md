# GeoMecca – Frontend + Backend

This repo includes a Vue 3 frontend (Vite) and a Node/Express backend (`coba_backend`). You can run them locally with npm or via Docker.

## Prerequisites
- Node 20+
- npm
- MongoDB (local or via Docker)
- MiniSEED archive (read-only), placed at `coba_backend/data/mseed` (or set `MSEED_PATH`/`MSEED_HOST_PATH`)

## Environment
- Frontend: copy `.env.example` → `.env` (set API/Socket URLs).
- Backend: copy `coba_backend/.env.example` → `coba_backend/.env`. Key vars:
  - `PORT` (default 4000)
  - `MONGODB_URI` (e.g., `mongodb://localhost:27017/tews`)
  - `MSEED_PATH` (default `coba_backend/data/mseed`)
  - JWT/admin defaults as needed

## Run locally (npm)
### Backend
```bash
cd coba_backend
npm install
npm run dev    # runs src/index.ts with tsx watch on port 4000
```

### Frontend
```bash
npm install
npm run dev   # Vite dev server (repo root)
```

## Run via Docker
### Backend only
```bash
docker compose -f docker-compose.backend.yml up --build
```
### Full stack (Mongo + backend + frontend)
```bash
docker compose -f docker-compose.full.yml up --build
```

Notes for Docker:
- MiniSEED is mounted read-only to `/data/mseed` inside the backend. Set `MSEED_HOST_PATH` to an absolute host path if the default relative path isn’t accessible to Docker (Windows users may need to share the drive and use a `/mnt/...` path).
- Backend published ports: 4002 (full compose) or 4000/4001 in other files as configured.
- Mongo published port: 27018 in the full compose.
- Frontend published port: 8006 in the full compose.

## Data
- Waveforms: read from the MiniSEED archive; stations without data will show empty traces.
- Picks/arrivals: stored in Mongo; import scripts live in `coba_backend/scripts` (e.g., `npm run import:picks`, `npm run import:full`).
