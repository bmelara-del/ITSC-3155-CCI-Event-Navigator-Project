# Frontend Verification

## Shared Navbar Acceptance Results

Verified on 2026-11-02.

| Acceptance criterion | Verification | Result |
| --- | --- | --- |
| Shared navbar appears on every supported route | Directly loaded `/`, `/companies`, `/matching-profile`, and `/recommendations`; each showed one main navigation landmark. | Pass |
| Navigation links target the requested routes | Checked the Home, Explore Companies, My Matching Profile, and Recommendations destinations. | Pass |
| Active route is indicated accessibly | Each route showed one active link inside the navigation with `aria-current="page"`. | Pass |
| Navbar remains keyboard operable | Vitest/Testing Library test tabs through the brand and navigation links and activates a link with Enter. | Pass |
| Responsive navigation stays visible without horizontal overflow | Browser-checked 320, 375, 680, 768, 960, 961, 1024, and 1440 px widths; all four links remained within the viewport. | Pass |
| Homepage content and header styling are preserved | `/` displayed the original heading and three opportunity cards; desktop header measured 80 px high with background `#046a38`. | Pass |
| Pages use frontend-only sample data without backend behavior | Recommendations display local demo data and direct access without profile state prompts the student to complete the questionnaire. | Pass |

## Automated Checks

Run from `frontend/`:

| Command | Result |
| --- | --- |
| `npm run test:run` | Pass: 1 test file, 7 tests |
| `npm run lint` | Pass |
| `npm run build` | Pass |

Keyboard behavior is covered in jsdom; the focus-visible CSS rule exists, but its rendered appearance was not visually assessed in this verification.

## Matching Profile and Recommendations

Verified on 2026-11-13.

| Acceptance criterion | Verification | Result |
| --- | --- | --- |
| Questionnaire submits the selected profile to Recommendations | Vitest integration tests selected a career interest, skills, coursework, and experience level and verified the received React Router state. | Pass |
| Recommendations render sample cards and profile summary | Tested the six initial Figma cards, company details, submitted profile summary, and illustrative demo-score labels. | Pass |
| Direct access without profile data is handled | Tested the completion prompt and link back to `/matching-profile`. | Pass |
| Recommendation details use stable company IDs | Tested navigation to the existing company details page, including the Northwind demo company; invalid IDs retain the existing not-found behavior. | Pass |
| Desktop and mobile layouts are responsive | Browser-checked the 1440 px two-column card layout and 390 px single-column layout; neither had horizontal overflow. | Pass |
| Complete frontend checks pass | `npm run test:run` (5 files, 26 tests), `npm run lint`, and `npm run build`. | Pass |
