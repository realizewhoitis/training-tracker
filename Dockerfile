# 1. Base image
FROM node:18-alpine AS base

# 2. Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# 3. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# 4. Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a group and user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copy prisma directory for SQLite DB access
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# Copy uploads directory structure ensures it exists
COPY --from=builder --chown=nextjs:nodejs /app/uploads ./uploads

USER nextjs

EXPOSE 3000
ENV PORT=3000
# Ensure hostname is set to 0.0.0.0
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
