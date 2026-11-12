# Multi-stage production build for Naatukoottam NestJS API
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root dependency manifests
COPY package*.json ./
RUN npm ci

# Copy nx configuration, prisma schema and API source
COPY nx.json tsconfig.base.json ./
COPY prisma ./prisma
COPY apps/api ./apps/api

# Generate Prisma Client and compile API
RUN npx prisma generate
RUN npx nx build api --configuration=production

# Production runner stage
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy manifests and install production-only dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled Prisma client and built backend
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist/apps/api ./dist/apps/api

EXPOSE 3000

CMD ["node", "dist/apps/api/main.js"]

