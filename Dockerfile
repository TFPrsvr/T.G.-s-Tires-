# Multi-stage Docker build for production deployment with security hardening
# Base image with specific version for security
FROM node:18.19.0-alpine AS base

# Security: Install security updates and create non-root user
RUN apk update && apk upgrade && \
    apk add --no-cache libc6-compat dumb-init && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Dependencies stage
FROM base AS deps

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies with npm ci for reproducible builds
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS builder

WORKDIR /app

# Copy package files and install all dependencies (including dev)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build the application
RUN npm run build

# Production runtime stage
FROM base AS runner

WORKDIR /app

# Security: Set production environment
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Security: Create app directory and set proper ownership
RUN mkdir .next && chown nextjs:nodejs .next

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Security: Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Expose port
EXPOSE 3000

# Security: Set proper process signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]