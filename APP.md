# ФОРУМ — интерьерный бутик

**Purpose**: Responsive editorial website for the Екатеринбург interior boutique ФОРУМ, prepared for performance, search indexing, and future content replacement.

**Type**: standard app / marketing website

**Status**: active

## What It Does

- Editorial landing page with a restrained cream, walnut, charcoal, and gold visual system, using Montserrat throughout; the hero uses a clean desktop two-column composition with copy on the left and a warm light editorial color grade of the original interior photograph on the right, stacking only on tablet/mobile.
- Navigation for Направления, О нас, Наша команда, События, Контакты; the Events route is available at `#/events`, while legacy `#/directions` and `#/about` hashes are normalized to the home-page anchors.
- Equal-height directions gallery with a touch-friendly horizontal strip on mobile that no longer traps the page's vertical scroll, now covering eight service categories including лепнина и молдинги; a horizontal swipe advances exactly one card with smooth snapping, while the detail drawer exposes clickable supplier chips that open official brand/factory sites in a new tab where a URL is known.
- Mobile Editorial hero uses a vertical full-screen interior photo with an animated cream headline panel entering from the bottom; supporting copy and CTAs remain in normal flow immediately below the image.
- Wide responsive direction detail drawer: on desktop it uses a two-column image/text composition so the title and description are visible immediately; on mobile it becomes a full-height sheet with the same content, accessible keyboard/backdrop controls, and left/right swipe navigation.
- Team route at `#/team` with a split editorial hero and a single team-level contact footer; department filters and individual employee profile cards are intentionally removed.
- Visualizer route at `#/visualizer` with a photorealistic product render of one upright tile slab on a low plinth: PBR-style studio lighting, color-faithful source textures, derived bump/displacement/roughness maps for visible stone relief, strongly adjustable light intensity and warm/cool temperature, automatic dark studio contrast for light tiles, real width/length/thickness geometry, an attached dimension ruler that follows orbit/zoom, controlled orbit camera, immediate material selection, wheel zoom isolated from page scrolling, and a catalog of unique visual material textures from confirmed Emilceramica, 41zero42, and Florim records with manufacturer/color/search filters and official source links.
- Events route at `#/events` with a warm editorial event announcement, a Telegram-derived post feed, a registration form collecting name and phone, and a Telegram channel CTA. Each post is rendered as an interactive gallery using every exported photo and detected video from its Telegram media group; inline videos use `controls`, `playsInline`, and `preload="none"`, while Telegram media too large for the public preview falls back to a direct Telegram video link. No post content is hand-authored in the UI. The featured event CTA opens the event-registration modal, while the home hero and footer open the contact modal with direct phone/Telegram links for Макс.
- Shared editorial button variants keep the home hero, event registration, Telegram, and contact actions coherent across desktop and mobile: calm outline/warm-paper treatments for secondary actions, a light-on-dark treatment for forms, and a single stronger dark CTA for the featured event.
- Interactive Yandex map embed for г. Екатеринбург, ул. Хохрякова, 18.
- Lightweight front end: local WebP photography, lazy-loaded below-the-fold images, cinematic title/image reveal masks, restrained cursor-responsive hero tilt and spotlight, viewport-triggered group reveal for the full directions grid, Lenis-powered inertial wheel scrolling with touch-safe horizontal cards, numeric smooth hash navigation with a clear sticky-header gap, reduced-motion fallback, metadata, and LocalBusiness JSON-LD.

## Main Files

