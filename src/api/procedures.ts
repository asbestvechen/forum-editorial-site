import { db } from "@/api/db";
import { env } from "@/lib/env";
import { fetchTelegramPreview, isTelegramSystemPost, TELEGRAM_CHANNEL_URL } from "@/api/telegram";
import { mcp } from "@adaptive-ai/sdk/server";
import type { EventPostCategory, FeaturedEvent, EventsPageData, TelegramMedia, TelegramPost } from "@/lib/events";
import {
  advanceEventDraft,
  eventDraftPrompt,
  eventReplyKeyboard,
  EVENT_TIMEZONE,
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
  mediaJson?: string | null;
  telegramUrl: string;
}): TelegramPost {
  let media: TelegramMedia[] = [];
  try {
    const parsed = post.mediaJson ? JSON.parse(post.mediaJson) : [];
    if (Array.isArray(parsed)) {
      media = parsed.filter((item): item is TelegramMedia => (
        item && (item.type === "image" || item.type === "video") && (typeof item.url === "string" || item.url === null)
      ));
    }
  } catch {
    media = [];
  }
  if (media.length === 0 && post.imageUrl) media = [{ type: "image", url: post.imageUrl }];
  const imageUrls = media.filter((item) => item.type === "image" && item.url).map((item) => item.url as string);
  return {
    ...post,
    category: post.category as EventPostCategory,
    publishedAt: post.publishedAt.toISOString(),
    imageUrls,
    media,
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
  chat: { id: number; type?: string };
  text?: string;
};

type TelegramUpdate = {
  update_id: number;
  message?: TelegramEventMessage;
};

export type TelegramWebhookResponse = {
  method: "sendMessage";
  chat_id: number;
  text: string;
  reply_markup: ReturnType<typeof eventReplyKeyboard>;
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

async function sendBotResponse(response: TelegramWebhookResponse) {
  await telegramBotRequest("sendMessage", {
    chat_id: response.chat_id,
    text: response.text,
    reply_markup: response.reply_markup,
  });
}

function botMessage(chatId: number, text: string, mode: EventReplyKeyboardMode = "idle"): TelegramWebhookResponse {
  return { method: "sendMessage", chat_id: chatId, text, reply_markup: eventReplyKeyboard(mode) };
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

async function notifyByEmail(subject: string, body: string) {
  if (!env.GMAIL_CONNECTION_TOKEN) return "not_configured" as const;
  const response = await mcp.connectedApiRequest({
    connectionToken: env.GMAIL_CONNECTION_TOKEN,
    url: "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    method: "POST",
    body: { to: "asbestvechen@gmail.com", subject, body, isHtml: false },
  });
  if (response.status !== 200) throw new Error(`Gmail send failed: ${response.status}`);
  return "sent" as const;
}

async function settleNotification(notification: Promise<string>) {
  const result = await notification.then((value) => ({ status: "sent" as const, value })).catch((error) => ({
    status: "failed" as const,
    error: error instanceof Error ? error.message : "unknown error",
  }));
  return result;
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
        mediaJson: JSON.stringify(post.media ?? []),
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
        mediaJson: JSON.stringify(post.media ?? []),
        telegramUrl: post.telegramUrl,
      },
    });
  }
  const existingPosts = await db.telegramPost.findMany({ select: { id: true, text: true } });
  const systemPostIds = existingPosts.filter((post) => isTelegramSystemPost(post.text)).map((post) => post.id);
  if (systemPostIds.length > 0) {
    await db.telegramPost.deleteMany({ where: { id: { in: systemPostIds } } });
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
  const eventView = serializeEvent(event);
  const [telegram, email] = await Promise.all([
    settleNotification(notifyRegistration(eventView, fullName, phone)),
    settleNotification(notifyByEmail(
      `Новая заявка: ${event.title}`,
      [
        "Новая заявка на мероприятие ФОРУМ",
        "",
        `Мероприятие: ${event.title}`,
        `Дата: ${event.startsAt.toLocaleString("ru-RU", { timeZone: EVENT_TIMEZONE })}`,
        `Имя: ${fullName}`,
        `Телефон: ${phone}`,
        `Получено: ${new Date().toLocaleString("ru-RU", { timeZone: EVENT_TIMEZONE })}`,
      ].join("\n"),
    )),
  ]);
  return { id: registration.id, notification: { telegram, email } };
}

export async function createContactRequest(input: { fullName: string; phone: string }) {
  const { fullName, phone } = validateContactInput(input);
  const request = await db.contactRequest.create({ data: { fullName, phone } });
  const [telegram, email] = await Promise.all([
    settleNotification(notifyContactRequest(fullName, phone)),
    settleNotification(notifyByEmail(
      "Новая заявка на обратную связь",
      [
        "Новая заявка на обратную связь ФОРУМ",
        "",
        `Имя: ${fullName}`,
        `Телефон: ${phone}`,
        `Получено: ${new Date().toLocaleString("ru-RU", { timeZone: EVENT_TIMEZONE })}`,
      ].join("\n"),
    )),
  ]);
  return { id: request.id, notification: { telegram, email } };
}

