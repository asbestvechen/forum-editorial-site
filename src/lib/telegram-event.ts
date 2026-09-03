export const EVENT_TIMEZONE = "Asia/Yekaterinburg";

export type ParsedEvent = {
  title: string;
  startsAt: Date;
  location: string;
  description: string;
  capacity: number | null;
};

export function parseEventCommand(text: string): ParsedEvent | null {
  const read = (label: string) => text.match(new RegExp(`^${label}\\s*:\\s*(.+)$`, "im"))?.[1]?.trim();
  const title = read("Название");
  const dateValue = read("Дата");
  const timeValue = read("Время") ?? "19:00";
  const location = read("Место");
  const description = read("Описание");
  const capacityValue = read("Лимит");
  if (!title || !dateValue || !location || !description) return null;

  const isoDate = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    ?? dateValue.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)?.slice().reverse();
  if (!isoDate || !/^\d{1,2}:\d{2}$/.test(timeValue)) return null;
  const normalizedDate = dateValue.includes(".")
    ? `${isoDate[0]}-${isoDate[1]}-${isoDate[2]}`
    : dateValue;
  const startsAt = new Date(`${normalizedDate}T${timeValue}:00+05:00`);
  if (Number.isNaN(startsAt.getTime())) return null;

  return {
    title,
    startsAt,
    location,
    description,
    capacity: capacityValue ? Number.parseInt(capacityValue, 10) || null : null,
  };
}
