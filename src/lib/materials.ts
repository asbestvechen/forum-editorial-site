export type MaterialZone = "wall" | "floor";

export type TileMaterial = {
  id: string;
  manufacturer: string;
  collection: string;
  name: string;
  format: string;
  finish: string;
  color: string;
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
    textureUrl: "https://www.emilgroup.it/emil/prodotti/immaginiarticoli_emil/TeleDiMarmo_Revolution_EHAD_90x90.jpg",
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
    textureUrl: "https://www.emilgroup.it/emil/prodotti/immaginiarticoli_emil/TeleDiMarmo_Revolution_EHA5_120x278.jpg",
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
    textureUrl: "https://www.emilgroup.it/emil/prodotti/immaginiarticoli_emil/EHC1_Tele%20di%20Marmo%20Revolution_Verde%20Saint%20Denis_60x120_1.jpg",
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
    textureUrl: "https://www.41zero42.com/wp-content/uploads/2018/02/solo-slider03.jpg",
    downloadUrl: "https://www.41zero42.com/wp-content/uploads/solo/solo_minimali.zip",
    sourceUrl: "https://www.41zero42.com/collections/solo-eng/",
    sourceLabel: "Страница коллекции 41zero42",
    tags: ["цвет", "natural", "cad texture"],
  },
  {
    id: "florim-stone-calacatta",
    manufacturer: "Florim",
    collection: "Stones & More 2.0",
    name: "Stone Calacatta",
    format: "120 × 280 см",
    finish: "Glossy / Matte Soft",
    color: "Светлый",
    textureUrl: "https://florim-cdn.thron.com/api/v1/content-delivery/shares/rf8vac/contents/79383acb-3368-40d4-ae9b-f4d4a132d47d/image/751781_01.jpg?w=640&format=webp&q=95",
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
    textureUrl: "https://florim-cdn.thron.com/api/v1/content-delivery/shares/rf8vac/contents/189248cc-cf8b-45de-ade9-98c7095d60a1/image/756498_01.jpg?w=640&format=webp&q=95",
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
    textureUrl: "https://florim-cdn.thron.com/api/v1/content-delivery/shares/rf8vac/contents/3a7238b1-2378-457a-aae5-d12a818e9f22/image/Amb%25201%2520pav%252080x80%2520sahara%2520noir%2520riv%2520160x320%2520sahara%2520noir.jpg?w=640&format=webp&q=95",
    downloadUrl: "https://www.florim.com/en/products/all-collections/stones-more-20",
    sourceUrl: "https://www.florim.com/en/products/all-collections/stones-more-20",
    sourceLabel: "Официальная страница Florim",
    tags: ["камень", "чёрный", "крупный формат"],
  },
];

export const materialManufacturers = ["Все производители", ...Array.from(new Set(tileMaterials.map((material) => material.manufacturer)))];
