# 1. Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY frontend/package.json frontend/package-lock.json ./

RUN npm ci

# Copy all files
COPY frontend/ .
RUN npm run build

# 2. Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules/     
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.mjs ./    
COPY --from=builder /app/next-env.d.ts ./    
COPY --from=builder /app/tailwind.config.ts ./
COPY --from=builder /app/postcss.config.mjs ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/src ./src

EXPOSE 3000

CMD ["npx", "next", "start"]
