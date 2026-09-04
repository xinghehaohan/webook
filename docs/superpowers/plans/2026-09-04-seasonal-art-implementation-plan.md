# PageSprout Seasonal Art Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the two supplied paintings into Today and Profile as decorative seasonal scenes without reducing reading clarity.

**Architecture:** Copy both user-provided images into the PWA's local `public/scenes` assets. Apply them through dedicated page classes and CSS pseudo-element overlays, keeping semantic content unchanged and all long-form reading on opaque paper surfaces.

**Tech Stack:** Next.js 16, React 19, CSS, local PWA assets

---

### Task 1: Add the seasonal assets

**Files:**
- Read: `/var/folders/cc/9l5g43451bgftfs99kn_9qg40000gn/T/codex-clipboard-8d499572-c64c-4044-aec1-1f29bfcb4b6a.png` (sunny hillside)
- Read: `/var/folders/cc/9l5g43451bgftfs99kn_9qg40000gn/T/codex-clipboard-afe67af9-f42f-4678-9b93-f67fba466960.png` (snowy house)
- Create: `public/scenes/sunny-hillside.png`
- Create: `public/scenes/snowy-house.png`

- [ ] Copy the two supplied source images into stable public asset paths.
- [ ] Confirm both files are valid PNG images and retain their portrait dimensions.

### Task 2: Add page-level scene hooks

**Files:**
- Modify: `src/features/today/today-screen.tsx`
- Modify: `src/features/profile/profile-screen.tsx`

- [ ] Add a specific sunny scene class to the Today hero.
- [ ] Add a dedicated snowy scene container to the Profile hero.
- [ ] Keep the images decorative so screen readers encounter only the existing page content.

### Task 3: Style responsive crops and readable overlays

**Files:**
- Modify: `src/app/globals.css`
- Modify: `public/sw.js`

- [ ] Add mobile-first background-image, focal position, and controlled scene height rules.
- [ ] Add gradient/scrim overlays behind headings and PageSprout.
- [ ] Preserve existing paper surfaces, bottom navigation, reduced motion, and dark mode readability.
- [ ] Add both scene assets to the service worker shell cache for offline PWA display.

### Task 4: Verify and publish

**Files:**
- Modify only if verification reveals a concrete visual issue.

- [ ] Run `npm run lint`; expect zero errors.
- [ ] Run `npm run build`; expect a successful production build.
- [ ] Inspect Today and Profile at 390×844; verify crop, contrast, and no horizontal overflow.
- [ ] Commit the implementation and push `main` to trigger the existing Vercel deployment.

Automated tests are intentionally omitted per the user's request; verification is lint, production build, and mobile visual inspection.
