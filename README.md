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

## API docs (Swagger)
- Start the server and open `http://localhost:3000/docs` for Swagger UI, or fetch `http://localhost:3000/docs.json` for the raw spec.

## API functions
- Auth (`/v1/auth`): signup, login for JWT, stateless logout, and `/auth/session` to return the current user.
- Profile & settings: `/profile` get/update nickname, username, avatar, timezone; `/settings` read reminder flags; `/settings/reminders` toggles meal/body-check-in reminders.
- Catalog (`/v1/catalog`): list tag catalog and static onboarding option keys.
- Onboarding (`/v1/onboarding`): read onboarding state and update main reason, main challenges, and eating pattern, then mark onboarding complete.
- Cohorts (`/v1/cohort`): fetch the user’s current cohort and list members.
- Meal scans (`/v1/meal-scans`): create a scan placeholder, fetch one, list with cursors, request an upload URL, run analysis, and delete.
- Meals (`/v1/meals`): create meals from a scan or manually, fetch one, list with filters (date/search, cursor pagination), and delete.
- Scoring (`/v1/scoring`): score a manual meal payload and compare a meal or scan’s score to a user/baseline cohort window.
- Body check-ins (`/v1/body-checkins/:date`): upsert or fetch a day’s energy-level check-in.
- Progress (`/v1/progress`): summary stats (average score, best day, log frequency, insight) and calendar daily scores for a month.
- Weight (`/v1/weight`): get/upsert goal weight and add/list weight entries.
- Community (`/v1/community`): list/create/delete weekly reflections, list community meals, view a weekly leaderboard, add/remove “support” reactions, and view a public profile by username.

## Testing
```bash
npm test
npm run test:coverage   # runs with coverage gates (60% lines/statements, 50% branches, 25% functions)
```

- CI runs tests with coverage on pushes/PRs to `main` and `develop`. Coverage reports are uploaded as artifacts.

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

