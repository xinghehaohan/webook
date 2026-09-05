# Margin Oilfield Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Margin Roaming into a persistent book-centered drill-down experience and fix the confirmed return-position and status-bar issues.

**Architecture:** Extend the existing server allowlist with bounded, normalized WeRead actions. Repository functions compose independent exploration layers and the Margin screen reveals them progressively around one persisted focused book. Navigation uses history restoration with a stable-card fallback.

**Tech Stack:** Next.js 16, React, Zustand, IndexedDB, WeRead Agent API, CSS/PWA metadata.

---

### Task 1: Finish visual corrections

**Files:**
- Replace: `public/mascot/reading-girl.png`
- Modify: `src/app/globals.css`

- [ ] Install the approved 2D mascot asset.
- [ ] Make the Today header date/title white with a restrained dark shadow.
- [ ] Add standalone `100vh` scene sizing, legacy `constant()` inset fallback, and a top-blue status-bar fallback.

### Task 2: Preserve exploration context

**Files:**
- Modify: `src/state/reader-store.ts`
- Modify: `src/features/margins/margin-card.tsx`
- Modify: `src/features/margins/opinion-sheet.tsx`
- Modify: `src/app/opinion/[bookId]/[chapterUid]/page.tsx`

- [ ] Persist the last explored card inside the current API-key namespace.
- [ ] Give cards stable DOM ids and include a safe internal fallback return target.
- [ ] Replace the hard-coded `/margins` return link with history back for normal entry and anchor fallback for direct entry.
- [ ] Restore the focused book/card after async list loading.

### Task 3: Expose bounded exploration APIs

**Files:**
- Modify: `src/lib/weread/schemas.ts`
- Modify: `src/app/api/weread/[action]/route.ts`
- Modify: `src/lib/weread/normalize.ts`
- Modify: `src/lib/content/types.ts`

- [ ] Add `notebooks`, `readStats`, `personalHighlights`, and `bookReviews` actions with strict schemas.
- [ ] Normalize notebook books and cursor, monthly `readLongest[].book` only, personal highlight ranges/chapters, and nested public book reviews.
- [ ] Keep every payload flat and retain skill version `1.0.4`.

### Task 4: Build the book-centered oilfield

**Files:**
- Modify: `src/lib/content/repository.ts`
- Replace: `src/features/margins/margins-screen.tsx`
- Modify: `src/app/globals.css`

- [ ] Build a deduplicated candidate list from recent shelf books, bounded notebook pages, and monthly most-read books.
- [ ] Load the focused book's personal resonance by matching personal and popular ranges before requesting comments.
- [ ] Load popular highlights, chapter-specific highlights, and whole-book reviews independently.
- [ ] Render a focused-book picker and progressively reveal: resume, personal resonance, popular layer, chapter drill, whole-book echoes.
- [ ] Keep partial failures scoped to their own layer.

### Task 5: Verify and ship

- [ ] Run lint and production build.
- [ ] At 390×844, confirm visual layout and no overflow.
- [ ] Reproduce lower-card → opinion → back and confirm the same card/book context remains.
- [ ] Commit and push `main` under existing user authorization.

Automated tests remain omitted per the user's earlier instruction; the navigation bug already has a manual failing reproduction (`scrollY` returned to `0`) and will be rerun after the fix.
