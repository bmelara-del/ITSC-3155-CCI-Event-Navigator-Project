# Project Scope — Sprint 2

> **Source review:** November 14–15, 2026, based on uploaded project archive (5). “Implemented” means code exists; live PostgreSQL, cloud access, browser behavior, and GitHub board status were not independently verified during this review. Earlier local checks were reported in conversation.

## Target users and goal
UNC Charlotte CCI students seeking career and networking opportunities; the MVP helps them explore employers, enter a matching profile, see recommendations, and prepare for conversations.

## Scope vs implemented code
| Capability | Current state |
|---|---|
| Browse companies | UI implemented using local fixtures; company API separately implemented |
| View company/role details | UI uses fixtures; API provides related roles/requirements |
| Matching questionnaire | Implemented |
| Saved matching profile | React saved view and GET/PUT PostgreSQL API implemented; live persistence verification outstanding |
| Recommendations | UI and saved-profile gating implemented; recommendations still sample data |
| Match Details & Prep | Page implemented; API company lookup; match metrics unavailable and prep content partly illustrative |
| Student profile | Separate localStorage-backed UI, not authenticated account |
| Personalized scoring | Not implemented |
| Cloud/team database verification | Not evidenced in uploaded source |

## Current MVP boundaries
Focus on a repeatable database-backed matching-profile workflow, a database-driven company directory, an agreed matching result contract, transparent match explanations, tests, and Sprint 2 submission evidence. Do not present sample employers or prototype match percentages as verified real-world information.

## Deferred
Live UNC Charlotte event feeds, automatic employer updates, full account authentication/authorization, cross-device prep progress, production deployment, and advanced recommendation models.
