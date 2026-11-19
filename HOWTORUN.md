# How to run Branchwork

## 1. Project overview

Branchwork is a NestJS REST API for organizations, staff, branches, access roles and permissions, and products. It uses PostgreSQL through Prisma ORM and issues JWT bearer tokens for permission-protected routes.

## 2/3. Documentation
- [API Documentation](./API_Document.md)


Other notable packages include `@nestjs/config`, `@nestjs/jwt`, `@nestjs/swagger`, `argon2`, `class-validator`, `class-transformer`, and Jest.

## 4. Project layout

```text
src/
  auth/                 Registration, login, JWT guard, permission decorator, user decorator
  access-role/          Role and permission endpoints and services
  branch/               Branch endpoints and services
  staff/                Staff endpoints and services
  products/             Product endpoints, filters, and services
  config/db-prisma/      Shared Prisma client using the PostgreSQL adapter
  config/swagger/        Swagger/OpenAPI setup
  lib/encrypted-password/ Argon2 password hashing and verification
  lib/rbac-permission-cache/ In-memory permission map
  app.module.ts          Root module and global AuthGuard registration
  main.ts                Application bootstrap
prisma/
  schema.prisma          Prisma generator and PostgreSQL provider
  models/                Split Prisma model declarations
  migrations/            SQL migration history
  seed.ts                Upserts permission catalog records
  initData.json          Permission catalog seed data
prisma7.config.ts        Prisma schema, migrations, seed, and datasource URL config
Dockerfile               Multi-stage API image definition
compose.yml              PostgreSQL-only Compose service
```

## 5. Install dependencies

From the project root:

```bash
pnpm install
```

The repository does not declare a `packageManager` field or a required pnpm version. Use a pnpm release compatible with the committed lockfile.

## 6. Environment configuration

The code reads these variables:

| Variable | Used for | Required/configured behavior |
| --- | --- | --- |
| `DATABASE_URL` | Prisma CLI and runtime PostgreSQL adapter | Required. Prisma config reads it from `process.env`; `prisma7.config.ts` imports `dotenv/config`. |
| `JWT_SECRET` | JWT signing and verification | Required for token signing/verification. JWT expiry configured at registration is one day; login signs tokens for six hours. |
| `PORT` | Nest HTTP listener | Optional; defaults to `3000`. |
| `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | PostgreSQL Compose container mapping and initialization | Used only by `compose.yml`; these are not used by the application to construct `DATABASE_URL`. |

`.env.example` contains the variable names but leaves values blank. Set actual values in a local `.env` file (do not commit secrets). `DATABASE_URL` must be a PostgreSQL connection string, for example:

```dotenv
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<database>?schema=public"
JWT_SECRET="<long-random-secret>"
PORT=3000
DB_PORT=5432
DB_USERNAME=<user>
DB_PASSWORD=<password>
DB_NAME=<database>
```

The connection string example is a template: replace the placeholders with the same credentials/database configured for PostgreSQL. The provided example file does not supply a connection string or a JWT secret.

## 7. PostgreSQL setup

### Local PostgreSQL

Create a PostgreSQL database and role using your PostgreSQL installation, then set `DATABASE_URL` to the matching connection string. Keep `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, and `DB_NAME` aligned if you also use the Compose service.

### Docker Compose database

`compose.yml` starts only PostgreSQL 17; it does not start the API. It reads the four `DB_*` variables from the shell or project `.env` file.

```bash
docker compose up -d db
docker compose logs -f db
```

Set `DATABASE_URL` for the host API to connect, typically using `localhost` and the published `DB_PORT`. To stop the service, run `docker compose down`. Database data is kept in the named `pgdata` volume.

## 8. Prisma configuration and database setup

Prisma 7 configuration is in `prisma7.config.ts`. It points to the `prisma/` schema directory, stores migrations in `prisma/migrations`, configures `tsx prisma/seed.ts` as the seed command, and reads the datasource URL from `DATABASE_URL`. The Prisma schema declares PostgreSQL and generates the client into `prisma/generated`. Runtime database access uses `@prisma/adapter-pg` and the generated client.

After setting `DATABASE_URL` and starting PostgreSQL, generate the client and apply the checked-in migrations:

