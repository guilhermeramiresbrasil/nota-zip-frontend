# Stage 1: Build
FROM oven/bun:1.3.13-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Stage 2: Run
FROM oven/bun:1.3.13-alpine AS runner

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN bun install --production

# Copy built application from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

# Expose port
EXPOSE 3000

# Start the application
CMD ["bun", "run", "start"]
