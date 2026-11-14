# CCI Career Navigator — Database Setup for Teammates

This guide explains how to run the project with **your own local PostgreSQL database**. You do **not** need anyone else's database password.

## How it works

- **GitHub** stores our React/Express code, Prisma schema, migrations, and sample-data script.
- **Your computer** runs its own PostgreSQL database and keeps its own private `.env` file.
- **Our shared cloud development database** is used for approved integration tests, not everyday experiments.

**Important:** Cloning GitHub does not copy someone else's database records. Migrations recreate the tables; the seed script adds sample data.

## 1. Install these tools (one time)

- Git and VS Code
- **Node.js 24 or newer** (required by our current backend `package.json`)
- PostgreSQL, including its command-line tools (or pgAdmin)

Check Node and npm in the VS Code terminal:

```powershell
node -v
npm -v
```

## 2. Get the latest project

If you have **not** cloned it yet:

```powershell
git clone YOUR_REPOSITORY_URL
cd ITSC-3155-CCI-Event-Navigator-Project
```

Replace `YOUR_REPOSITORY_URL` with our actual GitHub URL. If you already have the project, save your work and pull the latest changes from the team's agreed branch instead.

## 3. Install backend packages

From the project folder:

```powershell
cd backend
npm ci
```

**Do not** run `npm init` or `npx prisma init`. The backend and Prisma files are already in the repository.

## 4. Create your local PostgreSQL database

Start PostgreSQL. Open **pgAdmin** or **psql** and create a database named:

```text
cci_career_navigator_dev
```

If using `psql`, run:

```sql
CREATE DATABASE cci_career_navigator_dev;
```

Use your **own** PostgreSQL username and password. If the database already exists, skip creation.

## 5. Make your private `.env` file

While in `backend/`, run in PowerShell:

```powershell
Copy-Item .env.example .env
```

Open `backend/.env` and set `DATABASE_URL` to your local PostgreSQL connection. Example:

```dotenv
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/cci_career_navigator_dev"
```

Replace `YOUR_PASSWORD` and, if necessary, `postgres` with **your own** credentials. If your password contains special URL characters (such as `@` or `#`), URL-encode them in the connection string.

**Never commit or share your `.env` file.** The `.env.example` file is safe to commit because it contains placeholders only.

## 6. Set up the database tables and sample data

Run these commands from `backend/`:

```powershell
npm run db:generate
npx prisma migrate deploy
npm run db:seed
```

- `db:generate` prepares Prisma Client.
- `migrate deploy` applies the team's existing migrations to **your local database**.
- `db:seed` adds sample records, once the team's seed script is complete.

If a command fails, **stop and share the error with the team**. Don't delete the database or reset migrations to make it work.

> Our Prisma configuration expects `DATABASE_URL`. If you see `Cannot resolve environment variable: DATABASE_URL`, check that `backend/.env` exists and that `prisma.config.ts` loads it. Do not run `prisma init` again.

## 7. Start the application

Open **two terminals** in VS Code.

**Terminal A — Backend:**

```powershell
cd backend
npm run
```

This lists the available scripts. Use the backend start/development command documented by the team once the Express server is implemented. **Do not assume the backend is ready just because Prisma is installed.**

**Terminal B — Frontend:** From the project root:

```powershell
cd frontend
npm ci
npm run dev
```

Open the local address Vite prints (often `http://localhost:5173`). The database-connected feature will work only when the backend and PostgreSQL are running and the frontend is configured to call the backend.

## 8. Test your setup

Once the backend's database feature is implemented:

1. Open the matching questionnaire.
2. Save a **test** matching profile.
3. Check that it was saved in PostgreSQL.
4. Restart the application.
5. Retrieve the profile and check that the answers are still there.

Tell the team which operation worked so we can fill in `docs/database-setup.md` with real results.

## 9. How the shared cloud database works

We will also use **one shared PostgreSQL development database** for team integration checks.

- Keep using your **local database** for normal coding and testing.
- Use the cloud database only when the team agrees to an integration test.
- Get authorized connection settings through a **private, approved channel**—never GitHub Issues, screenshots, or commits.
- Where possible, each person should have their own limited-access account.
- Never run reset or destructive commands against the shared database.

Example integration check: one teammate creates a test record, another retrieves it, a third updates it, and another confirms the update.

## 10. When database models change

If a teammate adds or changes a Prisma model, they should create and commit the new migration with the schema change. After pulling the approved changes, everyone runs from `backend/`:

```powershell
npm ci
npm run db:generate
npx prisma migrate deploy
```

Don't manually edit the database tables to make them match someone else's computer.

## Quick troubleshooting

| Problem | What to check |
|---|---|
| `DATABASE_URL` missing | Is `backend/.env` present? Does Prisma load it? |
| Cannot connect to PostgreSQL | Is PostgreSQL running? Correct username, password, port `5432`, and database name? |
| `npm ci` fails | Are you in `backend/` or `frontend/` with the correct `package-lock.json`? Is Node compatible? |
| Migration fails | Share the exact error; do **not** reset the database without approval. |
| Frontend loads but saving fails | Is the backend running? Is the frontend calling the correct API URL? |
| Data is different from a teammate's | You're probably using separate local databases—that's normal. |

## Before telling the team you're done

- [ ] Node.js and PostgreSQL installed
- [ ] Latest code downloaded
- [ ] Backend dependencies installed
- [ ] Local database created
- [ ] Private `backend/.env` configured (not committed)
- [ ] Prisma Client generated
- [ ] Migrations applied
- [ ] Seed data loaded (when available)
- [ ] Frontend and backend started (when implemented)
- [ ] Successful database operation demonstrated

**Questions or errors?** Share the command you ran and its error message with the team, but **hide passwords and connection strings**.
