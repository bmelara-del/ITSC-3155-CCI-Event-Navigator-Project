# Contributing

## Before you start

1. Read the README and project scope.
2. Choose an unassigned GitHub Issue with acceptance criteria.
3. Link the relevant Figma frame and identify dependencies.

## Branches

```bash
git switch main
git pull origin main
git switch -c feature/short-description
```

Use `feature/`, `fix/`, `docs/`, or `chore/` prefixes. Do not push directly to `main` without team agreement.

## Commits and pull requests

Use descriptive commit messages (for example, `Add matching questionnaire form`). Push your branch, open a pull request into `main`, and fill out the pull request template. Reference the issue with `Closes #123` (replace with the real issue number). Request at least one teammate review. Include screenshots for visual changes and describe how you tested your work.

## Code expectations

- Keep React components reusable and accessible.
- Match the relevant Figma frame, including responsive behavior.
- Keep the optional basic student profile separate from matching inputs.
- Do not present mock match percentages as calculated results.
- Validate inputs and handle empty and error states.
- Do not commit credentials, `.env` files, or real student data.

## Definition of done

Acceptance criteria are met, the feature has been tested, relevant documentation is updated, and a teammate has reviewed the pull request. A Figma mockup alone is not a completed implementation.