- `src/components/variants/VariantEditorial.tsx`: home page and Editorial visual system.
- `src/components/TeamPage.tsx`: editorial team page with a split hero and interactive roster.
- `src/components/SiteHeader.tsx`: shared responsive header, mobile menu, and animated ФОРУМ/4ROOM coin wordmark.
- `src/lib/brand.ts`: single source of truth for brand, contacts, directions, partner/factory lists, advantages, and placeholder team content.
- `src/lib/scroll.ts`: global Lenis lifecycle plus anchor/top scrolling helpers.
- `src/components/DirectionDrawer.tsx`: accessible responsive detail drawer for the existing direction cards.
- `src/components/EventsPage.tsx`: editorial Events page, static Telegram export, interactive post galleries, featured-event block, registration form, and modal trigger.
- `src/components/Tile3DScene.tsx`: physically scaled upright tile-on-plinth renderer with PBR-style studio lighting, derived relief maps, dark/light studio palettes, attached dimension ruler, orbit controls, shadows, controlled framing, and runtime texture replacement.
- `src/components/VisualizerPage.tsx` and `src/lib/materials.ts`: tile-on-plinth visualizer UI, live light controls, duplicate-texture collapse, confirmed manufacturer records grouped by color, manufacturer/color/search filters, immediate selection, and official source/download links.
- `public/assets/bathroom/bathroom_extended.gltf` + `bathroom.bin`: detailed GLTF 2.0 scene and external binary buffer; the optimized `bathroom.bin` is approximately 21.5 MB (the original source buffer was approximately 56 MB), so keep the asset path intact and account for download/memory cost before production publication.
- The GLTF metadata identifies the generator and PBRT scene but contains no embedded license, copyright, or attribution record; verify the original scene's usage rights before publishing it to GitHub Pages.
- `src/components/RegistrationModal.tsx` and `src/lib/registration.ts`: shared event/contact modal flows, Russian phone formatting, direct contact links, and environment-aware submission (public Adaptive endpoint for GitHub Pages, local Adaptive/standalone fallback).
- `src/api/server.ts`: CORS-enabled public `POST /api/register` route for both event registrations and contact requests; the Adaptive app must have “Share via link” enabled for anonymous GitHub Pages submissions.
- `src/api/telegram.ts`: public `t.me/s/salon4room` parser, grouped-photo/video extraction, deterministic post categorization/title/excerpt formatting, and filtering for Telegram system-service posts such as pinned photos and profile/wallpaper updates. Exhibition posts with Cersaie-style collection and factory language are classified as materials rather than objects.
- `src/api/procedures.ts`: Events page query, idempotent feed sync, event/contact request storage and notification hooks, event hydration from the static export, and the interactive Telegram webhook handler with per-chat draft state.
- `scripts/sync-telegram.ts`: standalone export command; downloads every current public Telegram photo locally, preserves the existing featured event, and writes `public/events.json`.
- `scripts/telegram-bot.ts`: retained standalone Telegram long-polling bot for independent hosting; GitHub Actions no longer polls Telegram because the production bot uses the Adaptive webhook.
- `scripts/standalone-server.ts`: optional Node server for serving `dist`, live `events.json`, and Telegram-backed registration submissions.
- `public/events.json`: generated, real Telegram content snapshot; do not edit manually, regenerate with `npm run sync:telegram`.
- `schema.prisma` and `migrations/20260903210000_events_telegram/`, `migrations/20260904100432_auto/`, `migrations/20260923222426_auto/`: Telegram posts and media metadata, featured events, registrations, contact requests, and sync state.
- `public/images/events/phonitura-business-breakfast.jpg`: supplied PHONITURA poster kept as optional event artwork.
- `public/images/directions/`: curated 4:5 WebP editorial interiors used inside the existing direction categories, unified around the brighter warm-white, pale oak, limestone, textile, charcoal, and muted brass palette of the original series.
- `public/images/team/team.webp`: temporary AI-generated group hero image for the team-level page; individual portrait assets remain available for future use but are not rendered in the current team tab.
- `public/images/brands/`: locally cached 128px brand marks sourced from public brand domains via favicon endpoints; unsupported or unnamed suppliers use a text-only wordmark fallback.
- Visualizer material previews and source files point to official Emilceramica, 41zero42, and Florim catalog/CDN URLs; the 41zero42 Solo Out Grey preview uses a clean single-surface image extracted from the official 40 × 80 archive rather than a lifestyle image containing six joined tiles. Unverified/generated selections are intentionally excluded until additional partner materials are sourced and approved.

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
- Add the real event details through the bot's persistent Russian keyboard and connect the manager recipient chat before enabling live registration notifications.
- For independent hosting, run `npm run sync:telegram` before each build, serve `dist` with `npm run serve:standalone`, and run `npm run bot:telegram` alongside it with `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`, and `TELEGRAM_NOTIFY_CHAT_ID`.
- GitHub Pages is the public static surface and contains a generated real Telegram export rather than hand-written fallback posts. A GitHub Actions worker refreshes the public channel feed every five minutes and on manual dispatch, then commits changed feed exports. The manager bot uses the Adaptive webhook at `/api/telegram/webhook`, so button responses are immediate and no polling offset is needed. Registration from that mirror calls the Adaptive app's public `on.adaptive.ai/api/register` endpoint, while independent hosting uses the local `/api/register` route. Adaptive Telegram crons are disabled.

