# Fashion Clothes — API

NestJS 12 (ESM) · Prisma 7 · PostgreSQL 18 · Zod · Vitest

Backend for the e-commerce project described in [`docs/lo-trinh-3-du-an-portfolio.md`](../../docs/lo-trinh-3-du-an-portfolio.md).

---

## Getting started

```bash
# 1. Database (from the repo root)
cp .env.example .env          # POSTGRES_USER / PASSWORD / DB
docker compose up -d postgres

# 2. API
cd apps/api
cp .env.example .env          # set DATABASE_URL to match the compose credentials
pnpm install
pnpm db:generate              # generate Prisma Client into src/generated
pnpm start:dev
```

- API: <http://localhost:4000/api/v1>
- Swagger: <http://localhost:4000/docs>
- Liveness: `GET /api/v1/health/live` · Readiness: `GET /api/v1/health/ready`

## Scripts

| Script | What it does |
|---|---|
| `pnpm start:dev` | Watch mode |
| `pnpm build` | `prisma generate` (via `prebuild`) then compile to `dist/` |
| `pnpm start:prod` | Run the compiled app |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | oxlint |
| `pnpm format` | Prettier |
| `pnpm test` / `pnpm test:e2e` | Unit specs (`*.spec.ts`) / HTTP specs (`test/*.e2e-spec.ts`) |
| `pnpm db:migrate` | Create + apply a migration in development |
| `pnpm db:deploy` | Apply pending migrations (CI / production) |
| `pnpm db:studio` | Browse data |
| `pnpm db:seed` | Seed development data |

---

## Structure

```
apps/api
├── prisma/
│   ├── schema.prisma          # models — the source of truth for the database
│   ├── migrations/            # generated SQL, committed, applied in order
│   └── seed.ts                # idempotent development data
├── prisma.config.ts           # Prisma 7 CLI config (datasource URL, seed command)
├── src/
│   ├── main.ts                # bootstrap: helmet, cookies, CORS, prefix, versioning, Swagger
│   ├── app.module.ts          # root wiring: which modules exist, which globals are on
│   ├── bootstrap/             # things main.ts delegates to (Swagger setup)
│   ├── config/                # env schema (Zod) + typed config object
│   ├── common/                # cross-cutting, framework-level, no business logic
│   │   ├── decorators/        # @ZodBody / @ZodQuery / @ZodParam
│   │   ├── dto/               # shared contracts (pagination)
│   │   ├── filters/           # AllExceptionsFilter — one error shape for the API
│   │   ├── guards/            # JwtAuthGuard, RolesGuard (added with auth)
│   │   ├── interceptors/      # request logging with duration
│   │   ├── middleware/        # request id
│   │   └── pipes/             # ZodValidationPipe
│   ├── infra/                 # adapters to the outside world
│   │   └── prisma/            # PrismaService + PrismaModule
│   ├── modules/               # one folder per business capability
│   │   ├── health/            # implemented
│   │   ├── auth/  users/      # to build
│   │   ├── catalog/  cart/    # to build
│   │   └── orders/  payments/ # to build
│   └── generated/prisma/      # Prisma Client (git-ignored, regenerated)
└── test/                      # e2e specs — boot the real app over HTTP
```

### Why the layers are split this way

**`config/` — environment in, typed object out.**
`env.schema.ts` is the only file that reads `process.env`. It is a Zod schema, so a
missing `DATABASE_URL` or a non-numeric `PORT` crashes the process at boot with a
readable message instead of producing `undefined` inside a query at 3am.
`configuration.ts` reshapes those flat variables into `http.*`, `database.*`,
`swagger.*`, and everything else asks `ConfigService` for those keys.

**`common/` — code every feature may use, that knows nothing about any feature.**
The test for whether something belongs here: could you copy it into a different
NestJS project unchanged? A pagination DTO, an exception filter, a validation
pipe — yes. `OrderStatusService` — no.

**`infra/` — the outside world behind an interface.**
Postgres today; Redis, S3/R2 and BullMQ land here as separate folders later. Feature
modules depend on `PrismaService`, never on `pg` or a connection string, so swapping
or mocking infrastructure touches one folder.

**`modules/` — the part that actually describes the business.**
One folder per capability (`catalog`, `cart`, `orders`), not per technical type. All
the code for a feature sits together, and a module's `imports` list states exactly
what it depends on. This is the difference between a codebase you can grow and a
`services/` folder with 40 files in it.

**`main.ts` + `bootstrap/` — the process, not the domain.**
Everything that happens once at startup. Note the order: security headers first,
then cookies, then CORS, then routing.

### Anatomy of a feature module

```
modules/catalog/
├── catalog.module.ts          # wiring: imports, controllers, providers, exports
├── catalog.controller.ts      # HTTP only: parse input, call service, return data
├── catalog.service.ts         # business rules — the part worth unit-testing
├── catalog.repository.ts      # (optional) Prisma queries, when they get complex
├── dto/
│   ├── create-product.dto.ts  # Zod schema + inferred type
│   └── list-products.dto.ts
└── catalog.service.spec.ts    # unit test next to the code it tests
```

