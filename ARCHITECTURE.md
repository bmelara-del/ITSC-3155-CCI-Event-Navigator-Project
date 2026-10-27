# Architecture (Proposed)

> This describes planned components, not a deployed system.

```text
Student browser
   |
React + Vite frontend
   | HTTP/JSON
Node.js + Express API
   |                 \
PostgreSQL          Matching logic
(companies, roles,   (relevance scores,
 skills, coursework)  explanations)
```

## Frontend

Pages: Welcome, Explore Companies, Company Details, Matching Questionnaire, Recommendations, Match Details & Prep; optional Basic Student Profile. Reusable elements include navbar, company cards, and match cards.

## Backend and data

Proposed entities: `companies`, `roles`, `role_skills`, and `role_coursework`. Additional role-interest and experience requirements will be defined before implementation.

Proposed endpoints (not implemented):

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/companies` | List companies |
| GET | `/api/companies/:id` | Company details |
| POST | `/api/matches` | Score role relevance |

Example matching request:

```json
{
  "careerInterest": "software-engineering",
  "skills": ["Java", "SQL", "Git"],
  "coursework": ["Database Design"],
  "experienceLevel": "coursework-projects"
}
```

## Matching rules

Scores represent **relevance**, not likelihood of being hired. Weights, normalization, missing data, and test cases must be agreed upon in a GitHub Issue. Explanations must correspond to actual questionnaire fields and role data. Do not score work style, location, or culture unless those inputs are actually collected.

## Security and privacy

Use environment variables for secrets; never expose database credentials in browser code. Validate inputs, use parameterized queries, and avoid real student data in demos. Do not add persistent personal-data storage before agreeing on its need and privacy requirements.

## Open decisions

Matching weights; data source; whether profiles are persisted; API contracts; testing tools; deployment approach.
