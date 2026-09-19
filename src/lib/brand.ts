export const brand = {
  name: "ФОРУМ",
  nameLatin: "FORUM",
  tagline: "интерьерный бутик",
  phone: "+7 343 305 44 34",
  phoneHref: "tel:+73433054434",
  email: "4room.salon@gmail.com",
  address: "г. Екатеринбург, ул. Хохрякова, 18, 1 этаж",
  hours: "Пн–Пт 10:00–19:00",
  directContact: {
    name: "Макс",
    phone: "8 904 179 15 08",
    phoneHref: "tel:+79041791508",
    telegram: "@mko_vv",
    telegramHref: "https://t.me/mko_vv",
  },
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

// Official brand/factory sites used by the clickable supplier chips in the direction drawer.
// Generic labels such as «Европа» or «Собственная монтажная бригада» intentionally remain plain text.
export const brandWebsiteUrls: Record<string, string> = {
  Coswick: "https://coswick.com/",
  Egger: "https://www.egger.com/",
  "Lab Arte": "https://lab-arte.ru/",
  Karelia: "https://www.kareliafloors.com/",
  UNION: "https://union.ru/",
  "Академия дверей": "https://academydverey.ru/",
  Estet: "https://estetdoors.ru/",
  Tupai: "https://www.tupai.pt/",
  Aprile: "https://www.aprile.com/",
  ORAC: "https://www.oracdecor.com/",
  EUROPLAST: "https://europlast.lv/",
  "Emil Group": "https://www.emilgroup.com/",
  "Living Ceramic": "https://www.livingceramics.com/",
  "Iris FMG": "https://www.irisceramica.com/",
  Florim: "https://www.florim.com/",
  Neodom: "https://neodom.ru/",
  WOW: "https://wowdesigneu.com/",
  "41zero42": "https://www.41zero42.com/",
  "Kerama Marazzi": "https://www.kerama-marazzi.com/",
  Italon: "https://italon.ru/",
  "Atlas Concord": "https://www.atlasconcorde.com/",
  TECE: "https://www.tece.com/",
  BOHEME: "https://boheme.ru/",
  HANSGROHE: "https://www.hansgrohe.com/",
  GESSI: "https://www.gessi.com/",
  CEA: "https://www.ceadesign.it/",
  ARBI: "https://www.arbiarredobagno.it/",
  Pianca: "https://www.pianca.com/",
  Minotti: "https://www.minotti.com/",
  Baxter: "https://www.baxter.it/",
  "Poltrona Frau": "https://www.poltronafrau.com/",
  Technolight: "https://technolight.ru/",
  Aledo: "https://aledo.ru/",
  Lumitex: "https://lumitex.ru/",
  ArteLamp: "https://artelamp.ru/",
  Maytoni: "https://maytoni.ru/",
  Denkirs: "https://denkirs.ru/",
  Karman: "https://www.karmanitalia.it/",
  Vibia: "https://www.vibia.com/",
  Flos: "https://flos.com/",
  Foscarini: "https://www.foscarini.com/",
  Bocci: "https://www.bocci.com/",
  "Ingo Maurer": "https://www.ingo-maurer.com/",
  Italamp: "https://www.italamp.com/",
  Moooi: "https://moooi.com/",
  "Tom Dixon": "https://www.tomdixon.net/",
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
  "Напольные покрытия, двери и фурнитура",
  "Развитие",
  "Керамогранит и сантехническое оборудование",
  "Корпусная и мягкая мебель, кухни",
  "Технический, декоративный свет",
  "Текстиль, ткани и шторы",
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
    details: "Паркет, инженерная доска, массивная доска, ламинат, кварц-винил, ковры и коммерческий линолеум — всё в одном месте. Мы — официальные представители брендов Coswick, Egger, Lab Arte и Karelia. Для точного расчёта нужны план помещения с размерами и визуал проекта; подготовим комплектацию, смету и сроки поставки.",
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
    slug: "mouldings",
    title: "Лепнина и молдинги",
    desc: "Декоративные профили, карнизы и панели для цельного интерьера",
    details: "Лепнина и молдинги ORAC и EUROPLAST — декоративные профили, карнизы, панели и элементы для классических и современных интерьеров. Подберём решение под стиль помещения, рассчитаем количество и комплектующие, организуем доставку и монтаж.",
    image: "./images/directions/mouldings.webp",
    brandLabel: "Бренды",
    brands: ["ORAC", "EUROPLAST"],
  },
  {
    slug: "furniture",
    title: "Корпусная и мягкая мебель",
    desc: "Мебель по индивидуальным проектам, кабинеты и гардеробные",
    details: "Проектируем корпусную мебель, кабинеты и гардеробные по вашим размерам, а мягкую мебель подбираем под конкретную гостиную или спальню. Работаем напрямую с итальянскими фабриками Pianca, Minotti, Baxter, Poltrona Frau и другими производителями; большое количество образцов в салоне можно увидеть и потрогать.",
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
    details: "Большой выбор тканей для штор из Европы, Китая и Турции — от классики до современных фактур. Сделаем шторы под ключ по вашим размерам и эскизам, добавим электрокарнизы и профессиональную развеску на объекте. Подберём мебельные ткани, обои и ковры в единой стилистике, а также предложим акустические решения PHONITURA и бамбуковые панели.",
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
    title: "Консультация специалиста",
    desc: "Бесплатная консультация специалиста перед покупкой",
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
    name: "Антон Костромин",
    role: "Руководитель напольных покрытий и дверей",
    departments: ["Напольные покрытия, двери и фурнитура"],
    department: "Напольные покрытия и двери",
    bio: "Отвечает за направление напольных покрытий, дверей и фурнитуры — помогает собрать цельное решение под архитектуру и характер интерьера.",
    focus: "Напольные покрытия · Двери · Фурнитура",
    image: "./images/team/team-1.webp",
  },
  {
    name: "Юлия Александрова",
    role: "Директор по развитию",
    departments: ["Развитие"],
    department: "Развитие ФОРУМА",
    bio: "Развивает ФОРУМ и партнёрские отношения, соединяя сильные коллекции, команды и проекты вокруг внимательного отношения к интерьеру.",
    focus: "Развитие · Партнёрства · Проекты",
    image: "./images/team/team-2.webp",
  },
  {
    name: "Наталья Сурнина",
    role: "Руководитель отдела текстиля",
    departments: ["Текстиль, ткани и шторы"],
    department: "Текстиль, ткани и шторы",
    bio: "Ведёт текстильное направление и помогает подобрать ткани, шторы и фактуры, которые собирают интерьер в цельную, живую историю.",
    focus: "Ткани · Шторы · Текстильные решения",
    image: "./images/team/team-3.webp",
  },
];
