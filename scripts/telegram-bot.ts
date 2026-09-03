import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { EVENT_TIMEZONE, parseEventCommand } from "../src/lib/telegram-event";
import type { EventsPageData, FeaturedEvent } from "../src/lib/events";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("TELEGRAM_BOT_TOKEN is required");

const projectRoot = process.cwd();
const eventsFile = resolve(projectRoot, process.env.EVENTS_FILE ?? "public/events.json");
const distEventsFile = resolve(projectRoot, process.env.DIST_EVENTS_FILE ?? "dist/events.json");
const offsetFile = resolve(projectRoot, process.env.TELEGRAM_OFFSET_FILE ?? "data/telegram-update-offset.txt");
const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

type TelegramUpdate = {
  update_id: number;
  message?: { chat: { id: number }; text?: string };
};

async function telegramRequest<T>(method: string, body: Record<string, unknown> = {}) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json() as { ok?: boolean; result?: T; description?: string };
  if (!response.ok || !payload.ok) throw new Error(payload.description ?? `Telegram ${method} failed`);
  return payload.result as T;
}

async function sendMessage(chatId: number, text: string) {
  await telegramRequest("sendMessage", { chat_id: chatId, text });
}

async function readEvents(): Promise<EventsPageData> {
  try {
    return JSON.parse(await readFile(eventsFile, "utf8")) as EventsPageData;
  } catch {
    return { featuredEvent: null, posts: [], channelUrl: "https://t.me/salon4room", lastSyncedAt: null };
  }
}

async function writeEvents(data: EventsPageData) {
  await mkdir(resolve(eventsFile, ".."), { recursive: true });
  const serialized = `${JSON.stringify(data, null, 2)}\n`;
  await writeFile(eventsFile, serialized, "utf8");
  try {
    await access(resolve(distEventsFile, ".."));
    await writeFile(distEventsFile, serialized, "utf8");
  } catch {
    // The dist folder may not exist while developing.
  }
}

async function readOffset() {
  try {
    return Number.parseInt(await readFile(offsetFile, "utf8"), 10) || 0;
  } catch {
    return 0;
  }
}

async function writeOffset(offset: number) {
  await mkdir(resolve(offsetFile, ".."), { recursive: true });
  await writeFile(offsetFile, String(offset), "utf8");
}

async function handleUpdate(update: TelegramUpdate) {
  const message = update.message;
  if (!message?.text) return;
  if (adminChatId && String(message.chat.id) !== adminChatId) return;

  if (/^\/start(?:@\w+)?\b/i.test(message.text)) {
    await sendMessage(message.chat.id, "Бот подключён. Для публикации мероприятия отправьте команду /event с полями Название, Дата, Время, Место, Описание и необязательно Лимит.");
    return;
  }
  if (!/^\/event(?:@\w+)?\b/i.test(message.text)) return;

  const parsed = parseEventCommand(message.text);
  if (!parsed) {
    await sendMessage(message.chat.id, "Не смог разобрать событие. Нужны поля: Название, Дата, Время, Место, Описание и необязательно Лимит.");
    return;
  }
  if (parsed.startsAt <= new Date()) {
    await sendMessage(message.chat.id, "Дата мероприятия должна быть в будущем. Формат даты: ДД.ММ.ГГГГ, например 27.09.2026.");
    return;
  }

  const data = await readEvents();
  const featuredEvent: FeaturedEvent = {
    id: `telegram-event-${Date.now()}`,
    title: parsed.title,
    startsAt: parsed.startsAt.toISOString(),
    displayTimezone: EVENT_TIMEZONE,
    location: parsed.location,
    description: parsed.description,
    capacity: parsed.capacity,
    imageUrl: null,
  };
  await writeEvents({ ...data, featuredEvent, lastSyncedAt: new Date().toISOString() });
  await sendMessage(message.chat.id, `Событие обновлено на сайте:\n${featuredEvent.title}\n${parsed.startsAt.toLocaleString("ru-RU", { timeZone: EVENT_TIMEZONE })}`);
}

async function main() {
  let offset = await readOffset();
  console.log(`[telegram] bot polling started${adminChatId ? ` for chat ${adminChatId}` : ""}`);
  while (true) {
    try {
      const updates = await telegramRequest<TelegramUpdate[]>("getUpdates", {
        offset,
        timeout: 30,
        allowed_updates: ["message"],
      });
      for (const update of updates ?? []) {
        offset = update.update_id + 1;
        await writeOffset(offset);
        await handleUpdate(update);
      }
    } catch (error) {
      console.error(`[telegram] polling error: ${error instanceof Error ? error.message : String(error)}`);
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 5_000));
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
