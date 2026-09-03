import { db } from "@/api/db";
import { env } from "@/lib/env";
import { fetchTelegramPreview, TELEGRAM_CHANNEL_URL } from "@/api/telegram";
import type { EventPostCategory, FeaturedEvent, EventsPageData, TelegramPost } from "@/lib/events";
import { EVENT_TIMEZONE, parseEventCommand } from "@/lib/telegram-event";
import { mcp } from "@adaptive-ai/sdk/server";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

const TELEGRAM_FEED_SYNC_KEY = "telegram_feed_last_synced_at";
const TELEGRAM_UPDATE_OFFSET_KEY = "telegram_bot_update_offset";

function serializePost(post: {
  id: string;
  telegramMessageId: number;
  channelUsername: string;
  publishedAt: Date;
  category: string;
  title: string;
  text: string;
  excerpt: string;
  imageUrl: string | null;
  telegramUrl: string;
}): TelegramPost {
  return {
    ...post,
    category: post.category as EventPostCategory,
    publishedAt: post.publishedAt.toISOString(),
    imageUrls: post.imageUrl ? [post.imageUrl] : [],
  };
}

function serializeEvent(event: {
  id: string;
  title: string;
  startsAt: Date;
  displayTimezone: string;
  location: string;
  description: string;
  capacity: number | null;
  imageUrl: string | null;
}): FeaturedEvent {
  return {
    ...event,
    startsAt: event.startsAt.toISOString(),
  };
}

async function getState(key: string) {
  return db.telegramState.findUnique({ where: { key } });
}

async function setState(key: string, value: string) {
  return db.telegramState.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

async function telegramBotRequest<T>(method: string, body: Record<string, unknown> = {}) {
  if (!env.TELEGRAM_BOT_TOKEN) throw new Error("Telegram bot is not configured");
  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json() as { ok?: boolean; result?: T; description?: string };
  if (!response.ok || !payload.ok) throw new Error(payload.description ?? `Telegram ${method} failed`);
  return payload.result as T;
}

async function notifyRegistration(event: FeaturedEvent, fullName: string, phone: string) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_NOTIFY_CHAT_ID) return "not_configured" as const;
  await telegramBotRequest("sendMessage", {
    chat_id: env.TELEGRAM_NOTIFY_CHAT_ID,
    text: [
      "Новая заявка на мероприятие",
      "",
      `Мероприятие: ${event.title}`,
      `Имя: ${fullName}`,
      `Телефон: ${phone}`,
    ].join("\n"),
  });
  return "sent" as const;
}

export async function health() {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    db: await db.$queryRaw`SELECT 1 as result`
      .then(() => "connected")
      .catch(() => "disconnected"),
    env: env.VITE_NODE_ENV,
  };
}

