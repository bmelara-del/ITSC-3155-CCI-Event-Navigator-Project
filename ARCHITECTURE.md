# Architecture: Current Implementation and Sprint 2 Target

## Implemented frontend

The uploaded project uses React, Vite, React Router, JavaScript, and CSS. `frontend/src/App.jsx` defines `/`, `/companies`, `/companies/:companyId`, `/matching-profile`, `/recommendations`, and `/student-profile`. Shared components include `Navbar.jsx` and `CompanyCard.jsx`.

Company and recommendation records are currently local JavaScript data in `frontend/src/data/`. The matching questionnaire passes `{ careerInterest, skills, coursework, experienceLevel }` to Recommendations through React Router **location state**; this is not a persistent profile or an API request. Recommendations use fixed illustrative percentages, not computed match scores. The separate basic student profile uses browser `localStorage`, not server persistence or authentication.

## Sprint 2 backend scaffold

`backend/` now contains a Prisma 7/PostgreSQL schema, generated-client configuration using Prisma's PostgreSQL driver adapter, an offline-generated initial migration, and a development seed script based on the frontend's illustrative company fixtures. The schema covers companies, roles, skills, coursework, career interests, experience levels, and their role associations.

This is a data-model scaffold only. No PostgreSQL database has been connected, no migration has been applied, no backend API exists, and the React frontend continues to use its local fixture data. Matching preferences are not persisted, and there is no student/profile foreign key: the regular Student Profile remains separate from the Matching Profile. Seeded career requirements and role-to-interest/coursework associations are illustrative assumptions, not verified employer data.

```text
Browser: React + Vite (existing local fixtures)
  |  future API integration
  v
Node.js API (planned; not implemented)
  | Prisma 7 + PostgreSQL adapter (scaffolded)
  v
PostgreSQL (schema and offline migration prepared; not connected/applied)
  companies, roles, matching catalogs, role requirements
```

### Future API contracts (not implemented)

The routes below remain proposals, not implemented services.

```text
GET /api/companies
GET /api/companies/:id
POST /api/matches
GET /api/roles/:id
```

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/companies` | Browse companies |
| GET | `/api/companies/:id` | Company details |
| POST | `/api/matches` | Calculate ranked role relevance and explanation inputs |
| GET | `/api/roles/:id` | Optional role detail for match preparation |

Example matching input:

```json
{"careerInterest":"Software Engineering","skills":["Java","SQL","Git"],"coursework":["Database Design"],"experienceLevel":"coursework-projects"}
```

These routes are not promises of the eventual API contract. The Prisma catalog labels intentionally match the current questionnaire's display values; API serialization and validation still need to be designed.

## Matching rules and privacy

Scores indicate **relevance, not likelihood of being hired**. Agree on weights, normalization, tie-breaking, missing inputs, and unit tests in issue #6. Each explanation must be traceable to actual inputs and role requirements. Do not score work style, location, or culture without collecting those inputs.

Use environment variables for server secrets, input validation, and parameterized database queries. Never expose credentials in frontend code. Decide whether and how to persist personal data before adding server-side storage. Do not use real student records in demonstrations.

## Open decisions

Matching weights, seed data and source reliability, API response contracts, persistence/authentication, testing and deployment strategy, and who owns integration between #6/#7/#8/#10.
