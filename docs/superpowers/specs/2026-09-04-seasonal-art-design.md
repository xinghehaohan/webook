# PageSprout Seasonal Art Integration

## Goal

Use the two supplied vertical paintings to make PageSprout feel more vivid and collectible without reducing the readability of original passages or reader opinions.

## Approved Direction

- The sunny hillside painting becomes the visual scene at the top of the Today tab.
- The snowy house painting becomes the visual scene at the top of the Profile tab.
- Both images are copied into `public/scenes/` and served as local PWA assets.
- Text remains above a controlled gradient/scrim with accessible contrast.
- Reading cards and opinion threads keep their existing paper surfaces; artwork never sits directly behind long-form reading content.
- Existing PageSprout character interaction remains visible above the Today artwork.
- Images use `object-fit: cover` with mobile-first focal positions and responsive cropping.
- Scene backgrounds extend behind iOS and Android display cutouts while headings remain inset by `env(safe-area-inset-top)`.
- Motion is limited to the app's existing subtle animation behavior and respects reduced-motion settings.

## Scope

This is a visual integration only. It does not add theme settings, seasonal scheduling, image uploads, new navigation, or a content-management layer.

## Verification

- Check Today and Profile at a 390×844 viewport, including simulated safe-area padding.
- Confirm header text contrast, no horizontal overflow, and clean cropping.
- Run lint and production build.
- Push `main` after verification so the existing Vercel integration rebuilds automatically.
