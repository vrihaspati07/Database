# Hind DB - Production Multi-Stage Dockerfile
# Base Node 20 LTS Image
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy full repository source
COPY . .

# Build frontend production bundle
RUN npm run build

# Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Copy node modules and built assets
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

# Expose API and Metrics Port
EXPOSE 4000

# Start Express Backend Server
CMD ["node", "server/index.js"]
