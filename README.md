# AskTony API

Lean Node.js + TypeScript REST API with Express, Postgres (pg), Zod validation, and Vitest tests.

## Stack
- Express, Zod, pg (no ORM)
- JWT auth (jsonwebtoken), bcrypt
- ESLint + Prettier, Vitest
- Cursor pagination helpers

## Quick start
```bash
npm install
cp .env.example .env   # set values
npm run migrate        # apply SQL migrations
npm run dev            # start http://localhost:3000
```

## Environment (Zod-validated)
- `DATABASE_URL` Postgres connection string
- `JWT_SECRET` min 32 chars
- `BCRYPT_ROUNDS` default 10
- `PORT` default 3000
- `NODE_ENV` development | test | production

## Scripts
- `npm run dev`  start in watch mode
- `npm run build` compile to `dist/`
- `npm start`    run compiled server
- `npm run migrate` apply SQL in `src/db/migrations`
- `npm run lint` / `npm run lint:fix`
- `npm run format` / `npm run format:fix`
- `npm test`     run Vitest

## Testing
```bash
npm test
```

## Sample API calls
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

