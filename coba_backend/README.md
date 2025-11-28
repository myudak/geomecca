# TEWS Backend (coba_backend)

Lightweight Node + TypeScript backend that mirrors the frontend endpoints for users, stations, events, picks/arrivals, and utility helpers. Seeds a default admin (`user_bmkg`/`superadmin123`).

## Quick start

1) Ensure you have local services running (no Docker): MongoDB (`mongodb://localhost:27017/tews` by default). Kafka/SeedLink are optional; if they are absent the API will continue after logging a warning.
2) Install deps and start:

```bash
cd coba_backend
cp .env.example .env
pnpm install
pnpm run dev
```

API runs on `:4000` by default. The health check is at `GET /health`.

## Infra via Docker (recommended for Mongo/Kafka/SeedLink)

Run only the infra (keep API local with `pnpm run dev`):

```bash
sudo docker compose up -d   # mongo (27017), kafka (9092/29092), kafka-ui (8080), seedlink mock (18000)
sudo docker compose stop api  # free port 4000 for local API
```

Service ports:
- Mongo: `localhost:27017`
- Kafka: `localhost:9092` (internal), `localhost:29092` (host)
- Kafka UI: `http://localhost:8080`
- SeedLink mock: `localhost:18000` (synthetic streams for all default stations/channels)

## Environment

See `.env.example` for overridable values:

- `DEFAULT_ADMIN_USERNAME`, `DEFAULT_ADMIN_PASSWORD`, `DEFAULT_ADMIN_REGION`
- `MONGODB_URI`, `JWT_SECRET`
- `KAFKA_BROKERS`, `KAFKA_CLIENT_ID`, `KAFKA_GROUP_ID`
- `SEEDLINK_HOST`, `SEEDLINK_PORT`

For local API + Docker infra use:
```
MONGODB_URI=mongodb://localhost:27017/tews
KAFKA_BROKERS=localhost:29092
SEEDLINK_HOST=localhost
SEEDLINK_PORT=18000
```

## Install local services (no Docker)

- **MongoDB**: on Debian/Ubuntu: `sudo apt-get update && sudo apt-get install -y mongodb` then `sudo systemctl start mongodb` (default URI `mongodb://localhost:27017/tews`). On macOS (Homebrew): `brew install mongodb-community@7.0` then `brew services start mongodb-community@7.0`.
- **Kafka (optional but recommended)**: download Kafka, then in one terminal run `bin/zookeeper-server-start.sh config/zookeeper.properties` and in another `bin/kafka-server-start.sh config/server.properties`. Set `KAFKA_BROKERS=localhost:9092` in `.env`.
- **SeedLink mock (optional)**: install Python 3 + `pip install obspy`, then `python scripts/seedlink_mock.py --host 0.0.0.0 --port 18000 --network PP --station PPL01 --channel DPZ --loop --realtime`.

## Core endpoints (all JSON)

- Auth: `POST /auth/login` → `{token, user}`
- User profile: `GET /user/me`
- Users: `GET /user/getall`, `POST /user`, `PUT /user/:id`, `DELETE /user/:id`
- Stations: `GET /station/getall`, `POST /station`, `PUT /station/:id`, `DELETE /station/:id`, `PUT /station/updatestatus`, `GET /station/getwaveformstatus`
- Picks/Arrivals: `GET /pick/getbystation`, `POST /pick`, `GET /arrival/getbystation`, `POST /arrival`, `POST /arrivalkatalog/getarrivalkatalog`
- Events/Origins: `GET /event/getall`, `GET /event/getbybetweendate`, `GET /event/getdetail`, `PUT /event/commit`, `POST /event`; `GET /origin/getdetail`, `POST /origin/psteoritical`

Kafka consumers (topics `picks` and `arrivals`) ingest JSON messages into Mongo; failures are logged but non-fatal. SeedLink hosting is provided by the ringserver container—point field stations or relays at `seedlink:18000` inside the compose network.

## Realtime sockets used by the frontend
- Socket.IO: `/socket.io` on port 4000. Emit `waveform` with a channel (e.g., `PP.PPL01.BHZ`); server responds on `data-{channel}` with synthetic waveform arrays.
- Plain WS: `/wsevent` (mock events), `/wspicking` (mock picks), `/wsarrivalpick` (mock arrivals).

## Seed data
- Default admin: `user_bmkg` / `superadmin123` (assigned all stations on startup).
- Stations: seeded with BHZ/SHZ-friendly channels (includes BHZ for trace-view).
- JSON dataset import (events/origins/arrivals/picks):  
  ```bash
  pnpm exec node --experimental-specifier-resolution=node scripts/import_json_baru.js
  ```
  Files live in `jsonBaru/`; imported events span ~Aug 2024–Oct 2025.

## Mongo access tips (Windows + WSL)
- Mongo is published to host port 27017. From Windows, use your WSL IP (e.g., `172.21.x.x`):  
  `mongodb://172.21.x.x:27017/tews?directConnection=true` (no auth, TLS off).
- Collections: `events`, `origins`, `arrivals`, `picks`, `stations`, `users`.
