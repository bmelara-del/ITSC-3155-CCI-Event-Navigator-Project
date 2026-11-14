# Sprint 2 Plan and Status

**Board snapshot:** November 13, 2026, supplied screenshot. This is a point-in-time view; it is not automatically synchronized with GitHub.

## Board status

| Issue | Title | Board column | Source-code observation |
| --- | --- | --- | --- |
| #1 | Project Setup | Sprint 1 Done | React/Vite frontend present |
| #2 | Shared Navbar | Sprint 1 Done | `Navbar.jsx` and routes present |
| #3 | Welcome Page | Sprint 1 Done | `Home.jsx` present |
| #4 | Company Profiles | Sprint 1 Done | Company browsing and detail pages present |
| #5 | Matching Questionnaire | Sprint 1 In progress | `MatchingProfile.jsx` present; passes location state |
| #9 | Regular Student Profile | Todo | `StudentProfile.jsx` present; uses browser localStorage |
| #10 | Backend and Database | Sprint 2 in progress | No backend API/database implementation observed in the uploaded working tree |
| #8 | Match Details and Prep | Sprint 2 in progress | Existing company details are not yet personalized match explanations |
| #6 | Matching Algorithm | Sprint 2 in progress | Recommendations still use illustrative static scores |
| #7 | Recommendations | Sprint 2 in progress | Frontend recommendation page exists; algorithm integration remains |

## Suggested integration sequence

1. **#10 Data/API contract:** Agree on company IDs, role IDs, skills, coursework, career interests, experience requirements, response/error shapes, and whether matching runs on the server. Define schema/migrations and sample seed data before wiring frontend calls.
2. **#6 Matching logic:** Define deterministic relevance formula, normalization, missing-input handling, tie-breaking, and unit tests. Relevance is not hiring probability. Only use questionnaire inputs the app actually collects.
3. **#7 Recommendations integration:** Connect submitted profile to matching results; show computed scores, loading/error/empty states, and stable role/company detail links. Remove illustrative score labels only once actual scores replace them.
4. **#8 Match details/preparation:** Display a selected role's score explanation, matching skills, missing skills, suggested recruiter questions, and preparation checklist. Ensure the explanation matches the algorithm output.
5. **#5 and #9 completion review:** Verify acceptance criteria and responsive behavior; reconcile board status with actual merged code. Keep the basic student profile separate from matching unless the team explicitly designs an integration.

## Suggested acceptance checks

- [ ] Backend and database start from documented setup steps and return validated company/role data.
- [ ] Matching logic produces reproducible scores for fixed inputs and handles empty/invalid fields.
- [ ] Recommendations show calculated relevance scores rather than hardcoded demo percentages.
- [ ] Recommendation details lead to role-specific, explainable match/prep content.
- [ ] Navigation, mobile layouts, keyboard use, loading/error states, and tests are verified.
- [ ] No secrets or real student records are committed; persistence and privacy decisions are documented.
- [ ] Each completed issue has a reviewed PR, test evidence, and an updated GitHub Projects status.

## Open team decisions

Matching formula/weights; authoritative company and role data; API ownership and contracts; whether student/matching profiles persist; deployment strategy; issue ownership and Sprint 2 deadline. None of these are established by the screenshot alone.
