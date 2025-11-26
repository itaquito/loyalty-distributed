FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json tsconfig.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY db/ ./db/
COPY business/ ./business/
COPY customer/ ./customer/
COPY transaction/ ./transaction/

# Build TypeScript
RUN npm run build

# Production stage
FROM node:24-alpine

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled code from builder
COPY --from=builder /app/dist ./dist

ENV PORT=8080

EXPOSE $PORT

CMD ["node", "dist/customer/cmd/main/main.js"]
