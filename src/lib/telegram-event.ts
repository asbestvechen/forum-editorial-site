export const EVENT_TIMEZONE = "Asia/Yekaterinburg";

export type ParsedEvent = {
  title: string;
  startsAt: Date;
  location: string;
  description: string;
  capacity: number | null;
};

export type EventDraftStep = "title" | "date" | "time" | "location" | "description" | "capacity";

export type EventDraft = {
  step: EventDraftStep;
  title?: string;
  date?: string;
  time?: string;
  location?: string;
  description?: string;
  capacity?: number | null;
};

export type EventDraftAdvance =
  | { kind: "invalid"; draft: EventDraft; message: string }
  | { kind: "prompt"; draft: EventDraft; message: string }
  | { kind: "complete"; parsed: ParsedEvent };

export const TELEGRAM_EVENT_COMMANDS = [
  { command: "event", description: "Создать мероприятие" },
];

export function eventReplyKeyboard(isDraftActive = false) {
  return {
    keyboard: isDraftActive
      ? [[{ text: "/event" }, { text: "Отмена" }]]
      : [[{ text: "/event" }]],
    resize_keyboard: true,
    is_persistent: true,
  };
}

export function startEventDraft(): EventDraft {
  return { step: "title" };
}

export function eventDraftPrompt(step: EventDraftStep) {
  switch (step) {
    case "title":
      return "Название мероприятия?";
    case "date":
      return "Дата?\nФормат: ДД.ММ.ГГГГ, например 27.09.2026";
    case "time":
      return "Время?\nФормат: ЧЧ:ММ, например 12:00";
    case "location":
      return "Место?";
    case "description":
      return "Описание мероприятия?";
    case "capacity":
      return "Лимит участников?\nНапишите число или «пропустить».";
  }
}

export function normalizeEventDate(value: string) {
  const trimmed = value.trim();
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  const russianMatch = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(trimmed);
  const parts = isoMatch
    ? { year: Number(isoMatch[1]), month: Number(isoMatch[2]), day: Number(isoMatch[3]) }
    : russianMatch
      ? { year: Number(russianMatch[3]), month: Number(russianMatch[2]), day: Number(russianMatch[1]) }
      : null;
  if (!parts || parts.month < 1 || parts.month > 12 || parts.day < 1 || parts.day > 31) return null;

  const calendarDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  if (
    calendarDate.getUTCFullYear() !== parts.year
    || calendarDate.getUTCMonth() !== parts.month - 1
    || calendarDate.getUTCDate() !== parts.day
  ) return null;

  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

export function normalizeEventTime(value: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function parseEventDateTime(dateValue: string, timeValue: string) {
  const normalizedDate = normalizeEventDate(dateValue);
  const normalizedTime = normalizeEventTime(timeValue);
  if (!normalizedDate || !normalizedTime) return null;
  const startsAt = new Date(`${normalizedDate}T${normalizedTime}:00+05:00`);
  return Number.isNaN(startsAt.getTime()) ? null : startsAt;
}

function parseCapacity(value: string | undefined) {
  if (!value || /^(?:пропустить|нет|без лимита|-)$/i.test(value.trim())) return null;
  const capacity = Number.parseInt(value.trim(), 10);
  return Number.isInteger(capacity) && capacity > 0 ? capacity : null;
}

export function parseEventCommand(text: string): ParsedEvent | null {
  const read = (label: string) => text.match(new RegExp(`^${label}\\s*:\\s*(.+)$`, "im"))?.[1]?.trim();
  const title = read("Название");
  const dateValue = read("Дата");
  const timeValue = read("Время") ?? "19:00";
  const location = read("Место");
  const description = read("Описание");
  const capacityValue = read("Лимит");
  if (!title || !dateValue || !location || !description) return null;

  const startsAt = parseEventDateTime(dateValue, timeValue);
  if (!startsAt) return null;

  return {
    title,
    startsAt,
    location,
    description,
    capacity: parseCapacity(capacityValue),
  };
}

export function advanceEventDraft(draft: EventDraft, input: string): EventDraftAdvance {
  const value = input.trim();
  if (!value) return { kind: "invalid", draft, message: `Пустое сообщение не подходит. Попробуйте ещё раз.\n\n${eventDraftPrompt(draft.step)}` };

  if (draft.step === "title") {
    if (value.length < 2) return { kind: "invalid", draft, message: `Название слишком короткое.\n\n${eventDraftPrompt("title")}` };
    const nextDraft = { ...draft, title: value, step: "date" as const };
    return { kind: "prompt", draft: nextDraft, message: eventDraftPrompt(nextDraft.step) };
  }

  if (draft.step === "date") {
    const date = normalizeEventDate(value);
    if (!date) return { kind: "invalid", draft, message: `Не понял дату. Нужен формат ДД.ММ.ГГГГ, например 27.09.2026.\n\n${eventDraftPrompt("date")}` };
    const nextDraft = { ...draft, date, step: "time" as const };
    return { kind: "prompt", draft: nextDraft, message: eventDraftPrompt(nextDraft.step) };
  }

  if (draft.step === "time") {
    const time = normalizeEventTime(value);
    if (!time) return { kind: "invalid", draft, message: `Не понял время. Нужен формат ЧЧ:ММ, например 12:00.\n\n${eventDraftPrompt("time")}` };
    const nextDraft = { ...draft, time, step: "location" as const };
    return { kind: "prompt", draft: nextDraft, message: eventDraftPrompt(nextDraft.step) };
  }

  if (draft.step === "location") {
    const nextDraft = { ...draft, location: value, step: "description" as const };
    return { kind: "prompt", draft: nextDraft, message: eventDraftPrompt(nextDraft.step) };
  }

  if (draft.step === "description") {
    const nextDraft = { ...draft, description: value, step: "capacity" as const };
    return { kind: "prompt", draft: nextDraft, message: eventDraftPrompt(nextDraft.step) };
  }

  const capacity = parseCapacity(value);
  if (capacity === null && !/^(?:пропустить|нет|без лимита|-)$/i.test(value)) {
    return { kind: "invalid", draft, message: `Лимит должен быть целым числом или словом «пропустить».\n\n${eventDraftPrompt("capacity")}` };
  }

  const startsAt = parseEventDateTime(draft.date ?? "", draft.time ?? "");
  if (!startsAt) return { kind: "invalid", draft, message: "Не удалось собрать дату и время. Начните заново кнопкой /event." };
  if (startsAt <= new Date()) return { kind: "invalid", draft, message: "Дата мероприятия должна быть в будущем. Начните заново кнопкой /event." };

  return {
    kind: "complete",
    parsed: {
      title: draft.title ?? "",
      startsAt,
      location: draft.location ?? "",
      description: draft.description ?? "",
      capacity,
    },
  };
}
