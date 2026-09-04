# Immersive Seasonal Reading Design

## Goal

Turn the seasonal paintings into full-page environments, fix the visible mobile status-bar gap, soften cards into readable glass surfaces, and replace PageSprout with a cheerful high-saturation girl reading a book.

## Visual System

- Today uses the sunny hillside painting as a fixed, full-viewport background.
- Profile uses the snowy house painting in the same full-viewport treatment.
- Backgrounds continue beneath the top and bottom safe areas.
- Viewport metadata explicitly keeps `viewport-fit=cover` and iOS standalone metadata requests `black-translucent`; `html`, `body`, and theme colors match the artwork as a fallback for browser and Android chrome.
- Reading surfaces use translucent light glass with blur, a quiet border, and soft shadow. Long quotes remain more opaque than secondary cards for legibility.
- The bottom tab bar becomes translucent and keeps its safe-area padding.

## Mascot

- Replace the CSS PageSprout body with one transparent PNG illustration.
- Character: cute young girl sitting cross-legged and reading, warm expressive face, rounded storybook proportions, saturated coral/orange, turquoise, leaf green, and sunny yellow.
- No embedded text, logo, frame, watermark, or opaque background.
- Keep the existing click interaction, growth star, speech bubble, compact mode, and accessible button label.

## Implementation

- Add a full-page scene layer inside Today and Profile rather than limiting images to their headers.
- Keep content in normal document flow above the scene layer.
- Apply `env(safe-area-inset-top)` only to interactive/header content, not to the background layer.
- Add explicit Apple PWA meta tags in the root layout and update manifest/theme colors for status-bar fallback.
- Use Next Image for responsive optimization and service-worker runtime caching.

## Verification

- Lint and production build must pass.
- Inspect Today and Profile at 390×844.
- Confirm no horizontal overflow, artwork covers the full viewport, cards remain readable, and the mascot works in regular and compact modes.
- The user has already authorized direct pushes to `main` so the existing Vercel integration rebuilds automatically.
