FROM node:20-bullseye-slim AS base
WORKDIR /app

# System deps for native/wasm modules and fonts
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    python3 \
    build-essential \
    fontconfig \
    fonts-dejavu \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies first (better layer caching)
COPY coba_backend/package*.json ./
RUN npm install

# Copy source
COPY coba_backend/. .

# Ensure mount point exists (will be overridden by volume if provided)
RUN mkdir -p /data/mseed

EXPOSE 4000
CMD ["npx", "tsx", "src/index.ts"]
