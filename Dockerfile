# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:22 AS builder


WORKDIR /app

# Copy package files
COPY package*.json ./

# RUN pnpm install --frozen-lockfile
# Install deps
RUN npm i -g pnpm@latest && pnpm i

# Copy prisma folder
COPY prisma ./prisma
COPY prisma7.config.ts ./

COPY . .

RUN npm run prisma:generate

RUN npm run build

# ── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:22-alpine3.21 AS production

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma7.config.ts ./prisma7.config.ts


ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "run", "start:prod"]
