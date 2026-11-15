# Hind DB - Sovereign Fullstack Production Dockerfile (Railway & Cloud Native)
# Node 22 Debian Slim Image (glibc compatible, prebuilt binaries for argon2/oxlint)
FROM node:22-slim AS builder

WORKDIR /app

# Optimize npm memory & network resilience for low-memory container builders
ENV NODE_OPTIONS="--max-old-space-size=1536"
ENV npm_config_audit=false
ENV npm_config_fund=false

# Install dependencies (respecting lockfile)
COPY package*.json ./
RUN npm ci --no-audit --no-fund --prefer-offline

# Copy full source tree (excluding items in .dockerignore)
COPY . .

# Build Vite frontend production bundle
RUN npm run build

# Prune development dependencies to keep production image ultra-lightweight
RUN npm prune --omit=dev --no-audit --no-fund

# Production Runner Stage
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Copy node_modules and production artifacts directly from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/sdk ./sdk

# Expose Default Service Port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 4000) + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))" || exit 1

# Start Server
CMD ["node", "server/index.js"]
