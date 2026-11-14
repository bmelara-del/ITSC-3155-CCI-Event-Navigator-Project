# Backend data scaffold

This directory contains a Prisma 7 schema, a PostgreSQL driver-adapter setup, an offline-generated initial migration, and illustrative development seed data. It is not an API server, and the React frontend is not connected to it.

## Local setup

1. Install Node.js 24 or newer.
2. Run `npm install` in this directory.
3. Copy `.env.example` to `.env` and set `DATABASE_URL` only after a PostgreSQL target is approved.
4. Run `npm run db:generate` to generate the Prisma Client.

Migration and seed commands are intentionally separate and have not been run as part of this scaffold:

- `npm run db:migrate:dev` creates/applies migrations in a development database.
- `npm run db:migrate:deploy` applies checked-in migrations to a configured database.
- `npm run db:seed` connects to the configured database and writes illustrative seed records.

Do not run those database commands until the team approves a PostgreSQL target and the seed content.

## Data notes

Career-interest, skill, coursework, and experience-level labels preserve the Matching Profile questionnaire's current values. Role requirements and career-interest/coursework associations are demo-only mappings, not verified employer requirements. Company names, descriptions, and roles are prototype fixtures. No student, account, matching-profile, recommendation-result, or password data is modeled.

The schema stores catalog and role requirements only. A future matching API can accept the questionnaire's current values and calculate role-level relevance without treating demo fixture percentages as persisted facts.
