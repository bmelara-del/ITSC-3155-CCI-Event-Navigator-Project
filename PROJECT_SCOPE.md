# Project Scope — Sprint 2

## Problem and users

UNC Charlotte CCI students exploring internships and early-career technical roles need a way to discover relevant employers, relate their skills/coursework to roles, and prepare for recruiter conversations.

## MVP priorities

1. **Company profiles:** Browse employers, roles, and associated skills.
2. **Personalized matching:** Compare career interest, skills, coursework, and experience level against structured role requirements.
3. **Match explanation and preparation:** Show relevant and missing skills, transparent relevance scores, preparation checklists, and suggested recruiter questions.

## Current implementation vs remaining work

- **Present in frontend:** Homepage, company directory/details, matching questionnaire, recommendation cards with illustrative demo scores, separate student profile saved to browser localStorage, shared navigation.
- **Sprint 2 work in progress on board:** Backend/database (#10), matching algorithm (#6), recommendations integration (#7), and match details/preparation (#8).
- **Board statuses needing reconciliation:** Questionnaire (#5) is Sprint 1 In progress and regular student profile (#9) is Todo despite corresponding frontend files being present. Presence does not establish completion.

## Supporting and deferred scope

The homepage and basic student profile support the user journey; the student profile is separate from the matching questionnaire. Career Events is deferred unless the team explicitly revises the MVP.

Initially out of scope: live applications, verified real-time job openings, employer integrations, predictions of hiring probability, complex ML, and full account management.

## MVP completion checklist

- [ ] Company browsing and details are reviewed and accepted.
- [ ] All four questionnaire inputs are collected and validated.
- [ ] Reproducible role-level relevance scores replace demo percentages.
- [ ] Recommendations are ranked using those computed scores.
- [ ] A selected recommendation opens role-specific explanation and preparation guidance.
- [ ] Backend/database and frontend are integrated and tested if required by the agreed architecture.
- [ ] Accessibility, responsive layouts, error handling, and documentation are verified.

Example company records and current scores are illustrative. See `SPRINT_2.md` for the board snapshot and integration sequence.
