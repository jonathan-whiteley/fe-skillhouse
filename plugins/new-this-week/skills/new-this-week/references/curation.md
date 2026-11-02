# Curation rules

## Pillar mapping

| Pillar | Belongs here |
|---|---|
| **Genie & BI** | Genie (Agents/Spaces, Genie One, Genie Code, MCP), AI/BI dashboards, metric views *as consumed by BI*, Databricks SQL warehouse features users feel, BI tool integrations (Tableau, Power BI), Databricks One |
| **Data Eng & Platform/Governance** | Lakeflow (Connect, Declarative Pipelines, Jobs), Zerobus, Delta/Iceberg, Unity Catalog (governance, lineage, ABAC, metric view definitions), Lakebase, serverless compute, system tables/cost controls, networking/security, DR, Apps platform |
| **Data Science & AI** | Agent Bricks, Model Serving and hosted foundation models, AI Gateway / Unity Gateway, AI Functions, Vector/AI Search, MLflow (tracing, evaluation), ML training, Feature Store |

Tie-breaker: put it where the customer's team that will use it lives.

## Keep (meaningful)

- New GA or Public Preview capability that changes what the customer can build or retire.
- A status change that unblocks something they're waiting on (Preview to GA on their cloud).
- New hosted models or major serving capabilities.
- Governance/security/cost features with an obvious owner at the customer.
- A significant customer story or reference architecture *only* if it maps to an active initiative (max one on the slide, usually skip).

## Cut (ticky tacky)

- UI polish, renamed buttons, new keyboard shortcuts, editor themes.
- Runtime/DBR maintenance releases, library version bumps, minor connector version updates.
- Bug fixes, performance "improvements" without a headline number.
- Region expansions outside the customer's cloud/region.
- Deprecations/retirements with no action needed by this customer (if action IS needed, it's a 1:1 email, not this slide).
- Private Preview unless the customer is enrolled or you've confirmed they can request it (then label Beta/Preview honestly).
- Internal-only items: field playbooks, enablement, Slack-only announcements without a public source.
- Anything you can't verify status for.

## Writing

- `title`: product name plus the capability, under ~45 characters.
- `what`: one sentence, plain, what shipped. No marketing adjectives.
- `why`: one sentence naming the customer's initiative or UCO. If you can't write a specific `why`, the item probably doesn't belong.
- No em or en dashes. Hyphens only inside compound words or ranges.
