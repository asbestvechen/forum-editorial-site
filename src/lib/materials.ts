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

export const tileMaterials: TileMaterial[] = [
  {
    id: "emil-tele-thassos",
    manufacturer: "Emilceramica",
    collection: "Tele di Marmo Revolution",
    name: "Thassos",
    format: "90 × 90 см",
    finish: "Natural",
    color: "Светлый",
    colorGroup: "Светлые",
    textureUrl: "./assets/materials/emil-thassos.webp",
    downloadUrl: "https://www.emilgroup.com/downloadarea/",
    sourceUrl: "https://www.emilgroup.com/collections/brand/emilceramica/tele-di-marmo-revolution/",
    sourceLabel: "Официальный каталог Emilceramica",
    tags: ["мрамор", "светлый", "90×90"],
  },
  {
    id: "emil-tele-calacatta-black",
    manufacturer: "Emilceramica",
    collection: "Tele di Marmo Revolution",
    name: "Calacatta Black",
    format: "120 × 278 см",
    finish: "Semi-polished",
    color: "Графит",
    colorGroup: "Чёрные",
    textureUrl: "./assets/materials/emil-calacatta-black.webp",
    downloadUrl: "https://www.emilgroup.com/downloadarea/",
    sourceUrl: "https://www.emilgroup.com/collections/brand/emilceramica/tele-di-marmo-revolution/",
    sourceLabel: "Официальный каталог Emilceramica",
    tags: ["мрамор", "графит", "крупный формат"],
  },
  {
    id: "emil-tele-verde-saint-denis",
    manufacturer: "Emilceramica",
    collection: "Tele di Marmo Revolution",
    name: "Verde Saint Denis",
    format: "60 × 120 см",
    finish: "Natural",
    color: "Зелёный",
    colorGroup: "Зелёные",
    textureUrl: "./assets/materials/emil-verde-saint-denis.webp",
    downloadUrl: "https://www.emilgroup.com/downloadarea/",
    sourceUrl: "https://www.emilgroup.com/collections/brand/emilceramica/tele-di-marmo-revolution/",
    sourceLabel: "Официальный каталог Emilceramica",
    tags: ["мрамор", "зелёный", "60×120"],
  },
  {
    id: "41zero42-solo",
    manufacturer: "41zero42",
    collection: "Solo",
    name: "Solo · коллекция",
    format: "Форматы в каталоге",
    finish: "Natural rectified",
    color: "Цветной",
    colorGroup: "Цветные",
    textureUrl: "./assets/materials/41zero42-solo.webp",
    downloadUrl: "https://www.41zero42.com/wp-content/uploads/solo/solo_minimali.zip",
    sourceUrl: "https://www.41zero42.com/collections/solo-eng/",
    sourceLabel: "Страница коллекции 41zero42",
    tags: ["цвет", "natural", "официальная коллекция"],
  },
  {
    id: "florim-stone-calacatta",
    manufacturer: "Florim",
    collection: "Stones & More 2.0",
    name: "Stone Calacatta",
    format: "120 × 280 см",
    finish: "Glossy / Matte Soft",
    color: "Светлый",
    colorGroup: "Светлые",
    textureUrl: "./assets/materials/florim-stone-calacatta.webp",
    downloadUrl: "https://www.florim.com/en/products/all-collections/stones-more-20/stone-calacatta",
    sourceUrl: "https://www.florim.com/en/products/all-collections/stones-more-20/stone-calacatta",
    sourceLabel: "Официальная страница Florim",
    tags: ["мрамор", "светлый", "глянец"],
  },
  {
    id: "florim-stone-marfil",
    manufacturer: "Florim",
    collection: "Stones & More 2.0",
    name: "Stone Marfil",
    format: "120 × 280 см",
    finish: "Matte Soft",
    color: "Бежевый",
    colorGroup: "Светлые",
    textureUrl: "./assets/materials/florim-stone-marfil.webp",
    downloadUrl: "https://www.florim.com/en/products/all-collections/stones-more-20/stone-marfil",
    sourceUrl: "https://www.florim.com/en/products/all-collections/stones-more-20/stone-marfil",
    sourceLabel: "Официальная страница Florim",
    tags: ["камень", "бежевый", "matte"],
  },
  {
    id: "florim-sahara-noir",
    manufacturer: "Florim",
    collection: "Stones & More 2.0",
    name: "Sahara Noir",
    format: "160 × 320 см",
    finish: "Matte",
    color: "Чёрный",
    colorGroup: "Чёрные",
    textureUrl: "./assets/materials/florim-sahara-noir.webp",
    downloadUrl: "https://www.florim.com/en/products/all-collections/stones-more-20",
    sourceUrl: "https://www.florim.com/en/products/all-collections/stones-more-20",
    sourceLabel: "Официальная страница Florim",
    tags: ["камень", "чёрный", "крупный формат"],
  },
];

export const materialManufacturers = ["Все производители", ...Array.from(new Set(tileMaterials.map((material) => material.manufacturer)))];
export const materialColorGroups = ["Все цвета", ...Array.from(new Set(tileMaterials.map((material) => material.colorGroup)))];
