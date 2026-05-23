# =========================
# 1. Base stage
# =========================
FROM node:22-alpine AS base

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

# =========================
# 2. Dependencies stage
# =========================
FROM base AS deps

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci

# =========================
# 3. Production runner
# =========================
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production

# Dummy build-time DATABASE_URL for Prisma generate only.
# The real DATABASE_URL should come from --env-file .env at runtime.
ARG DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummydb"
ENV DATABASE_URL=${DATABASE_URL}

COPY --from=deps /app/node_modules ./node_modules

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src ./src

RUN npx prisma generate

EXPOSE 8084

CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]