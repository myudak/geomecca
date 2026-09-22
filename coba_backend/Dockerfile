FROM node:20-bookworm-slim AS base
WORKDIR /app

# System deps for native/wasm modules and fonts
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    python3 \
    build-essential \
    fontconfig \
    fonts-dejavu \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies first (better layer caching)
COPY coba_backend/package*.json ./
RUN npm install

# Copy source
COPY coba_backend/. .

# Ensure mount point exists (will be overridden by volume if provided)
RUN mkdir -p /data/mseed

# Startup script seeds data then starts the server
RUN chmod +x /app/start.sh

EXPOSE 4000
CMD ["/app/start.sh"]
