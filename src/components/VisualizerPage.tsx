import { useMemo, useState } from "react";
import { Check, Download, ExternalLink, Search, SlidersHorizontal } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Tile3DScene } from "@/components/Tile3DScene";
import { brand } from "@/lib/brand";
import { materialColorGroups, materialManufacturers, tileMaterials, type TileMaterial } from "@/lib/materials";

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
        <span>{material.colorGroup} · {material.collection}</span>
      </span>
    </button>
  );
}

export function VisualizerPage() {
  const [query, setQuery] = useState("");
  const [manufacturer, setManufacturer] = useState("Все производители");
  const [colorGroup, setColorGroup] = useState("Все цвета");
  const [selectedId, setSelectedId] = useState(tileMaterials[0].id);
  const [renderedId, setRenderedId] = useState(tileMaterials[0].id);

  const selectedMaterial = tileMaterials.find((material) => material.id === selectedId) ?? tileMaterials[0];
  const renderedMaterial = tileMaterials.find((material) => material.id === renderedId) ?? tileMaterials[0];
  const normalizedQuery = query.trim().toLocaleLowerCase("ru-RU");
  const filteredMaterials = useMemo(() => tileMaterials.filter((material) => {
    const matchesManufacturer = manufacturer === "Все производители" || material.manufacturer === manufacturer;
    const matchesColor = colorGroup === "Все цвета" || material.colorGroup === colorGroup;
    const haystack = [material.manufacturer, material.collection, material.name, material.format, material.color, ...material.tags].join(" ").toLocaleLowerCase("ru-RU");
    return matchesManufacturer && matchesColor && (!normalizedQuery || haystack.includes(normalizedQuery));
  }), [colorGroup, manufacturer, normalizedQuery]);

  const applyMaterial = () => setRenderedId(selectedMaterial.id);

  return (
    <div className="visualizer-page site-editorial font-body bg-[#FBF8F3] text-[#241D14]">
      <SiteHeader />
      <main>
        <section className="visualizer-workspace" aria-label="Визуализатор плитки">
          <div className="visualizer-render-column">
            <div className="visualizer-render-toolbar">
              <div>
                <span className="visualizer-toolbar-label">Текущий рендер</span>
                 <strong>Плитка · предметный рендер</strong>
              </div>
              <span className="visualizer-render-status"><span /> Живая примерка</span>
            </div>
            <div className="visualizer-render">
               <Tile3DScene material={renderedMaterial} />
               <div className="visualizer-render-note">3D-модель плитки · {renderedMaterial.name}</div>
            </div>
            <div className="visualizer-render-legend">
              <span className="visualizer-render-legend__tag">Плитка</span>
              <span>Вращайте модель мышью или пальцем</span>
            </div>
          </div>

          <aside className="visualizer-catalog" aria-label="Каталог материалов">
            <div className="visualizer-catalog__intro">
              <div>
                <span className="visualizer-toolbar-label">Каталог материалов</span>
                <h2 className="font-display">Визуализатор</h2>
                 <p className="visualizer-breadcrumb"><span>Материалы</span><i>/</i>Плитка</p>
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
              <label className="visualizer-select">
                <span>Цвет</span>
                <select value={colorGroup} onChange={(event) => setColorGroup(event.target.value)}>
                  {materialColorGroups.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
            </div>
             <div className="visualizer-catalog__count">{filteredMaterials.length} материалов · официальные каталоги производителей</div>
            <div className="visualizer-materials-grid">
              {filteredMaterials.map((material) => <MaterialCard key={material.id} material={material} selected={material.id === selectedId} onSelect={() => setSelectedId(material.id)} />)}
            </div>
            {filteredMaterials.length === 0 && <p className="visualizer-empty">Ничего не найдено. Измените запрос, цвет или производителя.</p>}
            <div className="visualizer-selected">
              <div className="visualizer-selected__heading">
                <span className="visualizer-toolbar-label">Выбрано</span>
                 <span>{renderedMaterial.id === selectedMaterial.id ? "На рендере" : "Готово к применению"}</span>
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
               {selectedMaterial.sourceUrl ? <a className="visualizer-source" href={selectedMaterial.sourceUrl} target="_blank" rel="noreferrer">{selectedMaterial.sourceLabel} <ExternalLink size={13} strokeWidth={1.5} /></a> : <span className="visualizer-source visualizer-source--static">{selectedMaterial.sourceLabel}</span>}
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
