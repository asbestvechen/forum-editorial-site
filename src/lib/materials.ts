export type TileMaterial = {
  id: string;
  manufacturer: string;
  collection: string;
  name: string;
  format: string;
  finish: string;
  color: string;
  colorGroup: string;
  textureUrl: string;
  downloadUrl: string;
  sourceUrl: string;
  sourceLabel: string;
  tags: string[];
};

const studioSource = "ФОРУМ Studio · визуальная подборка";

export const tileMaterials: TileMaterial[] = [
  {
    id: "emil-tele-thassos", manufacturer: "Emilceramica", collection: "Tele di Marmo Revolution", name: "Thassos", format: "90 × 90 см", finish: "Natural", color: "Светлый", colorGroup: "Бежевые",
    textureUrl: "./assets/materials/emil-thassos.webp", downloadUrl: "https://www.emilgroup.com/downloadarea/", sourceUrl: "https://www.emilgroup.com/collections/brand/emilceramica/tele-di-marmo-revolution/", sourceLabel: "Официальный каталог Emilceramica", tags: ["мрамор", "светлый", "90×90"],
  },
  {
    id: "florim-stone-calacatta", manufacturer: "Florim", collection: "Stones & More 2.0", name: "Stone Calacatta", format: "120 × 280 см", finish: "Glossy / Matte Soft", color: "Светлый", colorGroup: "Бежевые",
    textureUrl: "./assets/materials/florim-stone-calacatta.webp", downloadUrl: "https://www.florim.com/en/products/all-collections/stones-more-20/stone-calacatta", sourceUrl: "https://www.florim.com/en/products/all-collections/stones-more-20/stone-calacatta", sourceLabel: "Официальная страница Florim", tags: ["мрамор", "светлый", "глянец"],
  },
  {
    id: "florim-stone-marfil", manufacturer: "Florim", collection: "Stones & More 2.0", name: "Stone Marfil", format: "120 × 280 см", finish: "Matte Soft", color: "Бежевый", colorGroup: "Бежевые",
    textureUrl: "./assets/materials/florim-stone-marfil.webp", downloadUrl: "https://www.florim.com/en/products/all-collections/stones-more-20/stone-marfil", sourceUrl: "https://www.florim.com/en/products/all-collections/stones-more-20/stone-marfil", sourceLabel: "Официальная страница Florim", tags: ["камень", "бежевый", "matte"],
  },
  {
    id: "forum-ivory-calacatta", manufacturer: "ФОРУМ Studio", collection: "Stone Studies", name: "Ivory Calacatta", format: "60 × 60 см", finish: "Soft matte", color: "Молочный", colorGroup: "Бежевые",
    textureUrl: "./assets/materials/forum-tile-1.webp", downloadUrl: "./assets/materials/forum-tile-1.webp", sourceUrl: "", sourceLabel: studioSource, tags: ["мрамор", "светлый", "нейтральный"],
  },
  {
    id: "forum-ivory-limestone", manufacturer: "ФОРУМ Studio", collection: "Natural Stone Study", name: "Ivory Limestone", format: "60 × 60 см", finish: "Honed", color: "Айвори", colorGroup: "Бежевые",
    textureUrl: "./assets/materials/forum-tile-4.webp", downloadUrl: "./assets/materials/forum-tile-4.webp", sourceUrl: "", sourceLabel: studioSource, tags: ["известняк", "айвори", "матовый"],
  },
  {
    id: "emil-tele-calacatta-black", manufacturer: "Emilceramica", collection: "Tele di Marmo Revolution", name: "Calacatta Black", format: "120 × 278 см", finish: "Semi-polished", color: "Графит", colorGroup: "Чёрные / графитовые",
    textureUrl: "./assets/materials/emil-calacatta-black.webp", downloadUrl: "https://www.emilgroup.com/downloadarea/", sourceUrl: "https://www.emilgroup.com/collections/brand/emilceramica/tele-di-marmo-revolution/", sourceLabel: "Официальный каталог Emilceramica", tags: ["мрамор", "графит", "крупный формат"],
  },
  {
    id: "forum-graphite-vein", manufacturer: "ФОРУМ Studio", collection: "Stone Studies", name: "Graphite Vein", format: "60 × 60 см", finish: "Natural", color: "Чёрный", colorGroup: "Чёрные / графитовые",
    textureUrl: "./assets/materials/forum-tile-2.webp", downloadUrl: "./assets/materials/forum-tile-2.webp", sourceUrl: "", sourceLabel: studioSource, tags: ["камень", "чёрный", "контрастный"],
  },
  {
    id: "forum-charcoal-slate", manufacturer: "ФОРУМ Studio", collection: "Natural Stone Study", name: "Charcoal Slate", format: "60 × 60 см", finish: "Natural", color: "Антрацит", colorGroup: "Чёрные / графитовые",
    textureUrl: "./assets/materials/forum-tile-10.webp", downloadUrl: "./assets/materials/forum-tile-10.webp", sourceUrl: "", sourceLabel: studioSource, tags: ["сланец", "антрацит", "рельефный"],
  },
  {
    id: "forum-walnut-stone", manufacturer: "ФОРУМ Studio", collection: "Natural Stone Study", name: "Walnut Stone", format: "60 × 120 см", finish: "Natural", color: "Коричневый", colorGroup: "Чёрные / графитовые",
    textureUrl: "./assets/materials/forum-tile-13.webp", downloadUrl: "./assets/materials/forum-tile-13.webp", sourceUrl: "", sourceLabel: studioSource, tags: ["камень", "коричневый", "тёплый"],
  },
  {
    id: "forum-deep-navy", manufacturer: "ФОРУМ Studio", collection: "Stone Studies", name: "Deep Navy", format: "60 × 120 см", finish: "Semi-polished", color: "Тёмно-синий", colorGroup: "Чёрные / графитовые",
    textureUrl: "./assets/materials/forum-tile-20.webp", downloadUrl: "./assets/materials/forum-tile-20.webp", sourceUrl: "", sourceLabel: studioSource, tags: ["камень", "синий", "полированный"],
  },
  {
    id: "emil-tele-verde-saint-denis", manufacturer: "Emilceramica", collection: "Tele di Marmo Revolution", name: "Verde Saint Denis", format: "60 × 120 см", finish: "Natural", color: "Зелёный", colorGroup: "Зелёные / природные",
    textureUrl: "./assets/materials/emil-verde-saint-denis.webp", downloadUrl: "https://www.emilgroup.com/downloadarea/", sourceUrl: "https://www.emilgroup.com/collections/brand/emilceramica/tele-di-marmo-revolution/", sourceLabel: "Официальный каталог Emilceramica", tags: ["мрамор", "зелёный", "60×120"],
  },
  {
    id: "forum-verde-mare", manufacturer: "ФОРУМ Studio", collection: "Stone Studies", name: "Verde Mare", format: "60 × 120 см", finish: "Polished", color: "Зелёный", colorGroup: "Зелёные / природные",
    textureUrl: "./assets/materials/forum-tile-3.webp", downloadUrl: "./assets/materials/forum-tile-3.webp", sourceUrl: "", sourceLabel: studioSource, tags: ["мрамор", "зелёный", "глянец"],
  },
  {
    id: "forum-sage-zellige", manufacturer: "ФОРУМ Studio", collection: "Color Studies", name: "Sage Zellige", format: "10 × 10 см", finish: "Glossy", color: "Шалфей", colorGroup: "Зелёные / природные",
    textureUrl: "./assets/materials/forum-tile-8.webp", downloadUrl: "./assets/materials/forum-tile-8.webp", sourceUrl: "", sourceLabel: studioSource, tags: ["зелёный", "zellige", "глянец"],
  },
  {
    id: "forum-olive-limestone", manufacturer: "ФОРУМ Studio", collection: "Natural Stone Study", name: "Olive Limestone", format: "60 × 60 см", finish: "Honed", color: "Оливковый", colorGroup: "Зелёные / природные",
    textureUrl: "./assets/materials/forum-tile-19.webp", downloadUrl: "./assets/materials/forum-tile-19.webp", sourceUrl: "", sourceLabel: studioSource, tags: ["известняк", "оливковый", "матовый"],
  },
  {
    id: "forum-forest-green", manufacturer: "ФОРУМ Studio", collection: "Color Studies", name: "Forest Green", format: "60 × 60 см", finish: "Natural", color: "Лесной зелёный", colorGroup: "Зелёные / природные",
    textureUrl: "./assets/materials/forum-tile-21.webp", downloadUrl: "./assets/materials/forum-tile-21.webp", sourceUrl: "", sourceLabel: studioSource, tags: ["зелёный", "тёмный", "камень"],
  },
  {
    id: "forum-terra-cotta", manufacturer: "ФОРУМ Studio", collection: "Color Studies", name: "Terra Cotta", format: "20 × 20 см", finish: "Natural", color: "Терракота", colorGroup: "Цветные",
    textureUrl: "./assets/materials/forum-tile-7.webp", downloadUrl: "./assets/materials/forum-tile-7.webp", sourceUrl: "", sourceLabel: studioSource, tags: ["терракота", "цветной", "матовый"],
  },
  {
    id: "forum-cobalt-gloss", manufacturer: "ФОРУМ Studio", collection: "Color Studies", name: "Cobalt Gloss", format: "10 × 10 см", finish: "Glossy", color: "Кобальт", colorGroup: "Цветные",
    textureUrl: "./assets/materials/forum-tile-9.webp", downloadUrl: "./assets/materials/forum-tile-9.webp", sourceUrl: "", sourceLabel: studioSource, tags: ["синий", "цветной", "глянец"],
  },
  {
    id: "forum-dusty-rose", manufacturer: "ФОРУМ Studio", collection: "Color Studies", name: "Dusty Rose", format: "60 × 60 см", finish: "Honed", color: "Пудровый", colorGroup: "Цветные",
    textureUrl: "./assets/materials/forum-tile-14.webp", downloadUrl: "./assets/materials/forum-tile-14.webp", sourceUrl: "", sourceLabel: studioSource, tags: ["розовый", "пудровый", "матовый"],
  },
  {
    id: "forum-rust-marble", manufacturer: "ФОРУМ Studio", collection: "Stone Studies", name: "Rust Marble", format: "60 × 120 см", finish: "Polished", color: "Ржаво-красный", colorGroup: "Цветные",
    textureUrl: "./assets/materials/forum-tile-17.webp", downloadUrl: "./assets/materials/forum-tile-17.webp", sourceUrl: "", sourceLabel: studioSource, tags: ["мрамор", "красный", "контрастный"],
  },
  {
    id: "forum-blue-gray-concrete", manufacturer: "ФОРУМ Studio", collection: "Concrete Studies", name: "Blue Grey Concrete", format: "60 × 60 см", finish: "Matte", color: "Сине-серый", colorGroup: "Цветные",
    textureUrl: "./assets/materials/forum-tile-15.webp", downloadUrl: "./assets/materials/forum-tile-15.webp", sourceUrl: "", sourceLabel: studioSource, tags: ["бетон", "серый", "матовый"],
  },
];

export const materialManufacturers = ["Все производители", ...Array.from(new Set(tileMaterials.map((material) => material.manufacturer)))];
export const materialColorGroups = ["Все цвета", ...Array.from(new Set(tileMaterials.map((material) => material.colorGroup)))];
