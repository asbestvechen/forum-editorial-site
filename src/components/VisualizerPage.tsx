import { useMemo, useState } from "react";
import { Check, Download, ExternalLink, Search, SlidersHorizontal } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { brand } from "@/lib/brand";
import { materialManufacturers, tileMaterials, type MaterialZone, type TileMaterial } from "@/lib/materials";

const bathroomImage = "./images/light/bathroom.webp";

function MaterialCard({ material, selected, onSelect }: { material: TileMaterial; selected: boolean; onSelect: () => void }) {
  return (
    <button type="button" className={`visualizer-material-card ${selected ? "visualizer-material-card--selected" : ""}`} onClick={onSelect} aria-pressed={selected}>
      <span className="visualizer-material-card__image-wrap">
        <img src={material.textureUrl} alt="" loading="lazy" />
        {selected && <span className="visualizer-material-card__check"><Check size={13} strokeWidth={2} /></span>}
      </span>
      <span className="visualizer-material-card__copy">
        <span className="visualizer-material-card__brand">{material.manufacturer}</span>
        <strong>{material.name}</strong>
        <span>{material.collection}</span>
      </span>
    </button>
  );
}

function BathroomRender({ wallMaterial, floorMaterial }: { wallMaterial: TileMaterial | undefined; floorMaterial: TileMaterial | undefined }) {
  const wallPatternId = `wall-${wallMaterial?.id ?? "default"}`;
  const floorPatternId = `floor-${floorMaterial?.id ?? "default"}`;
  return (
    <svg className="visualizer-render-scene" viewBox="0 0 1000 700" role="img" aria-label="Интерактивный рендер ванной комнаты">
      <defs>
        <linearGradient id="render-light" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#f7eee0" />
          <stop offset="1" stopColor="#b89979" />
        </linearGradient>
        <linearGradient id="render-tub" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#faf6ed" />
          <stop offset="1" stopColor="#b9a790" />
        </linearGradient>
        <pattern id={wallPatternId} width="210" height="150" patternUnits="userSpaceOnUse">
          <image href={wallMaterial?.textureUrl ?? bathroomImage} width="210" height="150" preserveAspectRatio="xMidYMid slice" />
          <path d="M0 149.5H210" stroke="#fff8ed" strokeOpacity=".32" strokeWidth="2" />
        </pattern>
        <pattern id={floorPatternId} width="190" height="120" patternUnits="userSpaceOnUse" patternTransform="skewX(-12)">
          <image href={floorMaterial?.textureUrl ?? bathroomImage} width="190" height="120" preserveAspectRatio="xMidYMid slice" />
          <path d="M0 119.5H190" stroke="#fff8ed" strokeOpacity=".24" strokeWidth="2" />
        </pattern>
        <filter id="render-shadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="16" stdDeviation="18" floodColor="#241d14" floodOpacity=".24" />
        </filter>
      </defs>
      <rect width="1000" height="700" fill="url(#render-light)" />
      <polygon points="0,0 1000,0 1000,485 0,445" fill={`url(#${wallPatternId})`} />
      <polygon points="0,445 1000,485 1000,700 0,700" fill={`url(#${floorPatternId})`} />
      <polygon points="0,0 125,44 125,455 0,445" fill="#5b4636" fillOpacity=".68" />
      <rect x="0" y="0" width="1000" height="22" fill="#241d14" fillOpacity=".8" />
      <path d="M125 44V455M205 60V468M920 46V482" stroke="#241d14" strokeOpacity=".72" strokeWidth="8" />
      <rect x="18" y="135" width="176" height="318" rx="3" fill="#e6d8c8" fillOpacity=".2" stroke="#241d14" strokeOpacity=".7" strokeWidth="5" />
      <path d="M50 168H162M50 168V420M162 168V420" fill="none" stroke="#241d14" strokeOpacity=".65" strokeWidth="4" />
      <path d="M52 185H160" stroke="#f8ead9" strokeOpacity=".62" strokeWidth="3" />
      <path d="M70 190V305M143 190V305" stroke="#c98a12" strokeWidth="5" strokeLinecap="round" />
      <circle cx="70" cy="320" r="13" fill="#c98a12" />
      <circle cx="143" cy="320" r="13" fill="#c98a12" />
      <g filter="url(#render-shadow)">
        <path d="M230 490C256 457 313 440 383 440H802C871 440 930 458 950 490V566C923 602 860 620 789 620H382C306 620 256 602 230 566Z" fill="url(#render-tub)" />
        <ellipse cx="590" cy="475" rx="348" ry="46" fill="#f9f4eb" />
        <ellipse cx="590" cy="480" rx="307" ry="29" fill="#b8a792" fillOpacity=".43" />
      </g>
      <rect x="420" y="260" width="296" height="112" rx="3" fill="#241d14" fillOpacity=".78" />
      <rect x="434" y="274" width="268" height="84" fill="#b9c5ba" fillOpacity=".28" />
      <path d="M450 300C485 272 500 337 540 307C575 281 596 335 629 301C666 262 677 331 696 306" fill="none" stroke="#c98a12" strokeOpacity=".66" strokeWidth="5" />
      <rect x="760" y="270" width="174" height="118" rx="2" fill="#987b60" filter="url(#render-shadow)" />
      <rect x="780" y="288" width="134" height="59" fill="#d7cbbb" />
      <ellipse cx="847" cy="340" rx="56" ry="17" fill="#f6f0e5" />
      <path d="M847 337V294C847 275 872 275 872 294V300" fill="none" stroke="#c98a12" strokeWidth="7" strokeLinecap="round" />
      <path d="M810 254C810 226 843 226 843 254V274" fill="none" stroke="#c98a12" strokeWidth="7" strokeLinecap="round" />
      <g fill="#6f7e58" fillOpacity=".86">
        <ellipse cx="892" cy="205" rx="24" ry="58" transform="rotate(35 892 205)" />
        <ellipse cx="930" cy="180" rx="18" ry="49" transform="rotate(68 930 180)" />
        <ellipse cx="868" cy="175" rx="17" ry="45" transform="rotate(-28 868 175)" />
      </g>
      <path d="M892 286C894 250 902 209 919 161" stroke="#536345" strokeWidth="6" fill="none" />
      <text x="34" y="654" fill="#fbf8f3" fontSize="13" fontFamily="Montserrat, sans-serif" letterSpacing="2">ФОРУМ · VISUALIZER MVP</text>
    </svg>
  );
}

