FROM node:20-alpine AS base
WORKDIR /app

# System deps for native/wasm modules and fonts
# Alpine uses apk (no dpkg/lzma memory issue on Docker 20.10.x)
RUN apk add --no-cache \
    ca-certificates \
    python3 \
    py3-pip \
    make \
    g++ \
    vips-dev \
    fontconfig \
    ttf-dejavu \
    font-noto \
    netcat-openbsd

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
