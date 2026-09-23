import { useMemo, useState } from "react";
import { ArrowUpRight, Check, Download, ExternalLink, Search, SlidersHorizontal } from "lucide-react";
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

function RenderSurface({ material, zone }: { material: TileMaterial | undefined; zone: MaterialZone }) {
  if (!material) return null;
  return <div className={`visualizer-render-surface visualizer-render-surface--${zone}`} style={{ backgroundImage: `url(${material.textureUrl})` }} aria-label={`${material.name} на поверхности ${zone === "wall" ? "стен" : "пола"}`} />;
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
              <img src={bathroomImage} alt="Рендер современной ванной комнаты" />
              <RenderSurface material={appliedWall} zone="wall" />
              <RenderSurface material={appliedFloor} zone="floor" />
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

        <section className="visualizer-next max-w-[1400px] mx-auto px-6 md:px-12">
          <div>
            <p className="visualizer-eyebrow"><span /> Следующий шаг</p>
            <h2 className="font-display">Сантехника, свет<br />и детали — дальше.</h2>
          </div>
          <a href="#contacts" className="visualizer-next__link">Обсудить проект <ArrowUpRight size={16} strokeWidth={1.4} /></a>
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
