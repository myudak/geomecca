# Docker Setup Guide - TEWS Full Stack

## Overview

This docker-compose setup runs the complete TEWS (Tsunami Early Warning System) stack:
- **MongoDB** - Database (port 27018 externally, 27017 internal)
- **Backend API** - Express.js + Socket.IO (port 4000)
- **Frontend UI** - Vue 3 + Nginx (port 8005 externally, 8004 internal)

## Quick Start

### Build and Run

```bash
# Build and start all services in detached mode
docker-compose -f docker-compose.full.yml up --build -d

# Check running containers
docker ps

# View logs
docker-compose -f docker-compose.full.yml logs -f

# View specific service logs
docker-compose -f docker-compose.full.yml logs -f backend
docker-compose -f docker-compose.full.yml logs -f frontend
docker-compose -f docker-compose.full.yml logs -f mongo
```

### Stop and Remove

```bash
# Stop all services
docker-compose -f docker-compose.full.yml down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose -f docker-compose.full.yml down -v
```

## Access Points

Once the containers are running:

- **Frontend**: http://localhost:8005
- **Backend API**: http://localhost:4001
- **Backend Health Check**: http://localhost:4001/health
- **MongoDB**: mongodb://localhost:27018/tews (external access)

## Default Credentials

- **Username**: user_geomecca
- **Password**: superadmin123
- **Region**: central

## Architecture

### Network

All services run on the `tews-network` bridge network, allowing them to communicate using service names:
- Backend connects to MongoDB via `mongodb://mongo:27017/tews`
- Frontend built with backend URL as `http://localhost:4001` (for browser access)

### Ports

| Service  | Internal Port | External Port | Notes |
|----------|--------------|---------------|-------|
| MongoDB  | 27017        | 27018         | Avoid conflict with existing MongoDB |
| Backend  | 4000         | 4001          | API + WebSocket (avoids port 4000 conflict) |
| Frontend | 8004         | 8005          | Nginx serving Vue app |

### Volumes

- `mongo_data`: Persistent MongoDB data storage

## Troubleshooting

### Check Container Status

```bash
docker-compose -f docker-compose.full.yml ps
```

### View Real-time Logs

```bash
docker-compose -f docker-compose.full.yml logs -f
```

### Restart a Service

```bash
docker-compose -f docker-compose.full.yml restart backend
docker-compose -f docker-compose.full.yml restart frontend
docker-compose -f docker-compose.full.yml restart mongo
```

### Access Container Shell

```bash
# Backend container
docker exec -it tews-backend sh

# Frontend container
docker exec -it tews-frontend-new sh

# MongoDB container
docker exec -it tews-mongo-new sh
```

### Database Access

```bash
# Connect to MongoDB shell
docker exec -it tews-mongo-new mongosh

# Inside mongosh
use tews
show collections
db.users.find()
db.stations.find()
```

### Common Issues

**Port Already in Use**
If you see "port is already allocated" errors, either:
1. Stop the conflicting service
2. Change the external port in `docker-compose.full.yml`

**Build Fails**
```bash
# Clean rebuild
docker-compose -f docker-compose.full.yml down
docker-compose -f docker-compose.full.yml build --no-cache
docker-compose -f docker-compose.full.yml up -d
```

**Backend Can't Connect to MongoDB**
- Check MongoDB is healthy: `docker-compose -f docker-compose.full.yml logs mongo`
- Ensure MongoDB healthcheck passes before backend starts

**Frontend Shows Connection Errors**
- Verify backend is running: `curl http://localhost:4000/health`
- Check backend logs: `docker-compose -f docker-compose.full.yml logs backend`

## Environment Variables

### Backend (.env configured in docker-compose)

- `PORT=4000`
- `MONGODB_URI=mongodb://mongo:27017/tews`
- `JWT_SECRET=change-me-in-production`
- `DEFAULT_ADMIN_USERNAME=user_geomecca`
- `DEFAULT_ADMIN_PASSWORD=superadmin123`
- `DEFAULT_ADMIN_REGION=central`

### Frontend (build-time args in Dockerfile)

- `VITE_API_BASE_URL=http://localhost:4001`
- `VITE_SOCKET_IO_BASE_URL=http://localhost:4001`
- `VITE_SOCKET_BASE_URL=ws://localhost:4001`

## Production Considerations

For production deployment:

1. **Change Default Credentials**: Update `JWT_SECRET`, admin username/password
2. **Use Production MongoDB**: Point to a production MongoDB cluster
3. **Add Nginx Reverse Proxy**: Use Nginx to proxy both frontend and backend on same domain
4. **Enable HTTPS**: Use Let's Encrypt or your SSL certificate
5. **Resource Limits**: Add CPU/memory limits to docker-compose
6. **Logging**: Configure proper log aggregation (ELK, Loki, etc.)
7. **Monitoring**: Add health checks and monitoring (Prometheus, Grafana)
8. **Backup Strategy**: Regular MongoDB backups

## Development vs Production

This setup is configured for **local testing**. For production:

```yaml
# Production considerations:
environment:
  - NODE_ENV=production
  - JWT_SECRET=${JWT_SECRET}  # Use secrets management
resources:
  limits:
    cpus: '2'
    memory: 2G
restart: always
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## Files

- `docker-compose.full.yml` - Main orchestration file
- `Dockerfile` - Frontend multi-stage build
- `coba_backend/Dockerfile` - Backend build
- `nginx.conf` - Nginx configuration for frontend

Generated by Claude Code on 2025-12-01
