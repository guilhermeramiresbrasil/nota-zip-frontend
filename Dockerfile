# Stage 1: Build
FROM oven/bun:1.3.13-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy shared crypto package
COPY --from=crypto . /packages/nota-zip-crypto
RUN sed -i 's#"@notazip/crypto": "[^"]*"#"@notazip/crypto": "file:../../packages/nota-zip-crypto"#g' package.json

# Add missing dependencies
RUN sed -i 's#"dependencies": {#"dependencies": {\n    "@stripe/stripe-js": "^2.0.0",\n    "@stripe/react-stripe-js": "^2.0.0",#' package.json

# Install dependencies
RUN rm -f bun.lock && bun install

# Copy source code
COPY . .

# Copy env file for build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build the application
RUN echo "NEXT_PUBLIC_API_URL is: $NEXT_PUBLIC_API_URL" && rm -rf .next && bun run build

# Stage 2: Run
FROM oven/bun:1.3.13-alpine AS runner

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Copy shared crypto package
COPY --from=crypto . /packages/nota-zip-crypto
RUN sed -i 's#"@notazip/crypto": "[^"]*"#"@notazip/crypto": "file:../../packages/nota-zip-crypto"#g' package.json

# Install production dependencies only
RUN rm -f bun.lock && bun install --production

# Copy built application from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Start the application
CMD ["bun", "run", "start"]