async function deleteCurrentEvent() {
  const event = await db.event.findFirst({
    where: { isPublished: true, startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
  });
  if (!event) return null;
  await db.event.update({ where: { id: event.id }, data: { isPublished: false } });
  return event;
}

async function formatCurrentRegistrations() {
  const event = await db.event.findFirst({
    where: { isPublished: true, startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
  });
  if (!event) return "Сейчас нет опубликованного мероприятия.";
  const registrations = await db.eventRegistration.findMany({
    where: { eventId: event.id, status: "new" },
    orderBy: { createdAt: "asc" },
  });
  if (registrations.length === 0) return `Заявок пока нет.\n\nМероприятие: ${event.title}`;
  const limit = event.capacity ? ` из ${event.capacity}` : "";
  return [
    `Заявки: ${registrations.length}${limit}`,
    `Мероприятие: ${event.title}`,
    "",
    ...registrations.map((registration, index) => `${index + 1}. ${registration.fullName}\n   ${registration.phone}`),
  ].join("\n");
}

async function handleTelegramMessage(message: TelegramEventMessage): Promise<TelegramWebhookResponse | null> {
  if (!message.text) return null;
  const adminChatId = env.TELEGRAM_ADMIN_CHAT_ID ?? env.TELEGRAM_NOTIFY_CHAT_ID;
  if (adminChatId && String(message.chat.id) !== adminChatId) return null;

  const chatId = message.chat.id;
  const text = message.text.trim();
  if (/^\/start(?:@\w+)?\b/i.test(text)) {
    return botMessage(chatId, "✨ Бот ФОРУМ подключён.\n\nВыберите действие в меню ниже.");
  }
  if (/^\/(?:help|помощь)(?:@\w+)?\b/i.test(text)) {
    return botMessage(chatId, "Выберите действие кнопкой ниже.\n\nСоздание мероприятия проходит пошагово, публикация — только после подтверждения.");
  }
  if (/^(?:\/cancel|отмена)$/i.test(text)) {
    const hadDraft = await readEventDraft(chatId);
    await writeEventDraft(chatId, null);
    return botMessage(chatId, hadDraft ? "Создание мероприятия отменено." : "Сейчас нет активного создания мероприятия.");
  }
  if (/^(?:создать мероприятие|\/event(?:@\w+)?\s*)$/i.test(text)) {
    const draft = startEventDraft();
    await writeEventDraft(chatId, draft);
    return botMessage(chatId, `✨ Создаём новое мероприятие.\n\n${eventDraftPrompt(draft.step)}`, "draft");
  }
  if (/^(?:удалить мероприятие|\/delete_event(?:@\w+)?\s*)$/i.test(text)) {
    const event = await deleteCurrentEvent();
    return botMessage(chatId, event ? `Мероприятие удалено с сайта:\n${event.title}` : "Опубликованных будущих мероприятий нет.");
  }
  if (/^(?:проверить заявки|\/applications(?:@\w+)?\s*)$/i.test(text)) {
    return botMessage(chatId, await formatCurrentRegistrations());
  }
  if (/^(?:обновить посты|\/refresh(?:@\w+)?\s*)$/i.test(text)) {
    try {
      const sync = await syncTelegramFeed();
      return botMessage(chatId, `✅ Лента обновлена.
Загружено публикаций: ${sync.synced}.`);
    } catch (error) {
      return botMessage(chatId, `Не удалось обновить ленту: ${error instanceof Error ? error.message : "неизвестная ошибка"}`);
    }
  }

  const draft = await readEventDraft(chatId);
  if (draft) {
    const advance = advanceEventDraft(draft, text);
    if (advance.kind === "complete") {
      try {
        const event = await publishDatabaseEvent(advance.parsed);
        await writeEventDraft(chatId, null);
        return botMessage(chatId, `✅ Мероприятие опубликовано:\n${event.title}\n${event.startsAt.toLocaleString("ru-RU", { timeZone: EVENT_TIMEZONE })}`);
      } catch (error) {
        return botMessage(chatId, `Не удалось опубликовать мероприятие: ${error instanceof Error ? error.message : "неизвестная ошибка"}\n\nЧерновик сохранён. Нажмите «Опубликовать», чтобы повторить.`, "confirm");
      }
    }
    await writeEventDraft(chatId, advance.draft);
    return botMessage(chatId, advance.message, advance.draft.step === "confirm" ? "confirm" : "draft");
  }

  if (/^\/event(?:@\w+)?\b/i.test(text)) {
    return botMessage(chatId, "Используйте кнопку «Создать мероприятие» — так будет удобнее.");
  }
  return null;
}

export async function handleTelegramWebhookUpdate(update: TelegramUpdate) {
  return update.message ? handleTelegramMessage(update.message) : null;
}

export async function syncTelegramBot() {
  if (!env.TELEGRAM_BOT_TOKEN) return { status: "not_configured" as const, processed: 0 };
  if (env.TELEGRAM_WEBHOOK_SECRET) return { status: "webhook_active" as const, processed: 0 };
  await ensureTelegramCommandMenu();
  const offset = Number((await getState(TELEGRAM_UPDATE_OFFSET_KEY))?.value ?? "0");
  const updates = await telegramBotRequest<TelegramUpdate[]>("getUpdates", {
    offset,
    timeout: 0,
    allowed_updates: ["message"],
  });
  let processed = 0;
  for (const update of updates ?? []) {
    await setState(TELEGRAM_UPDATE_OFFSET_KEY, String(update.update_id + 1));
    const response = update.message ? await handleTelegramMessage(update.message) : null;
    if (response) await sendBotResponse(response);
    processed += 1;
  }
  return { status: "ok" as const, processed };
}
