<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## 1. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Configure your environment variables in `.env`, especially the database connection URL.

## 2. Database Connection

Ensure your PostgreSQL database is running and the application can successfully connect to it.

## 3. Install Dependencies

Using pnpm:

```bash
pnpm install
```

Or using npm:

```bash
npm install
```

## 4. Prisma Setup

Generate the Prisma Client:

```bash
pnpm exec prisma generate
```

Or using npm:

```bash
npx prisma generate
```

Apply database migrations:

```bash
npx prisma migrate deploy
```

Run database seed:

```bash
npx prisma db seed
```

## 5. Start Development Server

Using pnpm:

```bash
pnpm start:dev
```

The application will start in development mode.

## Run Database with Docker

To start the development database using Docker Compose:

```bash
docker compose --profile dev up -d
```

This command starts the services configured under the `dev` profile in the background.

To check running containers:

```bash
docker compose ps
```

To stop the services:

```bash
docker compose --profile dev down
```

---

## Quick Setup Summary

```bash
# 1. Environment configuration
cp .env.example .env

# 2. Install dependencies
pnpm install

# 3. Start development database
docker compose --profile db up -d

# 4. Generate Prisma Client
pnpm exec prisma generate

# 5. Apply migrations
npx prisma migrate deploy

# 6. Seed database
npx prisma db seed

# 7. Start application
pnpm start:dev
```

# More Details Documentation

- [How to Run Application](./HOWTORUN.md)
- [API Documentation](./API_Document.md)

---

## Contact & Author

**Md Sharif**  
Full Stack Software Engineer (Backend Focused)  
Dhaka, Bangladesh

- **Portfolio:** https://sharifdev.vercel.app
- **Resume:** https://sharifdev.vercel.app/resume.pdf
- **GitHub:** https://github.com/uforco

Feel free to connect with me for collaboration, technical discussions, or project-related opportunities.

---

_Developed and maintained by Md Sharif._
