import { db } from "@/api/db";
import { env } from "@/lib/env";
import { fetchTelegramPreview, TELEGRAM_CHANNEL_URL } from "@/api/telegram";
import type { EventPostCategory, FeaturedEvent, EventsPageData, TelegramPost } from "@/lib/events";
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
} from "@/lib/telegram-event";

const TELEGRAM_FEED_SYNC_KEY = "telegram_feed_last_synced_at";
const TELEGRAM_UPDATE_OFFSET_KEY = "telegram_bot_update_offset";
const TELEGRAM_EVENT_DRAFT_PREFIX = "telegram_event_draft:";

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

type TelegramEventMessage = {
  chat: { id: number; type: string };
  text?: string;
};

function eventDraftKey(chatId: number) {
  return `${TELEGRAM_EVENT_DRAFT_PREFIX}${chatId}`;
}

async function readEventDraft(chatId: number) {
  const state = await getState(eventDraftKey(chatId));
  if (!state) return null;
  try {
    return JSON.parse(state.value) as EventDraft;
  } catch {
    return null;
  }
}

async function writeEventDraft(chatId: number, draft: EventDraft | null) {
  const key = eventDraftKey(chatId);
  if (draft) {
    await setState(key, JSON.stringify(draft));
    return;
  }
  await db.telegramState.deleteMany({ where: { key } });
}

async function sendBotMessage(chatId: number, text: string, mode: EventReplyKeyboardMode = "idle") {
  await telegramBotRequest("sendMessage", {
    chat_id: chatId,
    text,
    reply_markup: eventReplyKeyboard(mode),
  });
}

async function ensureTelegramCommandMenu() {
  await telegramBotRequest("setMyCommands", { commands: TELEGRAM_EVENT_COMMANDS });
}

async function publishDatabaseEvent(parsed: ParsedEvent) {
  const existing = await db.event.findFirst({
    where: { isPublished: true, startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
  });
  return existing
    ? db.event.update({ where: { id: existing.id }, data: { ...parsed, displayTimezone: EVENT_TIMEZONE, isPublished: true } })
    : db.event.create({ data: { ...parsed, displayTimezone: EVENT_TIMEZONE, isPublished: true } });
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

async function notifyContactRequest(fullName: string, phone: string) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_NOTIFY_CHAT_ID) return "not_configured" as const;
  await telegramBotRequest("sendMessage", {
    chat_id: env.TELEGRAM_NOTIFY_CHAT_ID,
    text: [
      "Новая заявка на обратную связь",
      "",
      `Имя: ${fullName}`,
      `Телефон: ${phone}`,
    ].join("\n"),
  });
  return "sent" as const;
}

