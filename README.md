# CCI Career Navigator

**ITSC 3155 – Software Engineering | UNC Charlotte**

**Project Status:** Sprint 1 Development

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

## Project Structure

```text
ITSC-3155-CCI-Event-Navigator-Project/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── ExploreCompanies.jsx
│   │   │   ├── MatchingProfile.jsx
│   │   │   └── Recommendations.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── package-lock.json
├── docs/
│   └── testing/
│       └── shared-navbar.md
├── .vscode/
│   └── mcp.json
├── README.md
├── CONTRIBUTING.md
├── PROJECT_SCOPE.md
└── ARCHITECTURE.md
```

This structure represents the intended organization after completing the shared navigation feature. Some files or directories may differ depending on the current implementation.

---

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

## Sprint 1 – Shared Navigation Bar

### User Story

As a CCI student, I want a consistent navigation bar so that I can move easily between the application's main pages.

### Feature Description

The Shared Navigation Bar is designed to provide consistent navigation throughout the application.

The implementation uses a reusable React component and React Router to navigate between application pages without requiring a full browser reload.

### Navigation Links

| Navigation Item | Route |
|---|---|
| Home | `/` |
| Explore Companies | `/companies` |
| My Matching Profile | `/matching-profile` |
| Recommendations | `/recommendations` |

Pages that have not yet been fully implemented may display temporary placeholder content.

### Acceptance Criteria

- [ ] Navbar is implemented as a reusable React component.
- [ ] Navigation links direct users to the correct pages.
- [ ] The currently active page is visually identifiable.
- [ ] Navigation works on desktop and smaller screens.
- [ ] Navbar styling remains consistent across application pages.

Check these boxes only after the corresponding functionality has been verified.

### Implementation Details

The navbar is implemented in `frontend/src/components/Navbar.jsx` and integrated into the application's shared layout.

React Router handles client-side navigation and identifies the active route. CSS provides the green navigation header, button styling, and responsive behavior based on the Figma prototype.

---

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

### Test Results

**Automated Tests**

- Tests executed: [Enter actual number]
- Tests passed: [Enter actual number]
- Tests failed: [Enter actual number]

**Manual Tests**

- Desktop navigation: [Pass / Fail / Pending]
- Mobile navigation: [Pass / Fail / Pending]
- Active-link styling: [Pass / Fail / Pending]
- Keyboard accessibility: [Pass / Fail / Pending]

Additional testing documentation can be found in `docs/testing/shared-navbar.md`, if created.

---

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
2. In Progress
3. In Review
4. Done

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

GitHub Copilot and the Figma MCP Server were used as development assistance tools during Sprint 1.

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

## Future Development

Planned features include:

- Company browsing and detailed company profiles
- Interactive student matching questionnaire
- Rule-based matching algorithm
- Personalized company recommendations
- Match explanations and skill-gap identification
- Career preparation checklists
- Backend API and database integration

---

## Team

Developed by a five-member student team for **ITSC 3155 – Software Engineering** at UNC Charlotte.

Team member names and responsibilities may be added here.

---

## Project Status

**Current Phase:** Sprint 1

The project is transitioning from Figma prototyping to functional React development. The shared navigation bar is the selected Sprint 1 feature documented in this README.

Further features will be developed and integrated in subsequent sprints.