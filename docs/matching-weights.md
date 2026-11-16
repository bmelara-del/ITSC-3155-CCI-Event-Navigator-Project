# Match scoring weights

Issue #6. The scoring code is in `backend/src/matching/scoreMatch.ts`. The factor breakdown it returns is meant to feed the "Why you matched" section on the Match Details page (issue #8).

Each student and role pair gets a score from 0 to 100. The score is a relevance estimate. It is not a hiring probability.

| Factor | Points | How it is scored |
|---|---|---|
| Skills | 40 | Share of the role's skills the student has |
| Career interest | 25 | All or nothing: does the role list the student's interest |
| Coursework | 20 | Share of the role's related courses the student has |
| Experience | 15 | Full if the student meets the role's minimum level, half if one level short, none if two or more short |

Notes:

- Names are compared after trimming spaces and ignoring case.
- If a role lists no skills or no coursework, the student gets full points for that factor.
- Every result also lists the matched skills, the missing skills, and the missing coursework, so the score can be explained.
- The same input always gives the same score. Ties are sorted by role title.