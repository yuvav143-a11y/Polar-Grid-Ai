FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy application source
COPY . .

# Build Vite client and esbuild server
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install runtime production dependencies
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy built artifacts and data directory from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data
COPY --from=builder /app/server ./server

# Expose port
EXPOSE 3000

# Start production server
CMD ["node", "dist/server.cjs"]
