# CCI Career Navigator

**ITSC 3155 – Software Engineering | UNC Charlotte**

**Project Status:** Sprint 2 in progress (board snapshot: November 13, 2026)

## Project Overview

CCI Career Navigator is a web application designed to help students in UNC Charlotte's College of Computing and Informatics (CCI) explore career opportunities and identify companies that align with their skills, coursework, experience, and career interests.

The application aims to help students discover relevant companies, receive personalized recommendations, understand why they match with certain opportunities, and prepare for conversations with employers.

The project began as an interactive Figma prototype and is being developed into a functioning web application using React, with GitHub Issues and GitHub Projects used to organize development.

## Main Features

### 1. Company Profiles

Students will be able to explore companies and view information such as:

- Company name and industry
- Relevant technical roles
- Skills associated with each role
- Company descriptions and career opportunities

### 2. Personalized Matching

Students will be able to enter their:

- Career interests
- Technical skills
- Relevant coursework
- Experience level

The application will use this information to recommend relevant companies and technical roles.

### 3. Match Explanation and Preparation

Students will be able to:

- View personalized match scores
- Understand why a company or role was recommended
- Identify matching skills and areas for improvement
- View preparation checklists and suggested interview questions

**Note:** These are the intended MVP features. Features not yet implemented remain part of the development backlog.

---

## Technologies Used

| Technology | Purpose |
|---|---|
| React | Frontend user interface |
| Vite | Frontend development and build tooling |
| JavaScript | Application logic |
| CSS | Styling and responsive layouts |
| React Router | Client-side navigation |
| Node.js | Planned backend runtime |
| Express.js | Planned backend API |
| PostgreSQL | Planned database |
| Git & GitHub | Version control and collaboration |
| GitHub Projects | Sprint planning and issue tracking |
| GitHub Copilot | AI-assisted development and testing |
| Figma | UI/UX prototyping |
| Figma MCP Server | Providing design information to Copilot |

Backend technologies are planned and may not yet be implemented.

---

## Current frontend implementation

The uploaded repository includes React routes for the home page (`/`), company directory (`/companies`), company details (`/companies/:companyId`), matching questionnaire (`/matching-profile`), recommendations (`/recommendations`), and basic student profile (`/student-profile`). The brand in the shared navbar links to the homepage; the other four pages have navigation links.

- Company directory and detail pages use local sample company data (`frontend/src/data/companies.js`).
- The matching questionnaire collects career interest, skills, coursework, and experience level, then passes these values to Recommendations using React Router location state.
- Recommendations display sample company cards and **illustrative, not computed** percentage scores. Opening Recommendations without matching state displays a prompt to complete the questionnaire. Match-details links currently lead to company detail pages, not a completed personalized explanation/preparation workflow.
- The separate basic student profile supports form entry and local browser storage (`localStorage`). It is not a server-backed account, and it is not automatically the matching profile.
- The repository includes component/page tests using Vitest and React Testing Library.

## Project structure (key files)

```text
frontend/
  src/
    App.jsx                  # React Router routes
    components/              # Navbar, CompanyCard
    pages/                   # Home, ExploreCompanies, CompanyDetails,
                             # MatchingProfile, Recommendations, StudentProfile
    data/                    # Sample companies and recommendations
    test/                    # Test setup
  TESTING.md
  README.md
README.md
ARCHITECTURE.md
PROJECT_SCOPE.md
CONTRIBUTING.md
SPRINT_2.md
```

## Installation and Setup

### Prerequisites

Before running the application, install:

- Node.js (a version compatible with the project's Vite installation)
- npm
- Git
- Visual Studio Code or another code editor

### 1. Clone the Repository

```bash
git clone <YOUR-REPOSITORY-URL>
cd ITSC-3155-CCI-Event-Navigator-Project
```

Replace `<YOUR-REPOSITORY-URL>` with the actual GitHub repository URL.

### 2. Install Dependencies

Navigate to the frontend directory:

```bash
cd frontend
npm install
```

### 3. Run the Application

Start the Vite development server:

```bash
npm run dev
```

Open the local address displayed in your terminal, typically:

```text
http://localhost:5173
```

### 4. Stop the Application

Press `Ctrl + C` in the terminal running Vite.

---

## Sprint progress

**Sprint 1 completed on the GitHub Projects board:** #1 Project Setup, #2 Shared Navbar, #3 Welcome Page, and #4 Company Profiles. The current source also includes frontend implementations for the matching questionnaire, recommendations, and student profile, but their board statuses differ from their code presence.

**Sprint 1 still open on the board:** #5 Matching Questionnaire (in progress) and #9 Regular Student Profile (Todo).

**Sprint 2 in progress on the board:** #10 Backend and Database, #8 Match Details and Prep, #6 Matching Algorithm, and #7 Recommendations. No Sprint 2 issues are marked Done in the supplied screenshot.

See [SPRINT_2.md](SPRINT_2.md) for issue-level priorities, dependencies, integration checkpoints, and acceptance suggestions. The board is a snapshot, not a live sync.

## Navigation

| UI link | Route |
| --- | --- |
| CCI Career Navigator brand (home) | `/` |
| Explore Companies | `/companies` |
| My Matching Profile | `/matching-profile` |
| Recommendations | `/recommendations` |
| My Profile | `/student-profile` |
| Company details (from company cards) | `/companies/:companyId` |

## Testing

The Shared Navigation Bar is tested using automated component tests and manual browser testing.

### Automated Testing Tools

- Vitest
- React Testing Library
- `@testing-library/jest-dom`
- `@testing-library/user-event`
- jsdom

### Running Automated Tests

From the `frontend` directory, run:

```bash
npm run test:run
```

This command assumes that the `test:run` script has been configured in `package.json`.

### Code Quality Checks

Run ESLint:

```bash
npm run lint
```

Verify that the application builds:

```bash
npm run build
```

### Test Coverage

| Test | Expected Result |
|---|---|
| Navbar rendering | All navigation links are displayed |
| Navigation links | Links point to the correct routes |
| Active navigation | Current page has an active state |
| Route changes | Clicking links displays the correct page |
| Keyboard navigation | Links are accessible using Tab and Enter |
| Responsive layout | Navbar remains usable on desktop and mobile |
| Shared layout | Navbar appears consistently across pages |

### Test evidence and limitations

See [`frontend/TESTING.md`](frontend/TESTING.md) for previously recorded verification and its dates. This documentation update inspected source files but did **not** establish a new passing test run: the local `npm run test:run` attempt failed with `vitest: Permission denied` in the review environment. Run `npm ci`, `npm run test:run`, `npm run lint`, and `npm run build` in your own development environment before reporting current results.

## Development Workflow

The team uses GitHub Issues and GitHub Projects to organize work into sprints.

### GitHub Issues

Each development issue includes:

- User story
- Feature description
- Acceptance criteria
- Development tasks
- Figma design reference
- Priority and sizing labels

### GitHub Projects

The team tracks issues through the following statuses:

1. Todo
2. Sprint 1 In progress
3. Sprint 1 Done
4. Sprint 2 in progress
5. Sprint 2 Done

Issues are assigned to team members and organized by sprint.

### Branching Strategy

Development work is completed on feature branches rather than directly on `main`.

Example:

```bash
git switch main
git pull origin main
git switch -c feature/shared-navbar
```

After implementation and testing, developers push their changes and create a pull request for review.

### Pull Requests

Pull requests should include:

- A summary of changes
- A link to the corresponding GitHub Issue
- Testing information
- Screenshots for UI changes
- Teammate review before merging

---

## Figma Design

The application's UI is based on the team's Figma prototype.

**[View the CCI Career Navigator Figma Prototype](https://www.figma.com/design/gAcUHmdI1wsdxlfUPhrGe1/CCI-Event-navigator-prototype?node-id=0-1)**

The prototype includes designs for the homepage, company profiles, matching questionnaire, recommendations, and match explanations.

Figma MCP is used to provide design context to GitHub Copilot during development.

---

## AI-Assisted Development Disclosure

The repository documents GitHub Copilot and Figma MCP as development assistance tools. Team members should confirm any Sprint 2 usage before extending this disclosure.

**GitHub Copilot assisted with:**

- Reviewing the existing React project structure
- Planning the reusable navigation component
- Suggesting React Router implementation
- Generating or modifying React and CSS code
- Assisting with automated test creation
- Identifying potential accessibility and responsiveness issues

**Figma MCP assisted with:**

- Retrieving design information from the Figma prototype
- Identifying navigation layout and styling
- Providing design context for implementation

**Human verification:**

Team members are responsible for reviewing AI-generated code, verifying that it satisfies the GitHub Issue's acceptance criteria, running tests, fixing errors, and reviewing pull requests.

This disclosure should be updated to reflect the tools actually used and the changes actually verified by the team.

---

## Next development milestones

1. Agree on the company/role data contract and database schema (#10).
2. Implement deterministic, testable matching logic based on the four questionnaire fields (#6).
3. Replace static illustrative recommendation percentages with actual computed relevance results (#7).
4. Build role-specific match explanations, skill gaps, and preparation guidance (#8).
5. Finish verification and board/issue updates for the questionnaire (#5) and student profile (#9).

## Team

Developed by a five-member student team for **ITSC 3155 – Software Engineering** at UNC Charlotte.

Team member names and responsibilities may be added here.

---

## Project status notes

Sprint 2 is the current planning focus. Source-code presence does not imply that an issue has been reviewed, merged, tested, or marked complete. Keep GitHub Projects and this README synchronized after team verification.