export async function getEventsPage(): Promise<EventsPageData> {
  const [posts, event, synced] = await Promise.all([
    db.telegramPost.findMany({ orderBy: { publishedAt: "desc" }, take: 12 }),
    db.event.findFirst({
      where: { isPublished: true, startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
    }),
    getState(TELEGRAM_FEED_SYNC_KEY),
  ]);
  return {
    featuredEvent: event ? serializeEvent(event) : null,
    posts: posts.map(serializePost),
    channelUrl: TELEGRAM_CHANNEL_URL,
    lastSyncedAt: synced?.value ?? null,
  };
}

export async function syncTelegramFeed() {
  const posts = await fetchTelegramPreview();
  for (const post of posts) {
    await db.telegramPost.upsert({
      where: { telegramMessageId: post.telegramMessageId },
      create: {
        telegramMessageId: post.telegramMessageId,
        channelUsername: post.channelUsername,
        publishedAt: new Date(post.publishedAt),
        category: post.category,
        title: post.title,
        text: post.text,
        excerpt: post.excerpt,
        imageUrl: post.imageUrl,
        telegramUrl: post.telegramUrl,
      },
      update: {
        channelUsername: post.channelUsername,
        publishedAt: new Date(post.publishedAt),
        category: post.category,
        title: post.title,
        text: post.text,
        excerpt: post.excerpt,
        imageUrl: post.imageUrl,
        telegramUrl: post.telegramUrl,
      },
    });
  }
  const syncedAt = new Date().toISOString();
  await setState(TELEGRAM_FEED_SYNC_KEY, syncedAt);
  console.log(`[telegram] synced ${posts.length} public channel posts`);
  return { synced: posts.length, syncedAt };
}

export async function createEventRegistration(input: { fullName: string; phone: string; eventId?: string }) {
  const fullName = input.fullName.trim().replace(/\s+/g, " ");
  const phone = input.phone.trim();
  if (fullName.length < 3) throw new Error("Укажите имя и фамилию");
  if (!/^[+\d][\d\s()-]{9,}$/.test(phone)) throw new Error("Укажите корректный номер телефона");
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_NOTIFY_CHAT_ID) {
    throw new Error("Запись временно недоступна — попробуйте связаться с салоном по телефону");
  }

  const event = input.eventId
    ? await db.event.findUnique({ where: { id: input.eventId } })
    : await db.event.findFirst({ where: { isPublished: true, startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" } });
  if (!event || !event.isPublished || event.startsAt < new Date()) throw new Error("Регистрация на мероприятие пока не открыта");

  if (event.capacity) {
    const registrationsCount = await db.eventRegistration.count({ where: { eventId: event.id, status: "new" } });
    if (registrationsCount >= event.capacity) throw new Error("Свободных мест больше нет");
  }

  const registration = await db.eventRegistration.create({ data: { eventId: event.id, fullName, phone } });
  const notification = await notifyRegistration(serializeEvent(event), fullName, phone);
  return { id: registration.id, notification };
}

export async function syncTelegramBot() {
  if (!env.TELEGRAM_BOT_TOKEN) return { status: "not_configured" as const, processed: 0 };
  const offset = Number((await getState(TELEGRAM_UPDATE_OFFSET_KEY))?.value ?? "0");
  type TelegramUpdate = {
    update_id: number;
    message?: { chat: { id: number; type: string }; text?: string };
  };
  const updates = await telegramBotRequest<TelegramUpdate[]>("getUpdates", {
    offset,
    timeout: 0,
    allowed_updates: ["message"],
  });
  let processed = 0;
  for (const update of updates ?? []) {
    await setState(TELEGRAM_UPDATE_OFFSET_KEY, String(update.update_id + 1));
    processed += 1;
    const message = update.message;
    if (!message?.text || !/^\/event(?:@\w+)?\b/i.test(message.text)) continue;
    if (env.TELEGRAM_ADMIN_CHAT_ID && String(message.chat.id) !== env.TELEGRAM_ADMIN_CHAT_ID) continue;
    const parsed = parseEventCommand(message.text);
    if (!parsed) {
      await telegramBotRequest("sendMessage", {
        chat_id: message.chat.id,
        text: "Не смог разобрать событие. Нужны поля: Название, Дата, Время, Место, Описание и необязательно Лимит.",
      });
      continue;
    }
    const existing = await db.event.findFirst({
      where: { isPublished: true, startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
    });
    const event = existing
      ? await db.event.update({ where: { id: existing.id }, data: { ...parsed, displayTimezone: EVENT_TIMEZONE, isPublished: true } })
      : await db.event.create({ data: { ...parsed, displayTimezone: EVENT_TIMEZONE } });
    await telegramBotRequest("sendMessage", {
      chat_id: message.chat.id,
      text: `Событие обновлено на сайте:\n${event.title}\n${event.startsAt.toLocaleString("ru-RU", { timeZone: EVENT_TIMEZONE })}`,
    });
  }
  return { status: "ok" as const, processed };
}

// One-time maintainer helper for publishing the generated standalone export.
export async function publishTelegramExport(input: { connectionToken: string; owner: string; repo: string }) {
  const githubBase = `https://api.github.com/repos/${input.owner}/${input.repo}`;
  const headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  const request = async <T>(url: string, method: string, body?: unknown) => {
    const response = await mcp.connectedApiRequest({ connectionToken: input.connectionToken, url, method, headers, body });
    if (response.status < 200 || response.status >= 300) throw new Error(`GitHub request failed (${response.status})`);
    return response.body as T;
  };
  type Ref = { object: { sha: string } };
  type Commit = { tree: { sha: string } };
  type GitObject = { sha: string; html_url?: string };
  const ref = await request<Ref>(`${githubBase}/git/ref/heads/main`, "GET");
  const current = await request<Commit>(`${githubBase}/git/commits/${ref.object.sha}`, "GET");
  const root = process.cwd();
  const assetNames = (await readdir(resolve(root, "dist/assets"))).filter((name) => /^index-.*\.(js|css)$/.test(name));
  const textFiles = [
    "APP.md", "package.json", "schema.prisma", "src/api/procedures.ts", "src/api/telegram.ts",
    "src/components/EventsPage.tsx", "src/index.css", "src/lib/events.ts", "scripts/sync-telegram.ts",
    "scripts/telegram-bot.ts", "scripts/standalone-server.ts", "public/events.json", "dist/events.json",
    "dist/index.html", ...assetNames.map((name) => `dist/assets/${name}`),
  ];
  const exportedEvents = JSON.parse(await readFile(resolve(root, "public/events.json"), "utf8")) as { posts?: Array<{ telegramMessageId: number; imageUrls?: string[]; imageUrl?: string | null }> };
  const imageNames = new Set(["phonitura-business-breakfast.jpg"]);
  for (const post of exportedEvents.posts ?? []) {
    for (const imageUrl of post.imageUrls ?? (post.imageUrl ? [post.imageUrl] : [])) {
      const match = imageUrl.match(/(?:^|\/)(telegram-[^/]+\.(?:jpg|png|webp))$/);
      if (match) imageNames.add(match[1]);
    }
  }
  const imageEntries = await Promise.all(Array.from(imageNames).map(async (name) => {
    const blob = await request<GitObject>(`${githubBase}/git/blobs`, "POST", {
      content: await readFile(resolve(root, `public/images/events/${name}`), "base64"),
      encoding: "base64",
    });
    return { path: `images/events/${name}`, mode: "100644", type: "blob", sha: blob.sha };
  }));
  const tree = await request<GitObject>(`${githubBase}/git/trees`, "POST", {
    base_tree: current.tree.sha,
    tree: [
      ...await Promise.all(textFiles.map(async (relativePath) => ({
        path: relativePath.startsWith("dist/") ? relativePath.slice("dist/".length) : relativePath,
        mode: "100644",
        type: "blob",
        content: await readFile(resolve(root, relativePath), "utf8"),
      }))),
      ...imageEntries,
    ],
  });
  const commit = await request<GitObject>(`${githubBase}/git/commits`, "POST", {
    message: "Publish Telegram gallery feed",
    tree: tree.sha,
    parents: [ref.object.sha],
  });
  await request(`${githubBase}/git/refs/heads/main`, "PATCH", { sha: commit.sha, force: false });
  return { commit: commit.sha, url: commit.html_url ?? null, images: imageEntries.length };
}
