export const brand = {
  name: "ФОРУМ",
  nameLatin: "FORUM",
  tagline: "интерьерный бутик",
  phone: "+7 343 305 44 34",
  phoneHref: "tel:+73433054434",
  email: "4room.salon@gmail.com",
  address: "г. Екатеринбург, ул. Хохрякова, 18, 1 этаж",
  hours: "Пн–Пт 10:00–19:00",
};

export type Category = {
  slug: string;
  title: string;
  desc: string;
  details: string;
  image: string;
  brandLabel: string;
  brands: string[];
};

// Local brand marks are downloaded from the corresponding public brand domains.
// Categories without a confirmed source keep their text-only wordmark fallback.
export const brandLogoSlugs: Record<string, string> = {
  Coswick: "coswick",
  Egger: "egger",
  Karelia: "karelia",
  Estet: "estet",
  Tupai: "tupai",
  Aprile: "aprile",
  "Emil Group": "emil-group",
  "Living Ceramic": "living-ceramics",
  Florim: "florim",
  WOW: "wow",
  "41zero42": "41zero42",
  "Kerama Marazzi": "kerama-marazzi",
  Italon: "italon",
  "Atlas Concord": "atlas-concorde",
  TECE: "tece",
  HANSGROHE: "hansgrohe",
  GESSI: "gessi",
  CEA: "cea",
  ARBI: "arbi",
  Pianca: "pianca",
  Minotti: "minotti",
  Baxter: "baxter",
  "Poltrona Frau": "poltrona-frau",
  Technolight: "technolight",
  Lumitex: "lumitex",
  ArteLamp: "arte-lamp",
  Maytoni: "maytoni",
  Denkirs: "denkirs",
  Karman: "karman",
  Vibia: "vibia",
  Flos: "flos",
  Foscarini: "foscarini",
  Bocci: "bocci",
  "Ingo Maurer": "ingo-maurer",
  Italamp: "italamp",
  Moooi: "moooi",
  "Tom Dixon": "tom-dixon",
};

export type TeamMember = {
  name: string;
  role: string;
  departments: TeamDepartment[];
  department: string;
  bio: string;
  focus: string;
  image: string;
};

export const teamDepartments = [
  "Напольные покрытия",
  "Двери и фурнитура",
  "Керамогранит и сантехническое оборудование",
  "Корпусная и мягкая мебель",
  "Технический, декоративный свет",
  "Текстиль, ткани и шторы",
  "Кухни",
  "Логистика",
] as const;

export type TeamDepartment = (typeof teamDepartments)[number];

// Shared "light" photography set — reused across the editorial directions
// gallery and the retained reference concept.
export const lightImages = {
  hero: "./images/light/hero-living.webp",
  heroEditorial: "./images/light/hero-editorial.webp",
  parquet: "./images/light/parquet.webp",
  kitchen: "./images/light/kitchen.webp",
  bedroom: "./images/light/bedroom.webp",
  bathroom: "./images/light/bathroom.webp",
  lighting: "./images/light/lighting.webp",
};

export const darkImages = {
  hero: "./images/dark/hero-living.webp",
  bedroom: "./images/dark/bedroom.webp",
  kitchen: "./images/dark/kitchen.webp",
  detail: "./images/dark/detail.webp",
};

