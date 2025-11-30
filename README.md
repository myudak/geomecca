# GeoMecca – Frontend + Backend

This repo includes a Vue 3 frontend (Vite) and a Node/Express backend (`coba_backend`). You can run them locally with npm or via Docker.

## Prerequisites
- Node 20+
- npm
- MongoDB (local or via Docker)
- MiniSEED archive (read-only), placed at `coba_backend/data/mseed` (or set `MSEED_PATH`)

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
cd frontend   # repo root
npm install
npm run dev   # Vite dev server
```

## Run via Docker
```bash
docker-compose -f docker-compose.backend.yml up --build
```
This starts Mongo + backend. The MiniSEED archive is mounted read-only to `/data/mseed` in the container (adjust the host path in the compose file if needed).

## Notes
- `/recordstream` and waveform features read from the MiniSEED archive; stations without data will show empty traces.
- Picks/arrivals live in Mongo; import scripts are under `coba_backend/scripts` (e.g., `npm run import:picks`, `npm run import:full`).
