FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies first (better layer caching)
COPY coba_backend/package*.json ./
RUN npm install

# Copy source
COPY coba_backend/. .

# Build
RUN npm run build

EXPOSE 4000
CMD ["node", "dist/index.js"]

