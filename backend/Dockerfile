# Multi-stage Dockerfile for backend
FROM node:lts AS build
WORKDIR /app

# Copy manifest(s) first to leverage Docker cache
COPY package.json ./

# Enable corepack and try pnpm, fallback to npm
RUN corepack enable && \
    (if [ -f pnpm-lock.yaml ]; then corepack prepare pnpm@latest --activate && pnpm install --frozen-lockfile --prod; \
     elif [ -f package-lock.json ]; then npm ci --only=production; \
     else npm install --only=production; fi)

# Copy rest of the app
COPY . .

FROM node:lts AS runtime
# Create non-root user
RUN groupadd -g 1001 appgroup && \
    useradd -u 1001 -g appgroup -m -d /app -s /bin/false appuser

WORKDIR /app
COPY --from=build --chown=appuser:appgroup /app ./

ENV NODE_ENV=production \
    NODE_OPTIONS="--enable-source-maps"

USER appuser

EXPOSE 8080
ENTRYPOINT ["node", "server.js"]