# Setup

You need: a Mac, Windows or Linux laptop, a browser, and about 15 minutes.

## 1. Install the tools

1. **Node.js 22 or newer** — download from https://nodejs.org and check with `node -v`.
2. **pnpm** — after Node is installed run:
   ```bash
   npm install -g pnpm
   ```
3. **Git** — https://git-scm.com (check with `git --version`).

## 2. Get the code and install

```bash
git clone <the repository link you were given>
cd hinton-expenses
pnpm install
```

## 3. Connect the database (Neon)

The app stores data in a Neon Postgres database.

1. Copy the example settings file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env`. Paste your Neon connection string after `DATABASE_URL=`.
   (Neon dashboard → your project → **Connect** → copy the connection string.)
   If you were given a shared string in class, use that one.
3. Change `BETTER_AUTH_SECRET` to any long random text.

`.env` is private and is never committed to git.

## 4. Create the tables

```bash
pnpm db:migrate
```

(Only the first person using a database needs this. If the tables already exist, it does nothing.)

## 5. Start everything

```bash
pnpm dev
```

- Web app: http://localhost:5173
- API: http://localhost:3001

Press Ctrl+C once to stop both. A short "exited" line is normal.

## 6. Sign up

Open http://localhost:5173, click **Create a login**, and sign up with any email and a password of 8+ characters.
Your first sign-in fills your account with sample transactions. Everyone sees only their own data.

## Useful commands

| Command | What it does |
|---|---|
| `pnpm dev` | Runs the web app and the API together |
| `pnpm test` | Runs the unit tests |
| `pnpm typecheck` | Checks the TypeScript |
| `pnpm db:generate` | Creates a new migration after you change `packages/db/src/schema.ts` |
| `pnpm db:migrate` | Applies migrations to your database |
| `pnpm db:seed` | Creates a demo login (`demo@hinton.test`) with sample data |

## Where things are

```
apps/api        The server: routes -> services -> repositories
apps/web        The React app (all server calls are in src/api/client.ts)
packages/db     Database tables, migrations, sample data
packages/shared Types and validation shared by web and api
tickets/        Your tickets
samples/        A sample CSV to try the importer
```

## Problems?

- `DATABASE_URL is missing` → step 3.
- Port already in use → close the other terminal running `pnpm dev`.
- Sign-up says "Invalid origin" → open the app at exactly `http://localhost:5173`.
