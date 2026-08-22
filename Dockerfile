# Dayflow HRMS - Multi-Stage Container Dockerfile
# Stage 1: Build Frontend Assets
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# Stage 2: Production Server Runtime
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV JWT_SECRET=dayflow_production_jwt_secure_key_2026

# Copy Root & Server package manifests
COPY package*.json ./
COPY server/package*.json ./server/

# Install production dependencies
RUN npm --prefix server install --only=production

# Copy Server Source Code & Initial Database
COPY server/ ./server/

# Copy Compiled Frontend Static Dist Assets into Client directory
COPY --from=frontend-builder /app/client/dist ./client/dist

# Expose HTTP Port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start Dayflow HRMS Fullstack Server
CMD ["node", "server/src/index.js"]
