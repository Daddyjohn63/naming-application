---
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or invokes or mentions this skill explicitly.
disable-model-invocation: true
---

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one.

## Scope before grilling

If the artifact under review is unclear, establish it first (pasted plan, ticket, RFC, branch, or paths in this repo) and whether to go breadth-first across major branches or deep-dive one area. For very large designs, agree a rough order or depth so the session stays tractable.

## Questions and recommendations

- Ask **one question at a time**.
- For each question, give **your recommended answer** grounded in **criteria**: tradeoffs, constraints, and **facts from the codebase** when relevant—not preference alone.
- If a question can be answered by exploring the codebase, **explore the codebase** instead of asking.

## Contradictions and unknowns

If the user’s answer **conflicts with the repo**, stated constraints, or **earlier decisions**, say so explicitly and reconcile before moving on. If something is **still unknown**, list **options** and what **evidence** (code, docs, experiment) would resolve it—do not fake certainty.

## Progress and stopping

After resolving meaningful chunks, **checkpoint**: short recap of what was decided and invite correction. Continue until **all agreed branches are resolved**, or the user **asks to stop** or **switches to implementation**. Do not silently expand scope beyond the plan being grilled.

## Mode

Stay in **discussion and clarification** unless the user explicitly asks for edits, refactors, or commits. Do **not** start large refactors or unsolicited code changes during this workflow.
