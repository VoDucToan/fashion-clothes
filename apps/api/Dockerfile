# syntax=docker/dockerfile:1

# ---------- base: pnpm on a slim Node runtime ----------
FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable
WORKDIR /app

# ---------- deps: install once, cached until the lockfile changes ----------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ---------- build: generate Prisma Client, compile TypeScript ----------
FROM deps AS build
COPY . .
RUN pnpm build

# ---------- runner: production dependencies + compiled output only ----------
FROM base AS runner
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/dist ./dist
# Migrations travel with the image so `prisma migrate deploy` can run from CI
# or a one-off container against the same schema version.
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
USER node
EXPOSE 4000
CMD ["node", "dist/main"]
