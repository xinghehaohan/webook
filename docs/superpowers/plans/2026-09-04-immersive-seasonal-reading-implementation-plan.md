# Immersive Seasonal Reading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the paintings cover the complete PWA viewport, soften content into readable glass cards, and replace PageSprout with a high-saturation reading-girl mascot.

**Architecture:** Today and Profile each render one fixed decorative Next Image scene behind their complete page content. Root PWA metadata handles viewport/status-bar behavior, while shared CSS controls safe-area offsets and glass surfaces. PageSprout keeps its interaction API but renders a transparent generated mascot asset.

**Tech Stack:** Next.js 16, React, CSS, Next Image, PWA metadata/service worker, built-in image generation.

---

### Task 1: Generate and install the mascot

**Files:**
- Create: `public/mascot/reading-girl.png`
- Modify: `src/components/page-sprout.tsx`
- Modify: `src/app/globals.css`

- [ ] Generate one transparent high-saturation storybook illustration of a cute girl sitting cross-legged and reading, with no text or watermark.
- [ ] Copy the final asset into `public/mascot/reading-girl.png`.
- [ ] Replace the CSS face/body spans with Next Image while preserving click, speech, star, motion, compact mode, and the accessible button label.

### Task 2: Make the seasonal scenes full-page glass environments

**Files:**
- Modify: `src/features/today/today-screen.tsx`
- Modify: `src/features/profile/profile-screen.tsx`
- Modify: `src/app/globals.css`

- [ ] Move each scene Image to a full-page background layer.
- [ ] Keep headers and all page content above the background in normal flow.
- [ ] Convert the Today sheet, reading cards, Profile cards, stats, and bottom dock to translucent blurred surfaces; keep quote cards more opaque than secondary cards.
- [ ] Verify headings and body text retain sufficient contrast.

### Task 3: Fix mobile cutout coverage

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/manifest.ts`
- Modify: `src/app/globals.css`
- Modify: `public/sw.js`

- [ ] Preserve `viewportFit: 'cover'` and add explicit Apple capable/status-bar meta tags.
- [ ] Match `html`, `body`, manifest, and theme colors to the bright blue scene fallback.
- [ ] Keep safe-area padding on interactive headers and bottom navigation, not the fixed scene layer.
- [ ] Bump the service-worker cache version.

### Task 4: Verify and ship

- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Inspect Today and Profile at 390×844 for full-page coverage, readable glass, mascot sizing, and no horizontal overflow.
- [ ] Commit and push `main` to trigger Vercel.

Automated tests remain omitted per the user's earlier instruction; verification is lint, production build, and focused mobile visual inspection.
