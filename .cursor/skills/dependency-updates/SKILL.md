---
name: dependency-updates
description: >-
  Helps apply pnpm dependency version changes the user explicitly chose,
  consistent with this monorepo catalog and Turborepo checks. Use only when the
  user invokes this skill and states which packages or workspaces to change and
  why (goal, unblocker, CVE, alignment). Do not use for unsolicited broad upgrades.
disable-model-invocation: true
---

The user decides **what** to update and **why**. This skill executes and validates that scoped work—never expand into repo-wide bumps unless they ask.

## Confirm scope first

Briefly restate in your own words:

- **Packages** (or workspaces) they want touched
- **Target versions or intent** (e.g. latest patch, specific semver range, pin to match another package)—if unclear, ask **one** focused question instead of guessing
- **Their reason** so you can prioritize checks (breaking-change skim vs quick verify)

Proceed only after scope is aligned or trivially implicit from their message.

## Where to edit versions

- **Catalog-sourced deps** (`pnpm-workspace.yaml` under `catalog:`; references use `"catalog:"` in workspace `package.json`): update **`pnpm-workspace.yaml`** for that key so all workspaces stay aligned.
- **Non-catalog deps**: bump in the **`package.json`** of each workspace they named (root, `apps/*`, `packages/*`) as applicable.

Prefer the **smallest** set of manifests that satisfies their stated targets.

## Run and verify

1. **`pnpm install`** from the monorepo root so `pnpm-lock.yaml` matches.
2. From root run **`pnpm typecheck`** and **`pnpm lint`**. Run **`pnpm build`** when framework, bundler, or major type/build tooling moved.
3. If a **major** or notoriously noisy upgrade: skim release notes for required migrations and fix compile/lint fallout in the touched surface only—unless they widened scope.

Optional: **`pnpm audit`** only if security was part of **why**; interpret results in light of their goal, not as a mandate to churn unrelated deps.

## Out of scope unless asked

- Do **not** run open-ended **`pnpm outdated -r`**-driven upgrade tours or suggest unrelated packages unless the user expands the request.
- Do **not** create git commits unless they explicitly ask to commit.
