# Stage 1: Build UI with Node.js to avoid Bun compatibility issues
FROM node:20-slim AS ui-builder
WORKDIR /app/ui
COPY ui/package.json ./
# npm install will generate a lockfile since we only have bun.lock
RUN npm install
COPY ui/ .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 2: Runtime & CLI Build
FROM oven/bun:1.2.2 AS runner
WORKDIR /app

# Copy root dependencies
COPY package.json bun.lock ./
RUN bun install

# Copy source code
COPY . .

# Copy built UI from Stage 1
# The build script expects UI assets in dist/ui
COPY --from=ui-builder /app/ui/out ./dist/ui

# Build the CLI/Server binary
RUN bun build bin/index.ts --outfile dist/index.js --target bun

# Expose ports
EXPOSE 5555
EXPOSE 5556

# Production environment
ENV NODE_ENV=production

# Run the compiled binary
CMD ["bun", "dist/index.js"]
