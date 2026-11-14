# Architecture: Current Implementation and Sprint 2 Target

## Implemented frontend

The uploaded project uses React, Vite, React Router, JavaScript, and CSS. `frontend/src/App.jsx` defines `/`, `/companies`, `/companies/:companyId`, `/matching-profile`, `/recommendations`, and `/student-profile`. Shared components include `Navbar.jsx` and `CompanyCard.jsx`.

Company and recommendation records are currently local JavaScript data in `frontend/src/data/`. The matching questionnaire passes `{ careerInterest, skills, coursework, experienceLevel }` to Recommendations through React Router **location state**; this is not a persistent profile or an API request. Recommendations use fixed illustrative percentages, not computed match scores. The separate basic student profile uses browser `localStorage`, not server persistence or authentication.

## Proposed Sprint 2 architecture (not yet verified as implemented)

```text
Browser: React + Vite
  | POST matching inputs / GET company information
  v
Node.js + Express API (planned)
  |                      \
  v                       v
PostgreSQL (planned)    Matching rules (planned)
  companies, roles,     relevance scores and
  skills, coursework    explainable skill gaps
```

Proposed data: companies, roles, role_skills, role_coursework, and any explicitly defined career-interest/experience requirements. Agree on IDs and relationships before implementation.

### Proposed API contracts (not implemented)

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

These are proposals, not promises of the exact eventual backend routes or enum values. The frontend's current field values must be reconciled with the API contract.

## Matching rules and privacy

Scores indicate **relevance, not likelihood of being hired**. Agree on weights, normalization, tie-breaking, missing inputs, and unit tests in issue #6. Each explanation must be traceable to actual inputs and role requirements. Do not score work style, location, or culture without collecting those inputs.

Use environment variables for server secrets, input validation, and parameterized database queries. Never expose credentials in frontend code. Decide whether and how to persist personal data before adding server-side storage. Do not use real student records in demonstrations.

## Open decisions

Matching weights, seed data and source reliability, API response contracts, persistence/authentication, testing and deployment strategy, and who owns integration between #6/#7/#8/#10.
