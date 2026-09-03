import type { EventPostCategory, TelegramPost } from "@/lib/events";

export const TELEGRAM_CHANNEL_USERNAME = "salon4room";
export const TELEGRAM_CHANNEL_URL = `https://t.me/${TELEGRAM_CHANNEL_USERNAME}`;

const TELEGRAM_PREVIEW_URL = `https://t.me/s/${TELEGRAM_CHANNEL_USERNAME}`;

const entityMap: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

function decodeHtml(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name: string) => entityMap[name.toLowerCase()] ?? match);
}

function cleanText(value: string) {
  return decodeHtml(value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " "))
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function classifyPost(text: string): EventPostCategory {
  const value = text.toLocaleLowerCase("ru-RU");
  if (/мероприяти|бизнес[- ]завтрак|вечер|презентаци|встреч[аи]|мастер[- ]класс|аперол/.test(value)) return "event";
  if (/объект|реализаци|проект|комплектаци|монтаж/.test(value)) return "objects";
  if (/образц|коллекци|фабрик|бренд|материал|плитк|сантехник|светильник|ткан/.test(value)) return "materials";
  if (/новост|поздрав|салон|ждём|ждем/.test(value)) return "news";
  return "inspiration";
}

function makeTitle(text: string, category: EventPostCategory) {
  const firstLine = text.split("\n").map((line) => line.trim()).find(Boolean) ?? "Новая публикация 4ROOM";
  const firstSentence = firstLine.split(/(?<=[.!?])\s+/)[0] ?? firstLine;
  const title = firstSentence.replace(/^[✨🔥❤😍👍📍📩📲\s]+/u, "").trim();
  if (title.length <= 84) return title;
  const fallbackByCategory: Record<EventPostCategory, string> = {
    event: "Новая встреча в салоне",
    objects: "Новый реализованный объект",
    materials: "Новинки и материалы",
    news: "Новости салона",
    inspiration: "Вдохновение от 4ROOM",
  };
  return fallbackByCategory[category];
}

function makeExcerpt(text: string) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= 190) return normalized;
  return `${normalized.slice(0, 187).trimEnd()}…`;
}

function parseMessageBlock(block: string): TelegramPost | null {
  const messageId = block.match(/data-post="[^"]+\/(\d+)"/)?.[1];
  const publishedAt = block.match(/<time[^>]+datetime="([^"]+)"/)?.[1];
  if (!messageId || !publishedAt) return null;

  const rawText = block.match(/<div class="tgme_widget_message_text[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? "";
  const text = cleanText(rawText);
  if (!text) return null;

  const category = classifyPost(text);
  // Telegram uses the first <img> for the channel avatar in every message.
  // Prefer the media background image so feed cards do not repeat that avatar.
  const mediaMatch = block.match(/background-image:url\(['"]?([^'")]+)/i);
  const imageMatch = block.match(/<img[^>]+src="([^"]+)"/i);
  const imageUrl = mediaMatch?.[1] ?? imageMatch?.[1] ?? null;

  return {
    id: `telegram-${messageId}`,
    telegramMessageId: Number(messageId),
    channelUsername: TELEGRAM_CHANNEL_USERNAME,
    publishedAt: new Date(publishedAt).toISOString(),
    category,
    title: makeTitle(text, category),
    text,
    excerpt: makeExcerpt(text),
    imageUrl: imageUrl ? decodeHtml(imageUrl) : null,
    telegramUrl: `${TELEGRAM_CHANNEL_URL}/${messageId}`,
  };
}

export function parseTelegramPreview(html: string) {
  return html
    .split("tgme_widget_message_wrap")
    .slice(1)
    .map(parseMessageBlock)
    .filter((post): post is TelegramPost => Boolean(post))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

export async function fetchTelegramPreview() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(TELEGRAM_PREVIEW_URL, {
      headers: { "User-Agent": "4ROOM-events-feed/1.0" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Telegram preview returned ${response.status}`);
    return parseTelegramPreview(await response.text());
  } finally {
    clearTimeout(timeout);
  }
}
