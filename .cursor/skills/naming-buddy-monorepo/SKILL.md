---
name: naming-buddy-monorepo
description: >-
  Applies naming-buddy monorepo conventions. Use when working anywhere in this
  repository—Turborepo or pnpm tasks, cross-package imports, choosing where code
  belongs (apps vs packages), or when the user mentions naming-buddy, workspace
  packages, Convex backend location, or the web app layout.
---

# naming-buddy (monorepo)

## Stack and tooling

- **Package manager**: pnpm (`pnpm-workspace.yaml`); use `pnpm` from repo root or filter with `-F` / `--filter` as needed.
- **Task runner**: Turborepo — root scripts `dev`, `build`, `lint`, `format`, `typecheck` delegate to workspaces.
- **Node**: >= 20 (`package.json` `engines`).
- **Shared dependency versions**: `pnpm-workspace.yaml` `catalog:` — prefer `catalog:` entries for duplicated deps when editing `package.json` files.

## Layout

| Path | Role |
|------|------|
| `apps/web` | Next.js app (`web`); primary UI (`next`, `react`, Convex client, Clerk). |
| `packages/backend` | Convex backend (`@workspace/backend`, `packages/backend/convex/`). |
| `packages/shared` | Shared types/utilities consumed by web and backend. |
| `packages/ui` | Shared UI (`@workspace/ui`). |
| `packages/tokens` | Design tokens (`@workspace/tokens`). |
| `packages/eslint-config` | `@workspace/eslint-config`. |
| `packages/typescript-config` | `@workspace/typescript-config`. |

Cross-package deps use `workspace:*` / `workspace:^` per existing `package.json` patterns.

## Where to implement changes

- **Routes, pages, client UI** → `apps/web`.
- **Convex schema, queries, mutations, actions, HTTP** → `packages/backend/convex/`.
- **Types or logic shared across web and Convex** → `packages/shared` (avoid circular deps).
- **Reusable React components / primitives** → `packages/ui`; **tokens** → `packages/tokens`.

## Convex

Before changing Convex APIs or patterns:

1. Read `packages/backend/AGENTS.md` (repo guidance).
2. Read `packages/backend/convex/_generated/ai/guidelines.md` — project-specific Convex rules supersede generic training assumptions.

Convex-focused agent skills bundled with backend live under `packages/backend/.agents/skills/` (separate from `.cursor/skills/`).

## Scripts (typical)

- From root: `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm format`.
- Convex dev targets the backend workspace (see `@workspace/backend` scripts in `packages/backend/package.json`).

Keep edits scoped to the relevant workspace package; run the matching workspace or turbo task after substantive changes.
