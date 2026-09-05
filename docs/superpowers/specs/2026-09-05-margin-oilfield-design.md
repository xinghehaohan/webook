# Margin Oilfield Design

## Goal

Make Margin Roaming a continuous, book-centered exploration experience: return to the exact book and card just viewed, then keep drilling from personal highlights into public reactions, popular passages, chapters, and whole-book reviews.

## Confirmed Root Causes

- The opinion page uses a hard-coded `/margins` link. That creates a new list navigation at scroll position zero instead of returning through history.
- The current stream flattens each book's 20 popular highlights and then slices the first 12, so the first candidate book monopolizes the page.
- Candidate books currently come only from the shelf/history and the UI stores no last-explored book.
- The PWA already emits `viewport-fit=cover` and `black-translucent`. On affected iOS 26 releases, WebKit can reserve a solid status-bar rectangle and report a zero top safe-area inset. CSS cannot paint outside that reclaimed viewport, so the product needs both standards-based edge-to-edge behavior and a visually matched status-bar fallback.

## Experience

### Continue the current book

The first Margin section is a compact “继续深挖” card for the last book/card opened. Returning from opinions uses browser history when possible, preserving scroll and loaded state; a card-anchor fallback handles direct links and reloads.

### Five layers

1. **刚才读到** — the exact passage and comment thread last opened.
2. **你的划线共鸣** — the user's own highlighted passages, enriched with other readers' comments on the same ranges.
3. **热门地层** — public popular highlights and their discussion counts.
4. **章节钻探** — choose a chapter and request that chapter's popular highlights.
5. **整本回声** — public whole-book reviews, clearly separated from passage comments.

The focused book stays selected until the reader chooses another recent/noted/most-read book. A “再往下一层” action advances content without turning the page into an endless undifferentiated feed.

## Data Sources

- `/shelf/sync`: recently read books.
- `/user/notebooks`: older books with personal highlights, thoughts, or bookmarks. Fetch bounded pages with `count` and the previous page's final `sort` as top-level `lastSort`; stop on `hasMore=0`, a non-advancing cursor, or 60 books.
- `/readdata/detail`: most-read books for the current month using `mode: monthly`; accept only `readLongest[].book` entries and exclude album-only entries from book endpoints.
- `/book/bookmarklist`: the user's highlight text and exact ranges.
- `/book/readreviews`: public comments for those exact ranges.
- `/book/bestbookmarks`: popular highlights globally or within a chosen chapter.
- `/book/chapterinfo`: chapter drill-down.
- `/review/list`: whole-book public reviews.

Candidate lists are deduplicated by `bookId`. Partial API failures degrade one layer only and never erase already loaded layers.

Personal ranges are not sent blindly to `/book/readreviews`: match `/book/bookmarklist` entries against `/book/bestbookmarks` by `bookId + chapterUid + range`, also accepting the popular item's simplified/traditional range variants. Request public comments only for matched ranges; unmatched personal highlights remain visible with an honest “暂未发现公开共鸣” state.

## Navigation State

- Persist `lastExploredCard` with the current API-key namespace.
- Give every margin card a stable DOM id.
- Opinion links include an internal fallback return target.
- The opinion back control calls history back for normal in-app entry; direct entry falls back to `/margins?resume=<cardId>`.
- Margin Roaming restores the selected book and scrolls the resumed card into view after async content is present.

## Notch Treatment

- Keep explicit Apple standalone, `black-translucent`, and `viewport-fit=cover` metadata.
- Use `100vh` for the fixed artwork layer in standalone mode and keep controls inset with `env()`/`constant()` fallbacks.
- Match document, manifest, and theme colors to the painting's top blue so affected WebKit versions show a continuous color field rather than an unrelated empty band.

## Visual Follow-up

- Today header date/title are white with a small dark shadow.
- Replace the current glossy mascot with the approved transparent 2D hand-drawn reading girl using green socks, yellow leaf motifs, and violet toes.

## Verification

- Lint and production build.
- At 390×844, verify no overflow and visual continuity at the top.
- Reproduce: open a lower margin card, read opinions, return, and confirm the same card/book remains in context.
- Verify each exploration layer can fail independently without losing the rest of the page.
- Push `main` after verification under the user's existing deployment authorization.