```bash
pnpm prisma:generate
pnpm prisma:deploy
```

The equivalent Prisma commands are `pnpm exec prisma generate` and `pnpm exec prisma migrate deploy`. For local development, Prisma's development migration command is available directly:

```bash
pnpm exec prisma migrate dev
```

`migrate dev` may create or change migration files and database state; use it only when intentionally developing a schema change. This project already contains migrations, so a clean database setup should use `migrate deploy`.

## 9. Seed data

The seed command is:

```bash
pnpm prisma:seed
```

It upserts the permission keys from `prisma/initData.json`, including `owner.all`, user, role, permission, branch, and product permissions. It does not create organizations, users, roles, or branches. Apply migrations and seed the permission catalog before creating the first organization: registration expects the `owner.all` permission to exist.

## 10. Start in development

```bash
pnpm start:dev
```

The API listens on `PORT`, or port `3000` when unset. The `start` script runs Nest without watch mode. No global prefix is configured.

## 11. Production build and startup

Build the application:

```bash
pnpm build
```

The package's `start:prod` command runs migrations, runs the seed, and then starts `node dist/src/main`:

```bash
pnpm start:prod
```

This script requires a reachable database and valid environment variables. It runs migrations and the seed on every invocation. The command uses `npx prisma db seed`; the package is installed locally by the project setup.

## 12. Docker

The repository includes a multi-stage `Dockerfile` and a Compose file for PostgreSQL. Compose does not define an API service. The Dockerfile builds with Node 24 and runs on Node 22 Alpine; it installs pnpm in the builder stage, but the production stage invokes `pnpm start:prod` without installing pnpm there. As written, container startup may fail because `pnpm` is not present in the runtime image. Configure the documented environment variables when building/running the API image and ensure the database hostname is reachable from the container; the host value `localhost` inside an API container refers to that container, not the Compose database service.

## 13. Swagger / API docs

Swagger is configured at:

```text
http://localhost:3000/docs
```

Change `3000` when `PORT` is set. The generated document advertises bearer authentication across every path, including routes that the global guard currently leaves public; use the route decorators and runtime behavior as the source of truth for access requirements.

## 14. Useful scripts

| Script | Command | Purpose |
| --- | --- | --- |
| `build` | `pnpm build` | Compile with Nest CLI |
| `start` | `pnpm start` | Start without watch mode |
| `start:dev` | `pnpm start:dev` | Watch-mode development server |
| `start:debug` | `pnpm start:debug` | Watch mode with Node inspector |
| `start:prod` | `pnpm start:prod` | Deploy migrations, seed, start compiled app |
| `prisma:generate` | `pnpm prisma:generate` | Generate Prisma client |
| `prisma:deploy` | `pnpm prisma:deploy` | Apply migrations in deploy mode |
| `prisma:seed` | `pnpm prisma:seed` | Seed permission catalog |
| `test` | `pnpm test` | Run unit tests |
| `test:e2e` | `pnpm test:e2e` | Run configured e2e tests |
| `test:cov` | `pnpm test:cov` | Run tests with coverage |
| `lint` | `pnpm lint` | Run ESLint with `--fix` (can modify source files) |
| `format` | `pnpm format` | Run Prettier with `--write` (can modify source files) |

## 15. Troubleshooting

- **Prisma cannot find a datasource URL:** Set `DATABASE_URL`. `DB_PORT` and the other `DB_*` variables do not substitute for it.
- **Database connection refused:** Confirm PostgreSQL is running, the port is published, credentials/database match, and the hostname is reachable from the process making the connection.
- **Organization registration reports missing owner permission:** Run migrations and `pnpm prisma:seed` before calling registration.
- **JWT signing/verification fails:** Set the same non-empty `JWT_SECRET` for the API process. Login tokens are signed for six hours.
- **A permission-protected endpoint returns 403 immediately after restart:** Permissions are held in a process-local in-memory map and populated at login. Log in again; the cache is not persisted and is not populated from the database in the guard.
- **Container cannot start `pnpm`:** The current Dockerfile installs pnpm only in the builder stage, but its production command calls `pnpm start:prod`.
- **Request DTO rules appear not to validate input:** The DTOs have `class-validator` decorators, but `src/main.ts` does not register a global `ValidationPipe`.