## Telegram Event Workflow

1. Create or rotate the bot token in `@BotFather` and set `TELEGRAM_BOT_TOKEN` on the host. Set `TELEGRAM_WEBHOOK_SECRET` for the Adaptive webhook and `TELEGRAM_ADMIN_CHAT_ID` (or the configured notify chat) for manager access.
2. Register Telegram's webhook at `https://4room-mockups-asbestvechen501008103.on.adaptive.ai/api/telegram/webhook` with the same secret. The GitHub workflow `.github/workflows/telegram-bot-poll.yml` is feed-only and must not call `getUpdates` while the webhook is active. For independent hosting, start `npm run bot:telegram` instead.
3. In a private chat with the bot, press Start and use the persistent Russian keyboard: `Создать мероприятие`, `Обновить посты`, `Проверить заявки`, `Удалить мероприятие`.
4. Answer the prompts in order:

   ```text
   Название мероприятия?
   Дата? — ДД.ММ.ГГГГ
   Время? — ЧЧ:ММ
   Место?
   Описание мероприятия?
   Лимит участников? — число или «пропустить»
   ```

   The `Отмена` button or `/cancel` clears the current draft. Drafts are isolated by Telegram chat: the standalone bot keeps them in `data/telegram-event-drafts.json`, while the Adaptive webhook keeps them in `TelegramState`.

5. The retained multi-line format is also accepted for compatibility:

   ```text
   /event

   Название: Бизнес-завтрак с PHONITURA
   Дата: 27.09.2026
   Время: 12:00
   Место: 4ROOM, ул. Хохрякова, 18
   Описание: Готовые кейсы, живые примеры и ответы на вопросы о подборе акустических решений.
   Лимит: 25
   ```

6. The bot validates that the date is in the future, stores the published event in the Adaptive database, and confirms it in Telegram. `Обновить посты` synchronously refreshes the Adaptive feed cache; the GitHub Actions feed job refreshes the static GitHub Pages export.
7. Run `npm run serve:standalone` to serve the site and registration endpoint. Set `TELEGRAM_NOTIFY_CHAT_ID` so form submissions are sent to the manager, and connect Gmail before enabling email duplication.

## Known Environment Quirk (for future agents)

Verifying this app via `agent-browser` while logged in as the owner opens it inside the platform's **edit-mode wrapper** (chrome with tabs/Share/agent-status), which embeds the app in a **cross-origin iframe** (`#appFrame`). Consequences discovered while building this app:
- Plain `eval`/`get text`/programmatic `scroll` on the top-level document only see the wrapper page, not the app — and CLI state seems to drift to `about:blank` on any invocation that isn't chained via `batch --bail` with the preceding `open`.
- `snapshot -i` DOES resolve into the cross-origin iframe (accessibility tree access works even though DOM access doesn't), and element refs support `click`/`get box`.
- Ref-based `click @eN` on iframe-inlined refs did not reliably trigger the click in this session; **coordinate-based `mouse move/down/up` at the exact box returned by `get box @eN` worked reliably**.
- A persistent "Active Agents" tooltip overlay from the platform chrome can visually and functionally cover UI directly beneath it (e.g. it overlapped the "Вариант 2" tab), causing coordinate clicks centered in that area to silently hit the overlay instead. Clicking an unobstructed edge of the target's bounding box fixed it.