Scaffold with the CLI instead of copying files by hand:

```bash
pnpm exec nest g module modules/catalog
pnpm exec nest g controller modules/catalog --flat
pnpm exec nest g service modules/catalog --flat
```

The division of labour that keeps this maintainable:

- **Controller** — HTTP. Validates input with a Zod schema, returns what the service
  gives back. No `if` about business rules, no Prisma calls.
- **Service** — the rules: stock checks, price calculation, state transitions,
  transactions. Knows nothing about HTTP, so it can be tested without a server and
  reused from a queue worker or a cron job later.
- **Module** — the contract: what this feature needs (`imports`) and what it lets
  others use (`exports`).

---

## Conventions

**ESM with explicit extensions.** The project is `"type": "module"` with
`moduleResolution: nodenext`, so every relative import ends in `.js` even though the
file is `.ts`:

```ts
import { PrismaService } from '../../infra/prisma/prisma.service.js';
```

That is the Node ESM rule, not a typo — the extension refers to the compiled output.

**Validation with Zod, not class-validator.** The frontend already validates forms
with Zod + react-hook-form. Keeping one schema language means a rule like "quantity
is an integer ≥ 1" can eventually live in a shared package instead of being written
twice and drifting apart.

```ts
export const addToCartSchema = z.object({
  variantId: z.uuid(),
  quantity: z.coerce.number().int().min(1).max(10),
});
export type AddToCartDto = z.infer<typeof addToCartSchema>;

@Post('items')
addItem(@ZodBody(addToCartSchema) dto: AddToCartDto) {
  return this.cartService.addItem(dto);
}
```

The pipe returns the *parsed* value: strings coerced to numbers, unknown keys
stripped, `dto` fully typed.

**One error shape.** Any failure — thrown `HttpException`, unknown route, unhandled
crash — leaves the API in the same envelope, so the Next.js side writes one parser:

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Cannot GET /api/v1/nope",
  "path": "/api/v1/nope",
  "requestId": "a112d408-bbf1-41af-9e34-447849ca45b3",
  "timestamp": "2026-09-15T07:20:14.660Z"
}
```

Unexpected errors log their stack server-side and return a generic message —
database errors, SQL and file paths never reach the client.

**Request id everywhere.** Every request gets an `x-request-id` (reused if the caller
sent one). It appears in the access log, in error logs and in the error body, so a
user's screenshot leads straight to the right log line.

**Global prefix + versioning from day one.** Routes are `/api/v1/...`. Adding `v2`
later costs one decorator instead of a URL migration. Note `globalPrefix` is
`'/api'` **with** the leading slash — without it, Nest's not-found handler is never
reached and unknown routes fall back to Express' HTML 404 instead of the envelope.

**Filters and interceptors are providers,** registered with `APP_FILTER` /
`APP_INTERCEPTOR` in `app.module.ts` rather than `app.useGlobalFilters()`, so they
can inject dependencies (a config value, a logger, later a Sentry client).

**`PrismaModule` is not global.** A module that needs the database imports it. The
import list is then a real dependency graph instead of a lie.

**Liveness ≠ readiness.** `/health/live` must never touch Postgres: if it did, a
database blip would make Docker restart healthy API containers and make the outage
worse. `/health/ready` is what a load balancer uses to decide whether to send
traffic.

---

## Database workflow

```bash
# 1. edit prisma/schema.prisma
# 2. create + apply a migration and regenerate the client
pnpm db:migrate --name add_product_variants
# 3. commit prisma/migrations/** together with the schema change
```

Prisma 7 specifics worth knowing: the datasource URL lives in `prisma.config.ts`
(no more `env()` in the schema), and the client talks to Postgres through the
`@prisma/adapter-pg` driver adapter, whose pool size is set in `PrismaService`.
Keep `max` × number of API instances below Postgres' `max_connections`.

## Docker

```bash
docker build -t fashion-clothes-api .
docker run --rm -p 4000:4000 -e DATABASE_URL=... fashion-clothes-api
```

Multi-stage: dependencies → build (`prisma generate` + `tsc`) → a runtime image with
production dependencies and `dist/` only, running as the non-root `node` user.
Migrations are not run at container start — apply them from CI with `pnpm db:deploy`
before rolling out, so two instances starting at once cannot migrate concurrently.

## What to add next

| When you build | Add |
|---|---|
| Auth | `modules/auth` (JWT access + rotating refresh cookie), `common/guards`, `@nestjs/throttler` on login |
| Cart / rate limiting / stock reservation | `infra/redis` + a Redis service in `docker-compose.yml` |
| Product images | `infra/storage` (S3/R2 presigned uploads) |
| Payment webhooks (VNPay/MoMo) | `modules/payments` + a raw-body route for signature verification |
| Background jobs | `infra/queue` (BullMQ) and a separate worker entrypoint |
| Production logging | `nestjs-pino` for structured JSON logs carrying the request id |
