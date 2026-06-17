# Clipline Cloud — Implementation Docs

This folder is the [`clipline-cloud-design.md`](../clipline-cloud-design.md) design split into
**implementation milestones, ordered the way they should be built**. Each milestone is a
self-contained working document: it carries the design content relevant to it, a status, a task
checklist, a definition of done, and a progress log the implementing agent updates as it works.

Read [`00-overview-and-architecture.md`](00-overview-and-architecture.md) first — it is the
cross-cutting reference (decisions, architecture, identifiers, privacy model, repo layout). Then
work the numbered docs in order; each lists what it **Depends on** so you never start a milestone
whose foundations aren't in place.

## How to track progress

Each doc has a **Status** line near the top. Keep it current:

- `☐ Not started` — no work done yet
- `◐ In progress` — actively being built
- `⛔ Blocked` — waiting on a dependency or a decision (note why in the progress log)
- `☑ Complete` — every checklist item done and the definition of done is met

Inside each doc:

1. Tick `- [ ]` → `- [x]` checklist items as you complete them.
2. Record decisions, surprises, and deviations in the **Progress log** at the bottom (date them).
3. Don't mark a doc `☑ Complete` until its **Definition of done** is fully satisfied — that is the
   gate the next milestone depends on.

## Progress dashboard

Update the Status column here whenever a doc's status changes, so this table is the single glance
that shows where the project stands.

| #  | Milestone | Design phase | Status |
|----|-----------|--------------|--------|
| 00 | [Overview & Architecture](00-overview-and-architecture.md) | reference | ☑ Complete |
| 01 | [Project Scaffolding & Configuration](01-project-scaffolding-and-config.md) | Phase 1 | ☑ Complete |
| 02 | [Database & Migrations](02-database-and-migrations.md) | Phase 1 | ☑ Complete |
| 03 | [Storage Abstraction (local + S3)](03-storage-abstraction.md) | Phase 1 | ☑ Complete |
| 04 | [Authentication, Users & First-Run Admin](04-authentication-users-and-first-run-admin.md) | Phase 1 | ☑ Complete |
| 05 | [Upload Protocol](05-upload-protocol.md) | Phase 1 | ☑ Complete |
| 06 | [Clip Lifecycle & Durable Jobs](06-clip-lifecycle-and-jobs.md) | Phase 1 | ☑ Complete |
| 07 | [Clips API, Sorting & Search](07-clips-api-and-library-queries.md) | Phase 1 | ☑ Complete |
| 08 | [Media Serving & Public Sharing](08-media-serving-and-public-sharing.md) | Phase 1 | ☑ Complete |
| 09 | [Web Frontend](09-web-frontend.md) | Phase 1 | ☑ Complete |
| 10 | [Desktop App Integration](10-desktop-app-integration.md) | Phase 1 | ☑ Complete |
| 11 | [Deployment, Operations & Hardening](11-deployment-operations-and-hardening.md) | Phase 1 | ☑ Complete |
| 12 | [Phase 2 — Processing & Reliability](12-phase2-processing-and-reliability.md) | Phase 2 | ☑ Complete |
| 13 | [Phase 3 — Admin & Library Polish](13-phase3-admin-and-library-polish.md) | Phase 3 | ☐ Not started |
| 14 | [Phase 4 — Optional Scale](14-phase4-optional-scale.md) | Phase 4 | ☐ Not started |

## What "v1 complete" means

Docs **01–11** are the Phase-1 / v1 completeness target. When all eleven are `☑ Complete`, the
self-hosted clip-sharing loop works end to end: deploy with Compose → first-run admin → admin
creates users → desktop connects and uploads → clips appear in the owner's library → owner
sorts/filters, sets private/public, and shares public clips via non-guessable URLs — identically on
local disk or S3. Docs **12–14** are post-v1 phases; build them as demand appears.

## Source of truth

The original [`clipline-cloud-design.md`](../clipline-cloud-design.md) remains the authoritative
record of *decisions and rationale* (including the Appendix change-history). These milestone docs
are the authoritative record of *what to build and how far along it is*. If they ever disagree on a
decision, the design doc wins and the milestone doc should be corrected.
