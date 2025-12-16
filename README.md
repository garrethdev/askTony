# AskTony API (Node.js + TypeScript)

Lean, modular REST API built with Express, pg, and Zod.

## Requirements

- Node.js 20+
- Postgres 14+

## Setup

```bash
npm install
cp .env.example .env   # fill in values
npm run migrate        # run SQL migrations
npm run dev            # start in watch mode
```

## Environment

`src/config/env.ts` validates variables with Zod.

- `DATABASE_URL` - Postgres connection string
- `JWT_SECRET` - at least 32 chars
- `BCRYPT_ROUNDS` - integer (default 10)
- `PORT` - default 3000
- `NODE_ENV` - development | test | production

## Scripts

- `npm run dev` - start server with tsx watch
- `npm run build` - compile to `dist/`
- `npm run start` - run compiled server
- `npm run migrate` - apply SQL migrations
- `npm run lint` / `npm run lint:fix`
- `npm run format` / `npm run format:fix`
- `npm test` - run Vitest suite

## Migrations

Migrations live in `src/db/migrations`. The runner reads and executes them in order:

```bash
npm run migrate
```

## Tests

```bash
npm test
```

## Example cURL

```bash
# Signup
curl -X POST http://localhost:3000/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'

# Authenticated profile (replace TOKEN)
curl http://localhost:3000/v1/profile \
  -H "Authorization: Bearer TOKEN"
```