function validateContactInput(input: { fullName: string; phone: string }) {
  const fullName = input.fullName.trim().replace(/\s+/g, " ");
  const phone = input.phone.trim();
  if (fullName.length < 3) throw new Error("Укажите имя и фамилию");
  if (!/^[+\d][\d\s()-]{9,}$/.test(phone)) throw new Error("Укажите корректный номер телефона");
  return { fullName, phone };
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

export async function createEventRegistration(input: {
  fullName: string;
  phone: string;
  eventId?: string;
  event?: FeaturedEvent;
}) {
  const { fullName, phone } = validateContactInput(input);

  let event = input.eventId
    ? await db.event.findUnique({ where: { id: input.eventId } })
    : null;
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
        isPublished: true,
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
        isPublished: true,
      },
    });
  }
  if (!event) {
    event = await db.event.findFirst({ where: { isPublished: true, startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" } });
  }
  if (!event || !event.isPublished || event.startsAt < new Date()) throw new Error("Регистрация на мероприятие пока не открыта");

  if (event.capacity) {
    const registrationsCount = await db.eventRegistration.count({ where: { eventId: event.id, status: "new" } });
    if (registrationsCount >= event.capacity) throw new Error("Свободных мест больше нет");
  }

  const registration = await db.eventRegistration.create({ data: { eventId: event.id, fullName, phone } });
  const notification = await notifyRegistration(serializeEvent(event), fullName, phone);
  return { id: registration.id, notification };
}

export async function createContactRequest(input: { fullName: string; phone: string }) {
  const { fullName, phone } = validateContactInput(input);
  const request = await db.contactRequest.create({ data: { fullName, phone } });
  const notification = await notifyContactRequest(fullName, phone);
  return { id: request.id, notification };
}

export async function syncTelegramBot() {
  if (!env.TELEGRAM_BOT_TOKEN) return { status: "not_configured" as const, processed: 0 };
  await ensureTelegramCommandMenu();
  const offset = Number((await getState(TELEGRAM_UPDATE_OFFSET_KEY))?.value ?? "0");
  type TelegramUpdate = {
    update_id: number;
    message?: TelegramEventMessage;
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
    if (!message?.text) continue;
    if (env.TELEGRAM_ADMIN_CHAT_ID && String(message.chat.id) !== env.TELEGRAM_ADMIN_CHAT_ID) continue;

    const text = message.text.trim();
    if (/^\/start(?:@\w+)?\b/i.test(text)) {
      await sendBotMessage(message.chat.id, "✨ Бот ФОРУМ подключён.\n\nНажмите /event, чтобы создать мероприятие пошагово.");
      continue;
    }
    if (/^\/(?:help|помощь)(?:@\w+)?\b/i.test(text)) {
      await sendBotMessage(message.chat.id, "Команды ФОРУМ:\n\n/event — создать мероприятие\n/cancel — отменить текущий ввод\n/help — показать эту подсказку");
      continue;
    }

    if (/^(?:\/cancel|отмена)$/i.test(text)) {
      const hadDraft = await readEventDraft(message.chat.id);
      await writeEventDraft(message.chat.id, null);
      await sendBotMessage(message.chat.id, hadDraft ? "Создание мероприятия отменено. Нажмите /event, чтобы начать заново." : "Сейчас нет активного создания мероприятия.");
      continue;
    }

    if (/^\/event(?:@\w+)?\s*$/i.test(text)) {
      const draft = startEventDraft();
      await writeEventDraft(message.chat.id, draft);
      await sendBotMessage(message.chat.id, `✨ Создаём новое мероприятие.\n\n${eventDraftPrompt(draft.step)}`, "draft");
      continue;
    }

    const draft = await readEventDraft(message.chat.id);
    if (draft) {
      const advance = advanceEventDraft(draft, text);
      if (advance.kind === "complete") {
        const event = await publishDatabaseEvent(advance.parsed);
        await writeEventDraft(message.chat.id, null);
        await sendBotMessage(message.chat.id, `Событие обновлено на сайте:\n${event.title}\n${event.startsAt.toLocaleString("ru-RU", { timeZone: EVENT_TIMEZONE })}`);
      } else {
        await writeEventDraft(message.chat.id, advance.draft);
        await sendBotMessage(message.chat.id, advance.message, advance.draft.step === "confirm" ? "confirm" : "draft");
      }
      continue;
    }

    if (!/^\/event(?:@\w+)?\b/i.test(text)) continue;
    const parsed = parseEventCommand(text);
    if (!parsed) {
      await sendBotMessage(message.chat.id, "Не смог разобрать событие. Нажмите /event и заполните поля по очереди.");
      continue;
    }
    if (parsed.startsAt <= new Date()) {
      await sendBotMessage(message.chat.id, "Дата мероприятия должна быть в будущем. Формат даты: ДД.ММ.ГГГГ, например 27.09.2026.");
      continue;
    }
    const event = await publishDatabaseEvent(parsed);
    await sendBotMessage(message.chat.id, `Событие обновлено на сайте:\n${event.title}\n${event.startsAt.toLocaleString("ru-RU", { timeZone: EVENT_TIMEZONE })}`);
  }
  return { status: "ok" as const, processed };
}
