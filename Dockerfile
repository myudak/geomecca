# Stage 1: build frontend
FROM node:20-alpine AS build
WORKDIR /app

# Accept build arguments for environment variables
ARG VITE_API_BASE_URL=http://localhost:4000
ARG VITE_SOCKET_IO_BASE_URL=http://localhost:4000
ARG VITE_SOCKET_BASE_URL=ws://localhost:4000
ARG VITE_SOCKET_ALTERNATIVE_BASE_URL=http://localhost:4000
ARG VITE_API_BFF_URL=http://localhost:4000
ARG VITE_API_STREAM_URL=http://localhost:4000
ARG VITE_MAP_HOST=

# Set environment variables for Vite build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SOCKET_IO_BASE_URL=$VITE_SOCKET_IO_BASE_URL
ENV VITE_SOCKET_BASE_URL=$VITE_SOCKET_BASE_URL
ENV VITE_SOCKET_ALTERNATIVE_BASE_URL=$VITE_SOCKET_ALTERNATIVE_BASE_URL
ENV VITE_API_BFF_URL=$VITE_API_BFF_URL
ENV VITE_API_STREAM_URL=$VITE_API_STREAM_URL
ENV VITE_MAP_HOST=$VITE_MAP_HOST

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build   # produces /app/dist

# Stage 2: serve with nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8004
ENTRYPOINT ["nginx", "-g", "daemon off;"]
