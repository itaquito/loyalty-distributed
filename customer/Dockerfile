FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy shared db folder
COPY db ./db

# Copy the services folders
COPY business ./business
COPY transaction ./transaction
COPY customer ./customer

# Install all dependencies (including dev)
RUN npm ci

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
