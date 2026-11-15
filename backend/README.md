# Backend API and data scaffold

This directory contains a basic Express API server and a Prisma 7 PostgreSQL data layer. The Match Details frontend route can look up companies by their API slug when opened directly or refreshed.

## Local setup

1. Install Node.js 24 or newer.
2. Run `npm install` in this directory.
3. Copy `.env.example` to `.env` and set `DATABASE_URL` only after a PostgreSQL target is approved.
4. Run `npm run db:generate` to generate the Prisma Client.
5. Run `npm run dev` to start the API on port 3001 (or the port set by `PORT`).

The server allows local Vite development requests from `http://localhost:5173` and `http://127.0.0.1:5173`. Check `GET http://localhost:3001/api/health` for the server status; this endpoint does not test PostgreSQL connectivity.

## Matching profile API

The matching profile API uses the single development-only student ID
`00000000-0000-4000-8000-000000000001`, defined by the backend. There is no
authentication yet; all local visitors therefore share this one development
profile. The ID is not accepted from or sent to the frontend and must not be
used as production identity.

`GET /api/matching-profile` returns the saved questionnaire values and database
timestamps, or `404` when this development profile has not been saved.
`PUT /api/matching-profile` creates the profile on first save and updates it
thereafter. It accepts `careerInterest`, `skills`, `coursework`, and
`experienceLevel`, using the current questionnaire's labels and selections.
Work preferences are not part of the current questionnaire and are not stored.

Successful GET and PUT responses use this shape:

```json
{
  "profileId": "c0ffee00-0000-4000-8000-000000000001",
  "careerInterest": "Software Engineering",
  "skills": ["Java", "SQL"],
  "coursework": ["Data Structures"],
  "experienceLevel": "Beginner / No internship",
  "createdAt": "2026-11-14T20:00:00.000Z",
  "updatedAt": "2026-11-14T21:00:00.000Z"
}
```

An invalid payload returns `400`; unexpected errors return a generic `500`
without database details.

## Company API

`GET /api/companies` returns a JSON array, ordered by company name. Each item contains `companyId` (UUID), `slug`, `name`, `industry`, nullable `description` and `website`, `isActive`, and ISO-8601 `createdAt` and `updatedAt` timestamps. An empty table returns `[]`.

Example list response:

```json
[
  {
    "companyId": "c0ffee00-0000-4000-8000-000000000001",
    "slug": "example-company",
    "name": "Example Company",
    "industry": "Technology",
    "description": null,
    "website": "https://example.com",
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
]
```

`GET /api/companies/:id` accepts a company's UUID and returns the same company fields plus a `roles` array. Each role contains its role fields, a nullable `minimumExperienceLevel` object, and `skills`, `coursework`, and `careerInterests` arrays containing their related catalog records. The role and requirement records come from the Prisma relations in PostgreSQL.

Example company detail response (other role scalar fields are also included):

```json
{
  "companyId": "c0ffee00-0000-4000-8000-000000000001",
  "slug": "example-company",
  "name": "Example Company",
  "industry": "Technology",
  "description": null,
  "website": "https://example.com",
  "isActive": true,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z",
  "roles": [
    {
      "roleId": "c0ffee00-0000-4000-8000-000000000002",
      "companyId": "c0ffee00-0000-4000-8000-000000000001",
      "slug": "software-intern",
      "title": "Software Intern",
      "description": "Build software.",
      "location": "Charlotte, NC",
      "employmentType": "INTERNSHIP",
      "workArrangement": "HYBRID",
      "term": "Summer",
      "minimumExperienceLevelId": "c0ffee00-0000-4000-8000-000000000003",
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z",
      "minimumExperienceLevel": {
        "experienceLevelId": "c0ffee00-0000-4000-8000-000000000003",
        "code": "beginner",
        "label": "Beginner",
        "sortOrder": 1
      },
      "skills": [
        {
          "skillId": "c0ffee00-0000-4000-8000-000000000004",
          "name": "TypeScript",
          "normalizedName": "typescript"
        }
      ],
      "coursework": [
        {
          "courseworkId": "c0ffee00-0000-4000-8000-000000000005",
          "name": "Data Structures",
          "normalizedName": "data structures"
        }
      ],
      "careerInterests": [
        {
          "careerInterestId": "c0ffee00-0000-4000-8000-000000000006",
          "code": "software-engineering",
          "label": "Software Engineering"
        }
      ]
    }
  ]
}
```

An unknown or malformed company ID returns `404` with `{"error":"Company not found"}`. Database or other unexpected API errors return a generic `500` response without database details.

Run `npm test` in `backend` for automated route tests. These use an injected repository and do not require a live database.

Database migration and seed commands are intentionally separate. The additive
saved-profile migration is included and has been applied to the configured
development database. For another approved database target:

- `npm run db:migrate:dev` creates/applies migrations in a development database.
- `npm run db:migrate:deploy` applies checked-in migrations to a configured database.
- `npm run db:seed` connects to the configured database and writes illustrative seed records.

Never use a database reset for this feature. Run migrations only after confirming
the `DATABASE_URL` points to the intended development or deployment target; the
seed command is separate and is not required for saved profile persistence.

## Data notes

Career-interest, skill, coursework, and experience-level labels preserve the Matching Profile questionnaire's current values. One development-only matching profile is persisted without authentication; all local visitors share it. No student account, recommendation result, or password data is modeled. Role requirements and career-interest/coursework associations are demo-only mappings, not verified employer requirements. Company names, descriptions, and roles are prototype fixtures.

The schema stores catalog, role requirements, and questionnaire responses. A future matching API can calculate role-level relevance without treating demo fixture percentages as persisted facts.
