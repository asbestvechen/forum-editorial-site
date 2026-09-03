export type EventPostCategory = "event" | "objects" | "materials" | "news" | "inspiration";

export type TelegramPost = {
  id: string;
  telegramMessageId: number;
  channelUsername: string;
  publishedAt: string;
  category: EventPostCategory;
  title: string;
  text: string;
  excerpt: string;
  imageUrl?: string | null;
  imageUrls: string[];
  telegramUrl: string;
};

export type FeaturedEvent = {
  id: string;
  title: string;
  startsAt: string;
  displayTimezone: string;
  location: string;
  description: string;
  capacity?: number | null;
  imageUrl?: string | null;
};

export type EventsPageData = {
  featuredEvent: FeaturedEvent | null;
  posts: TelegramPost[];
  channelUrl: string;
  lastSyncedAt: string | null;
};

export const eventPostCategoryLabels: Record<EventPostCategory, string> = {
  event: "События",
  objects: "Объекты",
  materials: "Материалы",
  news: "Новости салона",
  inspiration: "Вдохновение",
};

export const eventPostCategoryAccent: Record<EventPostCategory, string> = {
  event: "#C98A12",
  objects: "#7C8E7A",
  materials: "#A26C4A",
  news: "#8E6E91",
  inspiration: "#5A7780",
};

export function formatPostDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export const fallbackEventsPage: EventsPageData = {
  featuredEvent: null,
  channelUrl: "https://t.me/salon4room",
  lastSyncedAt: null,
  posts: [],
};
