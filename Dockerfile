# =================================================================
# Stage 1: Build & Compile TypeScript Monorepo
# =================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace configurations and package files
COPY package*.json tsconfig.base.json ./
COPY packages/core/package*.json ./packages/core/
COPY packages/mcp/package*.json ./packages/mcp/
COPY packages/skills/package*.json ./packages/skills/
COPY packages/cli/package*.json ./packages/cli/
COPY apps/gateway/package*.json ./apps/gateway/

RUN npm ci

# Copy sources
COPY packages/ ./packages/
COPY apps/ ./apps/

# Build all workspace packages
RUN npm run build --workspaces

# =================================================================
# Stage 2: Production Runtime
# =================================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Install production dependencies only
COPY package*.json ./
COPY packages/core/package*.json ./packages/core/
COPY packages/mcp/package*.json ./packages/mcp/
COPY packages/skills/package*.json ./packages/skills/
COPY packages/cli/package*.json ./packages/cli/
COPY apps/gateway/package*.json ./apps/gateway/

RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled JavaScript and configuration files
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/core/src/config ./packages/core/src/config
COPY --from=builder /app/apps/gateway/dist ./apps/gateway/dist

# Create state directory for persistent quota snapshots
RUN mkdir -p /app/state && chown -R node:node /app

# Switch to non-root user for security
USER node

EXPOSE 3000

# Start server
CMD ["node", "apps/gateway/dist/index.js"]
