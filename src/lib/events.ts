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
      publishedAt: "2026-08-27T07:00:00+00:00",
      category: "event",
      title: "Бизнес-завтрак с PHONITURA",
      text: "27 августа в 12:00 интерьерный салон 4ROOM приглашает на бизнес-завтрак с представителем бренда PHONITURA.\n\nЗа чашкой кофе вы узнаете:\n\n• как акустические панели улучшают комфорт и восприятие интерьера;\n\n• как подбирать индивидуальные решения под офис, ресторан, шоурум или жилой проект.\n\nГотовые кейсы, живые примеры и ответы на ваши вопросы — всё в одном завтраке.\n\n📍 4ROOM, ул. Хохрякова, 18\n⏰ 27 августа, 12:00\n🔥 Количество мест ограничено — пишите, чтобы забронировать участие.",
      excerpt: "Живые примеры и разговор об акустических панелях: как сделать интерьер комфортнее и подобрать решение под любой проект.",
      imageUrl: "./images/events/phonitura-business-breakfast.jpg",
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
      imageUrl: "./images/events/phonitura-rim.jpg",
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
      imageUrl: "./images/events/arredo3.jpg",
      telegramUrl: "https://t.me/salon4room",
    },
  ],
};