export function VisualizerPage() {
  const [query, setQuery] = useState("");
  const [manufacturer, setManufacturer] = useState("Все производители");
  const [zone, setZone] = useState<MaterialZone>("wall");
  const [selectedId, setSelectedId] = useState(tileMaterials[0].id);
  const [appliedByZone, setAppliedByZone] = useState<Record<MaterialZone, string>>({ wall: tileMaterials[0].id, floor: tileMaterials[3].id });

  const selectedMaterial = tileMaterials.find((material) => material.id === selectedId) ?? tileMaterials[0];
  const appliedWall = tileMaterials.find((material) => material.id === appliedByZone.wall);
  const appliedFloor = tileMaterials.find((material) => material.id === appliedByZone.floor);
  const normalizedQuery = query.trim().toLocaleLowerCase("ru-RU");
  const filteredMaterials = useMemo(() => tileMaterials.filter((material) => {
    const matchesManufacturer = manufacturer === "Все производители" || material.manufacturer === manufacturer;
    const haystack = [material.manufacturer, material.collection, material.name, material.format, material.color, ...material.tags].join(" ").toLocaleLowerCase("ru-RU");
    return matchesManufacturer && (!normalizedQuery || haystack.includes(normalizedQuery));
  }), [manufacturer, normalizedQuery]);

  const applyMaterial = () => setAppliedByZone((current) => ({ ...current, [zone]: selectedMaterial.id }));

  return (
    <div className="visualizer-page site-editorial font-body bg-[#FBF8F3] text-[#241D14]">
      <SiteHeader />
      <main>
        <section className="visualizer-hero">
          <div className="visualizer-hero__heading">
            <div>
              <p className="visualizer-eyebrow"><span /> Ванная · плитка</p>
              <h1 className="font-display">Визуализатор<span>.</span></h1>
            </div>
            <p>Выбирайте реальные материалы производителей и сразу примеряйте их на интерьер.</p>
          </div>
        </section>

        <section className="visualizer-workspace" aria-label="Визуализатор плитки">
          <div className="visualizer-render-column">
            <div className="visualizer-render-toolbar">
              <div>
                <span className="visualizer-toolbar-label">Текущий рендер</span>
                <strong>Ванная комната · тёплый камень</strong>
              </div>
              <span className="visualizer-render-status"><span /> Живая примерка</span>
            </div>
            <div className="visualizer-render">
              <BathroomRender wallMaterial={appliedWall} floorMaterial={appliedFloor} />
              <div className="visualizer-render-note">{zone === "wall" ? "Стена" : "Пол"} · {selectedMaterial.name}</div>
            </div>
            <div className="visualizer-render-legend">
              <button type="button" className={zone === "wall" ? "is-active" : ""} onClick={() => setZone("wall")}>Стены</button>
              <button type="button" className={zone === "floor" ? "is-active" : ""} onClick={() => setZone("floor")}>Пол</button>
              <span>Нажмите на материал справа, чтобы выбрать его</span>
            </div>
          </div>

          <aside className="visualizer-catalog" aria-label="Каталог материалов">
            <div className="visualizer-catalog__intro">
              <div>
                <span className="visualizer-toolbar-label">Каталог материалов</span>
                <h2 className="font-display">Плитка</h2>
              </div>
              <SlidersHorizontal size={19} strokeWidth={1.3} />
            </div>
            <div className="visualizer-filters">
              <label className="visualizer-search">
                <Search size={15} strokeWidth={1.5} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти коллекцию или цвет" aria-label="Поиск материалов" />
              </label>
              <label className="visualizer-select">
                <span>Производитель</span>
                <select value={manufacturer} onChange={(event) => setManufacturer(event.target.value)}>
                  {materialManufacturers.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
            </div>
            <div className="visualizer-catalog__count">{filteredMaterials.length} материалов · из официальных каталогов</div>
            <div className="visualizer-materials-grid">
              {filteredMaterials.map((material) => <MaterialCard key={material.id} material={material} selected={material.id === selectedId} onSelect={() => setSelectedId(material.id)} />)}
            </div>
            {filteredMaterials.length === 0 && <p className="visualizer-empty">Ничего не найдено. Измените запрос или производителя.</p>}
            <div className="visualizer-selected">
              <div className="visualizer-selected__heading">
                <span className="visualizer-toolbar-label">Выбрано</span>
                <span>{zone === "wall" ? "Стены" : "Пол"}</span>
              </div>
              <div className="visualizer-selected__material">
                <img src={selectedMaterial.textureUrl} alt="" />
                <div>
                  <strong>{selectedMaterial.name}</strong>
                  <span>{selectedMaterial.manufacturer} · {selectedMaterial.collection}</span>
                  <span>{selectedMaterial.format} · {selectedMaterial.finish}</span>
                </div>
              </div>
              <div className="visualizer-selected__actions">
                <button type="button" className="visualizer-apply" onClick={applyMaterial}>Применить к рендеру <Check size={15} strokeWidth={1.6} /></button>
                <a className="visualizer-download" href={selectedMaterial.downloadUrl} target="_blank" rel="noreferrer" download><Download size={15} strokeWidth={1.5} /> Скачать исходник</a>
              </div>
              <a className="visualizer-source" href={selectedMaterial.sourceUrl} target="_blank" rel="noreferrer">{selectedMaterial.sourceLabel} <ExternalLink size={13} strokeWidth={1.5} /></a>
            </div>
          </aside>
        </section>

      </main>
      <footer className="events-footer">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <span>© {new Date().getFullYear()} {brand.name} — интерьерный бутик</span>
          <a href={brand.phoneHref}>{brand.phone}</a>
        </div>
      </footer>
    </div>
  );
}
