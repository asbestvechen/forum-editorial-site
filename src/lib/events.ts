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
  posts: [
    {
      id: "snapshot-phonitura",
      telegramMessageId: 0,
      channelUsername: "salon4room",
      publishedAt: "2026-09-03T10:11:00+05:00",
      category: "event",
      title: "Бизнес-завтрак с Phonitura",
      text: "В салоне прошёл бизнес-завтрак с представителем бренда Phonitura — встреча была посвящена акустическим панелям и их применению в интерьерах.",
      excerpt: "Живые образцы, кейсы и разговор о том, как акустические решения работают в жилых и коммерческих пространствах.",
      telegramUrl: "https://t.me/salon4room",
    },
    {
      id: "snapshot-rim",
      telegramMessageId: 0,
      channelUsername: "salon4room",
      publishedAt: "2026-09-02T15:34:00+05:00",
      category: "objects",
      title: "Объект Григория Заславского",
      text: "Заглянули на объект студии RIM.XIII и посмотрели, как продвигается реализация проекта.",
      excerpt: "Плитка, двери, декоративный свет и карнизы уже собирают пространство в цельный интерьер.",
      telegramUrl: "https://t.me/salon4room",
    },
    {
      id: "snapshot-arredo3",
      telegramMessageId: 0,
      channelUsername: "salon4room",
      publishedAt: "2026-09-01T16:17:00+05:00",
      category: "materials",
      title: "Новые образцы Arredo3",
      text: "Новые образцы фабрики Arredo3 уже в салоне.",
      excerpt: "Итальянский дизайн, продуманные детали и материалы, которые можно увидеть и оценить вживую.",
      telegramUrl: "https://t.me/salon4room",
    },
  ],
};
