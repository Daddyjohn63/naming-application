---
name: kanban-plan
description: >-
  Turns a requirements document into an implementation Kanban: distinct cards
  biased toward user-visible deliverables, each packed with enough context for
  an AI agent to implement. Use when the user provides specs, PRDs, feature
  requirements, or asks for a Kanban board, implementation breakdown, or phased
  delivery plan from written requirements.
---

# Kanban plan from requirements

## When to apply

The user supplies (or points to) a **requirements document**: PRD, spec, user stories, ticket text, markdown brief, etc. Produce a **Kanban-style implementation plan**: columns plus cards, not a prose roadmap only.

## Workflow

1. **Anchor on the source**
   Quote or summarize the requirement passages each card traces to (section IDs, headings, or story IDs). If the doc is ambiguous, note assumptions in that card’s **Open questions**.

2. **Decompose into distinct units**
   - One card = one coherent slice of work that maps to a **distinct part** of the requirement set.
   - **Prefer user-visible outputs**: screens, flows, emails, PDFs, CLI output, API responses the consumer sees, empty/error states, onboarding moments.
   - Split “invisible” work only when it blocks delivery or is explicitly required (auth hardening, migrations, perf). Merge tiny internal-only tasks into the card for the feature they enable when sensible.

3. **Size for agents**
   Each card must be **implementable by one agent session** in principle: bounded scope, clear done state. If a slice is huge, split by **user-visible milestone** (e.g. “read-only list” then “edit flow”), not by layer-only tickets (“add API” + “add UI”) unless the requirement truly separates them.

4. **Order dependencies**
   List **Blocked by** / **Blocks** between cards. Infrastructure and shared contracts usually land in **Ready** after **Backlog** items they unblock.

5. **Emit the board**
   Use the markdown structure below so the user can paste into Notion, GitHub Projects, Linear, or keep in-repo.

## Kanban columns (default)

Use these unless the user asks otherwise:

| Column          | Meaning                                                                  |
| --------------- | ------------------------------------------------------------------------ |
| **Backlog**     | Valid scope, not ready to start                                          |
| **Ready**       | Fully specified for implementation; dependencies satisfied or documented |
| **In progress** | Active work                                                              |
| **Review / QA** | Implemented; needs review, test, or acceptance                           |
| **Done**        | Meets acceptance criteria                                                |

## Card template (required fields)

Every card MUST use this template so another agent can implement without re-reading the whole PRD.

```markdown
### [Card title — outcome oriented, user-visible when possible]

- **ID**: `KB-###` (sequential)
- **Requirement refs**: …
- **User-visible outcome**: What the user sees or can do after this ships (one sentence).
- **Scope**: In scope bullets. **Out of scope**: bullets.
- **Acceptance criteria**: Testable checklist (`- [ ] …`).
- **Technical notes**: APIs, schema, components, env flags, feature toggles — minimal but precise.
- **Dependencies**: **Blocked by**: … | **Blocks**: …
- **Open questions**: … or _None_.
- **Suggested verification**: Manual steps or tests to run.
```

## Quality checks (before handing off)

- [ ] Every requirement bullet or story maps to at least one card (or is explicitly **Deferred / Won’t do** with rationale).
- [ ] Cards do not duplicate the same user-visible outcome.
- [ ] **Acceptance criteria** are observable (UI, API contract, or measurable behavior).
- [ ] No card is “implement the whole feature”; splits follow visible milestones or requirement boundaries.
- [ ] **Technical notes** name integration points (routes, tables, external services) when known.

## Example card

```markdown
### KB-002 — Settings: export saved names as CSV

- **ID**: `KB-002`
- **Requirement refs**: PRD §4.2 “Data portability”; Story DATA-12
- **User-visible outcome**: User downloads a `.csv` file of their saved names from Settings.
- **Scope**: Export current workspace names with created/modified dates. **Out of scope**: Import, scheduling, email delivery.
- **Acceptance criteria**:
  - [ ] Settings shows “Export CSV” with loading and error states.
  - [ ] File matches documented columns and UTF-8 encoding.
  - [ ] Empty list shows disabled export with explanation.
- **Technical notes**: New authenticated GET or action; reuse existing name list query; rate-limit if shared pattern exists.
- **Dependencies**: **Blocked by**: KB-001 (names persisted model stable) | **Blocks**: None
- **Open questions**: Max rows per export?
- **Suggested verification**: Manual export with 0, 1, and many rows; open in spreadsheet app.
```
