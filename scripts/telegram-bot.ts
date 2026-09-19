import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  advanceEventDraft,
  eventDraftPrompt,
  eventReplyKeyboard,
  EVENT_TIMEZONE,
  parseEventCommand,
  startEventDraft,
  TELEGRAM_EVENT_COMMANDS,
  type EventDraft,
  type EventReplyKeyboardMode,
  type ParsedEvent,
} from "../src/lib/telegram-event";
import type { EventsPageData, FeaturedEvent } from "../src/lib/events";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("TELEGRAM_BOT_TOKEN is required");

const projectRoot = process.cwd();
const eventsFile = resolve(projectRoot, process.env.EVENTS_FILE ?? "public/events.json");
const distEventsFile = resolve(projectRoot, process.env.DIST_EVENTS_FILE ?? "dist/events.json");
const offsetFile = resolve(projectRoot, process.env.TELEGRAM_OFFSET_FILE ?? "data/telegram-update-offset.txt");
const draftsFile = resolve(projectRoot, process.env.TELEGRAM_DRAFTS_FILE ?? "data/telegram-event-drafts.json");
const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
const once = process.env.TELEGRAM_ONCE === "1" || process.env.TELEGRAM_ONCE === "true";

type TelegramUpdate = {
  update_id: number;
  message?: { chat: { id: number }; text?: string };
};

type EventDraftStore = Record<string, EventDraft>;

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

async function sendMessage(chatId: number, text: string, mode: EventReplyKeyboardMode = "idle") {
  await telegramRequest("sendMessage", {
    chat_id: chatId,
    text,
    reply_markup: eventReplyKeyboard(mode),
  });
}

async function setCommandMenu() {
  await telegramRequest("setMyCommands", { commands: TELEGRAM_EVENT_COMMANDS });
}

async function readDrafts(): Promise<EventDraftStore> {
  try {
    return JSON.parse(await readFile(draftsFile, "utf8")) as EventDraftStore;
  } catch {
    return {};
  }
}

async function readDraft(chatId: number) {
  const drafts = await readDrafts();
  return drafts[String(chatId)] ?? null;
}

async function writeDraft(chatId: number, draft: EventDraft | null) {
  const drafts = await readDrafts();
  if (draft) drafts[String(chatId)] = draft;
  else delete drafts[String(chatId)];
  await mkdir(resolve(draftsFile, ".."), { recursive: true });
  await writeFile(draftsFile, `${JSON.stringify(drafts, null, 2)}\n`, "utf8");
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

async function publishEvent(chatId: number, parsed: ParsedEvent) {
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
  await sendMessage(chatId, `Событие обновлено на сайте:\n${featuredEvent.title}\n${parsed.startsAt.toLocaleString("ru-RU", { timeZone: EVENT_TIMEZONE })}`);
}

async function handleUpdate(update: TelegramUpdate) {
  const message = update.message;
  if (!message?.text) return;
  if (adminChatId && String(message.chat.id) !== adminChatId) return;
  const text = message.text.trim();

  if (/^\/start(?:@\w+)?\b/i.test(text)) {
    await sendMessage(message.chat.id, "✨ Бот ФОРУМ подключён.\n\nНажмите /event, чтобы создать мероприятие пошагово.");
    return;
  }

  if (/^\/(?:help|помощь)(?:@\w+)?\b/i.test(text)) {
    await sendMessage(message.chat.id, "Команды ФОРУМ:\n\n/event — создать мероприятие\n/cancel — отменить текущий ввод\n/help — показать эту подсказку");
    return;
  }

  if (/^(?:\/cancel|отмена)$/i.test(text)) {
    const hadDraft = await readDraft(message.chat.id);
    await writeDraft(message.chat.id, null);
    await sendMessage(message.chat.id, hadDraft ? "Создание мероприятия отменено. Нажмите /event, чтобы начать заново." : "Сейчас нет активного создания мероприятия.");
    return;
  }

  if (/^\/event(?:@\w+)?\s*$/i.test(text)) {
    const draft = startEventDraft();
    await writeDraft(message.chat.id, draft);
    await sendMessage(message.chat.id, `✨ Создаём новое мероприятие.\n\n${eventDraftPrompt(draft.step)}`, "draft");
    return;
  }

  const draft = await readDraft(message.chat.id);
  if (draft) {
    const advance = advanceEventDraft(draft, text);
    if (advance.kind === "complete") {
      try {
        await publishEvent(message.chat.id, advance.parsed);
        await writeDraft(message.chat.id, null);
      } catch (error) {
        await sendMessage(message.chat.id, `Не удалось опубликовать мероприятие: ${error instanceof Error ? error.message : "неизвестная ошибка"}\n\nЧерновик сохранён. Нажмите «Опубликовать», чтобы повторить.`, "confirm");
      }
    } else {
      await writeDraft(message.chat.id, advance.draft);
      await sendMessage(message.chat.id, advance.message, advance.draft.step === "confirm" ? "confirm" : "draft");
    }
    return;
  }

  if (!/^\/event(?:@\w+)?\b/i.test(text)) return;
  const parsed = parseEventCommand(text);
  if (!parsed) {
    await sendMessage(message.chat.id, "Не смог разобрать событие. Нажмите /event и заполните поля по очереди.");
    return;
  }
  if (parsed.startsAt <= new Date()) {
    await sendMessage(message.chat.id, "Дата мероприятия должна быть в будущем. Формат даты: ДД.ММ.ГГГГ, например 27.09.2026.");
    return;
  }
  await publishEvent(message.chat.id, parsed);
}

async function main() {
  let offset = await readOffset();
  try {
    await setCommandMenu();
  } catch (error) {
    console.error(`[telegram] command menu setup failed: ${error instanceof Error ? error.message : String(error)}`);
  }
  console.log(`[telegram] bot polling started${adminChatId ? ` for chat ${adminChatId}` : ""}`);
  while (true) {
    try {
      const updates = await telegramRequest<TelegramUpdate[]>("getUpdates", {
        offset,
        timeout: once ? 0 : 30,
        allowed_updates: ["message"],
      });
      for (const update of updates ?? []) {
        offset = update.update_id + 1;
        await writeOffset(offset);
        await handleUpdate(update);
      }
      if (once) break;
    } catch (error) {
      console.error(`[telegram] polling error: ${error instanceof Error ? error.message : String(error)}`);
      if (once) throw error;
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 5_000));
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
