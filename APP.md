# ФОРУМ — интерьерный бутик

**Purpose**: Responsive editorial website for the Екатеринбург interior boutique ФОРУМ, prepared for performance, search indexing, and future content replacement.

**Type**: standard app / marketing website

**Status**: active

## What It Does

- Editorial landing page with a restrained cream, walnut, charcoal, and gold visual system, using Montserrat throughout; the hero uses a clean desktop two-column composition with copy on the left and a warm light editorial color grade of the original interior photograph on the right, stacking only on tablet/mobile.
- Navigation for Направления, О нас, Наша команда, События, Контакты; the Events route is available at `#/events`.
- Equal-height directions gallery with a touch-friendly horizontal strip on mobile that no longer traps the page's vertical scroll, preserving the original seven service categories; a horizontal swipe advances exactly one card with smooth snapping, while the detail drawer exposes a scrollable chip list with local brand marks and text fallbacks for the full known partner/factory list.
- Mobile Editorial hero uses a vertical full-screen interior photo with an animated cream headline panel entering from the bottom; supporting copy and CTAs remain in normal flow immediately below the image.
- Wide responsive direction detail drawer: on desktop it uses a two-column image/text composition so the title and description are visible immediately; on mobile it becomes a full-height sheet with the same content, accessible keyboard/backdrop controls, and left/right swipe navigation.
- Team route at `#/team` with a split editorial hero, department filters for the seven directions plus Logistics, a filtered vertical staff roster, and one active profile spread instead of a card grid; the three individual portraits are curated 560×820 WebP assets with cache-busted URLs.
- Events route at `#/events` with a warm editorial event announcement, a Telegram-derived post feed, a registration form collecting name and phone, and a Telegram channel CTA. Post cards are deterministically categorized and formatted so new publications keep the same visual language without rewriting the original copy.
- Interactive Yandex map embed for г. Екатеринбург, ул. Хохрякова, 18.
- Lightweight front end: local WebP photography, lazy-loaded below-the-fold images, cinematic title/image reveal masks, restrained cursor-responsive hero tilt and spotlight, desktop sequential card reveals with an immediate all-card reveal on mobile, Lenis-powered inertial wheel scrolling with touch-safe horizontal cards, smooth hash navigation with sticky-header offset, reduced-motion fallback, metadata, and LocalBusiness JSON-LD.

## Main Files

- `src/components/variants/VariantEditorial.tsx`: home page and Editorial visual system.
- `src/components/TeamPage.tsx`: editorial team page with a split hero and interactive roster.
- `src/components/SiteHeader.tsx`: shared responsive header, mobile menu, and animated ФОРУМ/4ROOM coin wordmark.
- `src/lib/brand.ts`: single source of truth for brand, contacts, directions, partner/factory lists, advantages, and placeholder team content.
- `src/lib/scroll.ts`: global Lenis lifecycle plus anchor/top scrolling helpers.
- `src/components/DirectionDrawer.tsx`: accessible responsive detail drawer for the existing direction cards.
- `src/components/EventsPage.tsx`: editorial Events page, Telegram feed states, featured-event block, and registration form.
- `src/api/telegram.ts`: public `t.me/s/salon4room` parser and deterministic post categorization/title/excerpt formatting.
- `src/api/procedures.ts`: Events page query, idempotent feed sync, registration storage/notification hook, and `/event` bot command handler.
- `schema.prisma` and `migrations/20260903210000_events_telegram/`: Telegram posts, featured events, registrations, and sync state.
- `public/images/events/phonitura-business-breakfast.jpg`: supplied PHONITURA poster used by the static fallback event card.
- `public/images/directions/`: curated 4:5 WebP editorial interiors used inside the existing direction categories, unified around the brighter warm-white, pale oak, limestone, textile, charcoal, and muted brass palette of the original series.
- `public/images/team/`: temporary AI-generated team photography; replace these files later while preserving dimensions/filenames.
- `public/images/brands/`: locally cached 128px brand marks sourced from public brand domains via favicon endpoints; unsupported or unnamed suppliers use a text-only wordmark fallback.

## Brand Assets

- `public/logo/forum-lockup-black-gold.png` — original client-provided logo (black wordmark + gold ring icon), baked on a white background (JPEG, no alpha)
- `public/logo/lockup-dark-on-light.png` — **derived asset**: same lockup with white chroma-keyed to transparent (`convert ... -fuzz 8% -transparent white`), used on light backgrounds (Variant 1)
- `public/logo/icon-gold-transparent.png` — **derived asset**: gold-only ring icon with transparent background (chroma-keyed from `4room-logo-gold.png`), works on both light and dark backgrounds; used as favicon-style mark throughout
- `public/logo/4room-logo-black.png` — icon-only, real alpha channel, usable on light backgrounds
- ⚠️ `public/logo/forum-lockup-white-gold.png` and `public/logo/4room-logo-white.png` are **unusable as delivered**: both are white artwork flattened onto a white JPEG background (no alpha channel), so the white parts are invisible/unrecoverable. For dark-background contexts (Variant 2, Variant 3 header/footer) the "ФОРУМ" wordmark is rendered as live styled text instead of an image, paired with `icon-gold-transparent.png`.
- Brand gold sampled from the logo file: `rgb(213,151,0)` ≈ `#D59700` (used `#C98A12` for a slightly deeper/more accessible variant on light backgrounds).

## Content Source

Real client content was taken from the old site (salon4room.ru) and updated for the ФОРУМ rebrand — see `src/lib/brand.ts` for the single source of truth. Photography is AI-generated (`generate_media`, quality: high), converted to WebP, and grouped under `public/images/`; the three semantically mismatched direction images were replaced, doors/light/textile were regenerated without changing their subjects, and the original kitchen image was restored to keep the brighter editorial language.

## Integrates With

- **Internal**: SQLite/Prisma for cached Telegram posts, events, registrations, and sync state.
- **External**: public Telegram channel `@salon4room`; optional Telegram Bot API notification/update flow when the bot credentials and recipient chat are configured.

## Use Cases

- Share the app URL with the client for visual approval.
- Replace placeholder team images and copy in `src/lib/brand.ts` when the real materials are ready.
- Add the real event details through the bot `/event` format and connect the manager recipient chat before enabling live registration notifications.
- The GitHub Pages mirror remains a static frontend; the dynamic RPC-backed feed and registration path are available from the Adaptive app URL unless a public API deployment is added for the mirror.

## Known Environment Quirk (for future agents)

Verifying this app via `agent-browser` while logged in as the owner opens it inside the platform's **edit-mode wrapper** (chrome with tabs/Share/agent-status), which embeds the app in a **cross-origin iframe** (`#appFrame`). Consequences discovered while building this app:
- Plain `eval`/`get text`/programmatic `scroll` on the top-level document only see the wrapper page, not the app — and CLI state seems to drift to `about:blank` on any invocation that isn't chained via `batch --bail` with the preceding `open`.
- `snapshot -i` DOES resolve into the cross-origin iframe (accessibility tree access works even though DOM access doesn't), and element refs support `click`/`get box`.
- Ref-based `click @eN` on iframe-inlined refs did not reliably trigger the click in this session; **coordinate-based `mouse move/down/up` at the exact box returned by `get box @eN` worked reliably**.
- A persistent "Active Agents" tooltip overlay from the platform chrome can visually and functionally cover UI directly beneath it (e.g. it overlapped the "Вариант 2" tab), causing coordinate clicks centered in that area to silently hit the overlay instead. Clicking an unobstructed edge of the target's bounding box fixed it.
