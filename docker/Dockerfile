# Dayflow HRMS - Standalone Dockerfile (inside docker/ folder)
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV JWT_SECRET=dayflow_production_jwt_secure_key_2026

COPY package*.json ./
COPY server/package*.json ./server/

RUN npm --prefix server install --only=production

COPY server/ ./server/
COPY --from=frontend-builder /app/client/dist ./client/dist

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "server/src/index.js"]