export const categories: Category[] = [
  {
    slug: "flooring",
    title: "Напольные покрытия",
    desc: "Паркет, массивная доска, инженерная доска и ламинат",
    details: "Что можем предложить: паркет, инженерную доску, массивную доску, ламинат, кварц-винил, ковры и коммерческий линолеум — всё в одном месте. Мы — официальные представители брендов Coswick, Egger, Lab Arte и Karelia. Для точного расчёта нужны план помещения с размерами и визуал проекта; подготовим комплектацию, смету и сроки поставки.",
    image: "./images/directions/flooring.webp",
    brandLabel: "Представляем",
    brands: ["Coswick", "Egger", "Lab Arte", "Karelia"],
  },
  {
    slug: "doors",
    title: "Двери и фурнитура",
    desc: "Дверные полотна, ручки и фурнитура для цельного интерьера",
    details: "Мы — официальные представители UNION, «Академия дверей» и Estet. Подберём двери, перегородки, ручки, системы открывания и стеновые панели от Tupai и Aprile из Италии и Португалии. Представлены разные ценовые сегменты — от средний+ до премиум; поможем согласовать отделку и монтаж.",
    image: "./images/directions/doors.webp",
    brandLabel: "Представляем",
    brands: ["UNION", "Академия дверей", "Estet", "Tupai", "Aprile"],
  },
  {
    slug: "stone-sanitary",
    title: "Керамогранит и сантехническое оборудование",
    desc: "Керамогранит, натуральный камень и сантехническое оборудование",
    details: "Комплектуем ванные комнаты и другие зоны целиком: керамическая плитка, крупноформатный керамогранит, натуральный камень, смесители, душевые системы, ванны, унитазы и мебель. В коллекциях — Emil Group, Living Ceramic, Iris FMG, Florim, Neodom, WOW, 41zero42, Kerama Marazzi, Italon, Atlas Concord, TECE, BOHEME, HANSGROHE, GESSI, CEA и ARBI. Подберём сочетание фактур, цветов и технических решений под проект.",
    image: "./images/directions/porcelain.webp",
    brandLabel: "Бренды и коллекции",
    brands: [
      "Emil Group",
      "Living Ceramic",
      "Iris FMG",
      "Florim",
      "Neodom",
      "WOW",
      "41zero42",
      "Kerama Marazzi",
      "Italon",
      "Atlas Concord",
      "TECE",
      "BOHEME",
      "HANSGROHE",
      "GESSI",
      "CEA",
      "ARBI",
    ],
  },
  {
    slug: "furniture",
    title: "Корпусная и мягкая мебель",
    desc: "Мебель по индивидуальным проектам, кабинеты и гардеробные",
    details: "Проектируем корпусную мебель, кабинеты, библиотеки и гардеробные по вашим размерам, а мягкую мебель подбираем под конкретную гостиную или спальню. Для гардеробных используем фирменное программное обеспечение Pianca. Работаем напрямую с итальянскими фабриками Minotti, Baxter, Poltrona Frau и другими производителями; большое количество образцов в салоне можно увидеть и потрогать.",
    image: "./images/directions/furniture.webp",
    brandLabel: "Фабрики",
    brands: ["Pianca", "Minotti", "Baxter", "Poltrona Frau"],
  },
  {
    slug: "technical-decorative-light",
    title: "Технический, декоративный свет",
    desc: "Световые сценарии, архитектурные системы и акцентные светильники",
    details: "Соберём световой сценарий целиком: трековые системы, встроенные и накладные светильники, декоративные акценты. В техническом свете представлены Technolight, Aledo, Lumitex, ArteLamp, Maytoni и Denkirs; декоративный свет — Karman, Vibia, Flos, Foscarini, Bocci, Ingo Maurer, Italamp, Moooi и Tom Dixon. Есть решения от премиальных брендов до доступных коллекций, поставка из России и Европы, а при согласовании проекта рассчитаем освещение.",
    image: "./images/directions/decorative-light.webp",
    brandLabel: "Бренды",
    brands: [
      "Technolight",
      "Aledo",
      "Lumitex",
      "ArteLamp",
      "Maytoni",
      "Denkirs",
      "Karman",
      "Vibia",
      "Flos",
      "Foscarini",
      "Bocci",
      "Ingo Maurer",
      "Italamp",
      "Moooi",
      "Tom Dixon",
    ],
  },
  {
    slug: "textile",
    title: "Текстиль, ткани и шторы",
    desc: "Фактурные ткани, портьеры и решения для мягкого света",
    details: "Большой выбор тканей для штор из Европы, Китая и Турции — от классики до современных фактур. Сделаем шторы под ключ по вашим размерам и эскизам, добавим электрокарнизы и профессиональную развеску на объекте. Мебельные ткани и обои подберём в единой стилистике.",
    image: "./images/directions/curtains.webp",
    brandLabel: "Поставщики тканей",
    brands: ["Европа", "Китай", "Турция"],
  },
  {
    slug: "kitchens",
    title: "Кухни",
    desc: "Кухонные гарнитуры, столешницы и обеденные зоны",
    details: "Мы — эксклюзивные дилеры с живой экспозицией в салоне. Работаем напрямую с итальянскими кухонными брендами и мебельными фабриками — без посредников, с официальными гарантиями. Доставка и сборка выполняются собственной монтажной бригадой: от замера до финального монтажа.",
    image: "./images/directions/kitchens.webp",
    brandLabel: "Партнёры",
    brands: ["Итальянские кухонные фабрики", "Эксклюзивная экспозиция", "Собственная монтажная бригада"],
  },
];

export const advantages = [
  {
    title: "Прямые поставки",
    desc: "Работаем напрямую с производителями Италии, Испании, Германии и Португалии",
  },
  {
    title: "Консультация дизайнера",
    desc: "Бесплатная консультация декоратора перед покупкой",
  },
  {
    title: "Индивидуальные проекты",
    desc: "Мебель и декор по индивидуальным размерам и эскизам",
  },
  {
    title: "Бережная доставка",
    desc: "Каждый товар упаковывается с особым вниманием и доставляется в срок",
  },
];

export const teamImage = "./images/team/team.webp";

export const teamMembers: TeamMember[] = [
  {
    name: "Анна Воронцова",
    role: "Арт-директор",
    departments: ["Корпусная и мягкая мебель"],
    department: "Кураторство и стиль",
    bio: "Формирует визуальный язык ФОРУМА, отбирает коллекции и собирает из разрозненных предметов цельные интерьерные истории.",
    focus: "Подбор коллекций · Концепции · Стилистика",
    image: "./images/team/team-1.webp",
  },
  {
    name: "Михаил Лебедев",
    role: "Руководитель проектов",
    departments: ["Логистика"],
    department: "Комплектация интерьеров",
    bio: "Ведёт проекты от первого эскиза до поставки: синхронизирует фабрики, сроки и монтаж, чтобы сложные решения собирались спокойно и точно.",
    focus: "Проекты · Логистика · Авторский надзор",
    image: "./images/team/team-2.webp",
  },
  {
    name: "Елена Соколова",
    role: "Дизайнер-консультант",
    departments: ["Технический, декоративный свет"],
    department: "Свет и текстиль",
    bio: "Помогает найти правильное настроение пространства через свет, ткани и тактильные материалы — от первого визита в салон до финальной примерки.",
    focus: "Световые сценарии · Ткани · Консультации",
    image: "./images/team/team-3.webp",
  },
];
