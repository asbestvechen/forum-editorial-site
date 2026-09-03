import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as runtime from "@prisma/client/runtime/client";
import { e as env } from "./env-BdD-7B3a.js";
import { getQueue } from "@adaptive-ai/sdk/server";
import "zod";
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client"
    },
    "output": {
      "value": "/home/computer/4room-mockups/generated",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "client"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "debian-openssl-3.0.x",
        "native": true
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "/home/computer/4room-mockups/schema.prisma",
    "isCustomOutput": true
  },
  "relativePath": "..",
  "clientVersion": "6.19.3",
  "engineVersion": "c2990dca591cba766e3b7ef5d9e8a84796e47ab7",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "sqlite",
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DB_FILE_NAME",
        "value": null
      }
    }
  },
  "inlineSchema": 'generator client {\n  provider   = "prisma-client"\n  output     = "./generated"\n  engineType = "client"\n}\n\ndatasource db {\n  provider = "sqlite"\n  url      = env("DB_FILE_NAME")\n}\n\nmodel User {\n  // Adaptive AI platform columns (do not change)\n  id     String  @id\n  name   String?\n  image  String?\n  handle String?\n\n  // Additional columns can be added here\n}\n\nmodel TelegramPost {\n  id                String   @id @default(cuid())\n  telegramMessageId Int      @unique\n  channelUsername   String\n  publishedAt       DateTime\n  category          String\n  title             String\n  text              String\n  excerpt           String\n  imageUrl          String?\n  telegramUrl       String\n  createdAt         DateTime @default(now())\n  updatedAt         DateTime @updatedAt\n}\n\nmodel Event {\n  id              String              @id @default(cuid())\n  title           String\n  startsAt        DateTime\n  displayTimezone String              @default("Asia/Yekaterinburg")\n  location        String\n  description     String\n  capacity        Int?\n  imageUrl        String?\n  isPublished     Boolean             @default(true)\n  createdAt       DateTime            @default(now())\n  updatedAt       DateTime            @updatedAt\n  registrations   EventRegistration[]\n}\n\nmodel EventRegistration {\n  id        String   @id @default(cuid())\n  eventId   String\n  fullName  String\n  phone     String\n  status    String   @default("new")\n  createdAt DateTime @default(now())\n  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)\n\n  @@index([eventId, createdAt])\n}\n\nmodel TelegramState {\n  key       String   @id\n  value     String\n  updatedAt DateTime @updatedAt\n}\n',
  "inlineSchemaHash": "b8ac2d9629965feafb9ab191ddd4dcb3dc22fb9279760e93566ff7a9facc7c08",
  "copyEngine": true,
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "dirname": ""
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"image","kind":"scalar","type":"String"},{"name":"handle","kind":"scalar","type":"String"}],"dbName":null},"TelegramPost":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"telegramMessageId","kind":"scalar","type":"Int"},{"name":"channelUsername","kind":"scalar","type":"String"},{"name":"publishedAt","kind":"scalar","type":"DateTime"},{"name":"category","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"text","kind":"scalar","type":"String"},{"name":"excerpt","kind":"scalar","type":"String"},{"name":"imageUrl","kind":"scalar","type":"String"},{"name":"telegramUrl","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Event":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"startsAt","kind":"scalar","type":"DateTime"},{"name":"displayTimezone","kind":"scalar","type":"String"},{"name":"location","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"capacity","kind":"scalar","type":"Int"},{"name":"imageUrl","kind":"scalar","type":"String"},{"name":"isPublished","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"registrations","kind":"object","type":"EventRegistration","relationName":"EventToEventRegistration"}],"dbName":null},"EventRegistration":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"eventId","kind":"scalar","type":"String"},{"name":"fullName","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"event","kind":"object","type":"Event","relationName":"EventToEventRegistration"}],"dbName":null},"TelegramState":{"fields":[{"name":"key","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null}},"enums":{},"types":{}}');
config.engineWasm = void 0;
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("node:buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_bg.sqlite.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_bg.sqlite.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  }
};
function getPrismaClientClass(dirname) {
  config.dirname = dirname;
  return runtime.getPrismaClient(config);
}
runtime.Extensions.getExtensionContext;
({
  DbNull: runtime.objectEnumValues.classes.DbNull,
  JsonNull: runtime.objectEnumValues.classes.JsonNull,
  AnyNull: runtime.objectEnumValues.classes.AnyNull
});
runtime.objectEnumValues.instances.DbNull;
runtime.objectEnumValues.instances.JsonNull;
runtime.objectEnumValues.instances.AnyNull;
runtime.makeStrictEnum({
  Serializable: "Serializable"
});
runtime.Extensions.defineExtension;
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
const PrismaClient = getPrismaClientClass(__dirname);
const adapter = new PrismaBetterSQLite3({
  url: env.DB_FILE_NAME
});
const db = new PrismaClient({ adapter });
const TELEGRAM_CHANNEL_USERNAME = "salon4room";
const TELEGRAM_CHANNEL_URL = `https://t.me/${TELEGRAM_CHANNEL_USERNAME}`;
const TELEGRAM_PREVIEW_URL = `https://t.me/s/${TELEGRAM_CHANNEL_USERNAME}`;
const entityMap = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"'
};
function decodeHtml(value) {
  return value.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code))).replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16))).replace(/&([a-z]+);/gi, (match, name) => entityMap[name.toLowerCase()] ?? match);
}
function cleanText(value) {
  return decodeHtml(value.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " ")).replace(/[ \t]+/g, " ").replace(/\n[ \t]+/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
function classifyPost(text) {
  const value = text.toLocaleLowerCase("ru-RU");
  if (/мероприяти|бизнес[- ]завтрак|вечер|презентаци|встреч[аи]|мастер[- ]класс|аперол/.test(value)) return "event";
  if (/объект|реализаци|проект|комплектаци|монтаж/.test(value)) return "objects";
  if (/образц|коллекци|фабрик|бренд|материал|плитк|сантехник|светильник|ткан/.test(value)) return "materials";
  if (/новост|поздрав|салон|ждём|ждем/.test(value)) return "news";
  return "inspiration";
}
function makeTitle(text, category) {
  const firstLine = text.split("\n").map((line) => line.trim()).find(Boolean) ?? "Новая публикация 4ROOM";
  const firstSentence = firstLine.split(/(?<=[.!?])\s+/)[0] ?? firstLine;
  const title = firstSentence.replace(/^[✨🔥❤😍👍📍📩📲\s]+/u, "").replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, "").replace(/\s{2,}/g, " ").trim();
  if (title.length <= 84) return title;
  const fallbackByCategory = {
    event: "Новая встреча в салоне",
    objects: "Новый реализованный объект",
    materials: "Новинки и материалы",
    news: "Новости салона",
    inspiration: "Вдохновение от 4ROOM"
  };
  return fallbackByCategory[category];
}
function makeExcerpt(text, category) {
  const firstLine = text.split("\n").map((line) => line.trim()).find(Boolean) ?? "";
  const titleLine = firstLine.replace(/^[✨🔥❤😍👍📍📩📲\s]+/u, "").replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, "").replace(/\s{2,}/g, " ").trim();
  const body = titleLine === makeTitle(text, category) ? text.slice(text.indexOf(firstLine) + firstLine.length).trim() : text;
  const normalized = body.replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, "").replace(/\s+/g, " ").trim();
  if (normalized.length <= 190) return normalized;
  return `${normalized.slice(0, 187).trimEnd()}…`;
}
function parseMessageBlock(block) {
  const messageId = block.match(/data-post="[^"]+\/(\d+)"/)?.[1];
  const publishedAt = block.match(/<time[^>]+datetime="([^"]+)"/)?.[1];
  if (!messageId || !publishedAt) return null;
  const rawText = block.match(/<div class="tgme_widget_message_text[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? "";
  const text = cleanText(rawText);
  if (!text) return null;
  const category = classifyPost(text);
  const photoTags = block.match(/<a\b[^>]*class="[^"]*tgme_widget_message_photo_wrap[^"]*"[^>]*>/gi) ?? [];
  const imageUrls = Array.from(new Set(photoTags.map((tag) => tag.match(/background-image:\s*url\(['"]?([^'")]+)/i)?.[1] ?? null).filter((url) => Boolean(url)).map(decodeHtml)));
  const videoPoster = block.match(/class="[^"]*tgme_widget_message_video_thumb[^"]*"[^>]+style="[^"]*background-image:\s*url\(['"]?([^'")]+)/i)?.[1] ?? null;
  const imageMatch = block.match(/<img[^>]+src="([^"]+)"/i);
  const imageUrl = imageUrls[0] ?? (videoPoster ? decodeHtml(videoPoster) : imageMatch?.[1] ? decodeHtml(imageMatch[1]) : null);
  return {
    id: `telegram-${messageId}`,
    telegramMessageId: Number(messageId),
    channelUsername: TELEGRAM_CHANNEL_USERNAME,
    publishedAt: new Date(publishedAt).toISOString(),
    category,
    title: makeTitle(text, category),
    text,
    excerpt: makeExcerpt(text, category),
    imageUrl,
    imageUrls,
    telegramUrl: `${TELEGRAM_CHANNEL_URL}/${messageId}`
  };
}
function parseTelegramPreview(html) {
  return html.split("tgme_widget_message_wrap").slice(1).map(parseMessageBlock).filter((post) => Boolean(post)).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}
async function fetchTelegramPreview() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15e3);
  try {
    const response = await fetch(TELEGRAM_PREVIEW_URL, {
      headers: { "User-Agent": "4ROOM-events-feed/1.0" },
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`Telegram preview returned ${response.status}`);
    return parseTelegramPreview(await response.text());
  } finally {
    clearTimeout(timeout);
  }
}
const EVENT_TIMEZONE = "Asia/Yekaterinburg";
function parseEventCommand(text) {
  const read = (label) => text.match(new RegExp(`^${label}\\s*:\\s*(.+)$`, "im"))?.[1]?.trim();
  const title = read("Название");
  const dateValue = read("Дата");
  const timeValue = read("Время") ?? "19:00";
  const location = read("Место");
  const description = read("Описание");
  const capacityValue = read("Лимит");
  if (!title || !dateValue || !location || !description) return null;
  const isoDate = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})$/) ?? dateValue.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)?.slice().reverse();
  if (!isoDate || !/^\d{1,2}:\d{2}$/.test(timeValue)) return null;
  const normalizedDate = dateValue.includes(".") ? `${isoDate[0]}-${isoDate[1]}-${isoDate[2]}` : dateValue;
  const startsAt = /* @__PURE__ */ new Date(`${normalizedDate}T${timeValue}:00+05:00`);
  if (Number.isNaN(startsAt.getTime())) return null;
  return {
    title,
    startsAt,
    location,
    description,
    capacity: capacityValue ? Number.parseInt(capacityValue, 10) || null : null
  };
}
const TELEGRAM_FEED_SYNC_KEY = "telegram_feed_last_synced_at";
const TELEGRAM_UPDATE_OFFSET_KEY = "telegram_bot_update_offset";
function serializePost(post) {
  return {
    ...post,
    category: post.category,
    publishedAt: post.publishedAt.toISOString(),
    imageUrls: post.imageUrl ? [post.imageUrl] : []
  };
}
function serializeEvent(event) {
  return {
    ...event,
    startsAt: event.startsAt.toISOString()
  };
}
async function getState(key) {
  return db.telegramState.findUnique({ where: { key } });
}
async function setState(key, value) {
  return db.telegramState.upsert({
    where: { key },
    create: { key, value },
    update: { value }
  });
}
async function telegramBotRequest(method, body = {}) {
  if (!env.TELEGRAM_BOT_TOKEN) throw new Error("Telegram bot is not configured");
  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) throw new Error(payload.description ?? `Telegram ${method} failed`);
  return payload.result;
}
async function notifyRegistration(event, fullName, phone) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_NOTIFY_CHAT_ID) return "not_configured";
  await telegramBotRequest("sendMessage", {
    chat_id: env.TELEGRAM_NOTIFY_CHAT_ID,
    text: [
      "Новая заявка на мероприятие",
      "",
      `Мероприятие: ${event.title}`,
      `Имя: ${fullName}`,
      `Телефон: ${phone}`
    ].join("\n")
  });
  return "sent";
}
async function health() {
  return {
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    db: await db.$queryRaw`SELECT 1 as result`.then(() => "connected").catch(() => "disconnected"),
    env: env.VITE_NODE_ENV
  };
}
async function getEventsPage() {
  const [posts, event, synced] = await Promise.all([
    db.telegramPost.findMany({ orderBy: { publishedAt: "desc" }, take: 12 }),
    db.event.findFirst({
      where: { isPublished: true, startsAt: { gte: /* @__PURE__ */ new Date() } },
      orderBy: { startsAt: "asc" }
    }),
    getState(TELEGRAM_FEED_SYNC_KEY)
  ]);
  return {
    featuredEvent: event ? serializeEvent(event) : null,
    posts: posts.map(serializePost),
    channelUrl: TELEGRAM_CHANNEL_URL,
    lastSyncedAt: synced?.value ?? null
  };
}
async function syncTelegramFeed() {
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
        telegramUrl: post.telegramUrl
      },
      update: {
        channelUsername: post.channelUsername,
        publishedAt: new Date(post.publishedAt),
        category: post.category,
        title: post.title,
        text: post.text,
        excerpt: post.excerpt,
        imageUrl: post.imageUrl,
        telegramUrl: post.telegramUrl
      }
    });
  }
  const syncedAt = (/* @__PURE__ */ new Date()).toISOString();
  await setState(TELEGRAM_FEED_SYNC_KEY, syncedAt);
  console.log(`[telegram] synced ${posts.length} public channel posts`);
  return { synced: posts.length, syncedAt };
}
async function createEventRegistration(input) {
  const fullName = input.fullName.trim().replace(/\s+/g, " ");
  const phone = input.phone.trim();
  if (fullName.length < 3) throw new Error("Укажите имя и фамилию");
  if (!/^[+\d][\d\s()-]{9,}$/.test(phone)) throw new Error("Укажите корректный номер телефона");
  let event = input.eventId ? await db.event.findUnique({ where: { id: input.eventId } }) : null;
  if (!event && input.event) {
    const startsAt = new Date(input.event.startsAt);
    if (Number.isNaN(startsAt.getTime())) throw new Error("Не удалось определить дату мероприятия");
    event = await db.event.upsert({
      where: { id: input.event.id },
      update: {
        title: input.event.title,
        startsAt,
        displayTimezone: input.event.displayTimezone,
        location: input.event.location,
        description: input.event.description,
        capacity: input.event.capacity ?? null,
        imageUrl: input.event.imageUrl ?? null,
        isPublished: true
      },
      create: {
        id: input.event.id,
        title: input.event.title,
        startsAt,
        displayTimezone: input.event.displayTimezone,
        location: input.event.location,
        description: input.event.description,
        capacity: input.event.capacity ?? null,
        imageUrl: input.event.imageUrl ?? null,
        isPublished: true
      }
    });
  }
  if (!event) {
    event = await db.event.findFirst({ where: { isPublished: true, startsAt: { gte: /* @__PURE__ */ new Date() } }, orderBy: { startsAt: "asc" } });
  }
  if (!event || !event.isPublished || event.startsAt < /* @__PURE__ */ new Date()) throw new Error("Регистрация на мероприятие пока не открыта");
  if (event.capacity) {
    const registrationsCount = await db.eventRegistration.count({ where: { eventId: event.id, status: "new" } });
    if (registrationsCount >= event.capacity) throw new Error("Свободных мест больше нет");
  }
  const registration = await db.eventRegistration.create({ data: { eventId: event.id, fullName, phone } });
  const notification = await notifyRegistration(serializeEvent(event), fullName, phone);
  return { id: registration.id, notification };
}
async function syncTelegramBot() {
  if (!env.TELEGRAM_BOT_TOKEN) return { status: "not_configured", processed: 0 };
  const offset = Number((await getState(TELEGRAM_UPDATE_OFFSET_KEY))?.value ?? "0");
  const updates = await telegramBotRequest("getUpdates", {
    offset,
    timeout: 0,
    allowed_updates: ["message"]
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
        text: "Не смог разобрать событие. Нужны поля: Название, Дата, Время, Место, Описание и необязательно Лимит."
      });
      continue;
    }
    const existing = await db.event.findFirst({
      where: { isPublished: true, startsAt: { gte: /* @__PURE__ */ new Date() } },
      orderBy: { startsAt: "asc" }
    });
    const event = existing ? await db.event.update({ where: { id: existing.id }, data: { ...parsed, displayTimezone: EVENT_TIMEZONE, isPublished: true } }) : await db.event.create({ data: { ...parsed, displayTimezone: EVENT_TIMEZONE } });
    await telegramBotRequest("sendMessage", {
      chat_id: message.chat.id,
      text: `Событие обновлено на сайте:
${event.title}
${event.startsAt.toLocaleString("ru-RU", { timeZone: EVENT_TIMEZONE })}`
    });
  }
  return { status: "ok", processed };
}
const procedures = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  createEventRegistration,
  getEventsPage,
  health,
  syncTelegramBot,
  syncTelegramFeed
}, Symbol.toStringTag, { value: "Module" }));
const jobs = {
  debug: async (payload, job) => {
    console.debug(`Debug handler info: ${payload.info}, job id: ${job.id}`);
  }
};
getQueue();
export {
  jobs,
  procedures
};
