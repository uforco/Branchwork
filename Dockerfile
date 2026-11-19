# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:24 AS builder

WORKDIR /app

# Install deps
RUN npm install -g pnpm@latest
RUN corepack enable

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Appliction deps
RUN pnpm install --frozen-lockfile

# Copy prisma folder
COPY prisma ./prisma
COPY prisma7.config.ts ./

COPY . .

RUN pnpm exec prisma generate

RUN pnpm build

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
