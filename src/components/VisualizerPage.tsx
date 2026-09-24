import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Download, ExternalLink, Search, SlidersHorizontal } from "lucide-react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { SiteHeader } from "@/components/SiteHeader";
import { Bathroom3DScene } from "@/components/Bathroom3DScene";
import { brand } from "@/lib/brand";
import { materialManufacturers, tileMaterials, type MaterialZone, type TileMaterial } from "@/lib/materials";

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

function makeFallbackTexture(color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = color;
    context.fillRect(0, 0, 256, 256);
    context.strokeStyle = "rgba(255,248,237,.38)";
    context.lineWidth = 2;
    for (let x = 0; x <= 256; x += 64) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, 256);
      context.stroke();
    }
    for (let y = 0; y <= 256; y += 64) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(256, y);
      context.stroke();
    }
  }
  return new THREE.CanvasTexture(canvas);
}

// Legacy inline-scene fallback retained only as source reference during the GLTF migration.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function BathroomRender({ wallMaterial, floorMaterial }: { wallMaterial: TileMaterial | undefined; floorMaterial: TileMaterial | undefined }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = mountRef.current;
    if (!root) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#b9a994");
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(6.8, 4.2, 7.5);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    root.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = new RoomEnvironment();
    scene.environment = pmrem.fromScene(environment).texture;
    environment.dispose();
    pmrem.dispose();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.35, -0.7);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 4.8;
    controls.maxDistance = 11;
    controls.minPolarAngle = Math.PI * 0.24;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.update();

    scene.add(new THREE.HemisphereLight("#fff4df", "#6a5849", 1.8));
    const keyLight = new THREE.DirectionalLight("#fff3dc", 4.2);
    keyLight.position.set(-3, 7, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    scene.add(keyLight);
    const warmLight = new THREE.PointLight("#edb875", 3.2, 7, 2);
    warmLight.position.set(2.8, 3.1, -2.8);
    scene.add(warmLight);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
    const ownedTextures: THREE.Texture[] = [];
    const makeTileMaterial = (material: TileMaterial | undefined, fallbackColor: string, repeat: [number, number]) => {
      const fallback = makeFallbackTexture(fallbackColor);
      fallback.wrapS = THREE.RepeatWrapping;
      fallback.wrapT = THREE.RepeatWrapping;
      fallback.repeat.set(...repeat);
      ownedTextures.push(fallback);
      const meshMaterial = new THREE.MeshStandardMaterial({ map: fallback, roughness: 0.64, metalness: 0.02 });
      if (material) {
        textureLoader.load(material.textureUrl, (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(...repeat);
          texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
          meshMaterial.map = texture;
          meshMaterial.needsUpdate = true;
          ownedTextures.push(texture);
        });
      }
      return meshMaterial;
    };

    const wallTile = makeTileMaterial(wallMaterial, "#c5b09a", [2.4, 1.7]);
    const floorTile = makeTileMaterial(floorMaterial, "#90765d", [4.4, 3.2]);
    const stone = new THREE.MeshPhysicalMaterial({ color: "#e8dfd1", roughness: 0.42, clearcoat: 0.18 });
    const darkStone = new THREE.MeshStandardMaterial({ color: "#4d3d32", roughness: 0.46 });
    const brass = new THREE.MeshPhysicalMaterial({ color: "#c98a12", metalness: 0.82, roughness: 0.22 });
    const glass = new THREE.MeshPhysicalMaterial({ color: "#d9e5df", transmission: 0.72, opacity: 0.36, transparent: true, roughness: 0.08, thickness: 0.02 });

    const addMesh = (geometry: THREE.BufferGeometry, material: THREE.Material, position: [number, number, number], cast = true) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      mesh.castShadow = cast;
      mesh.receiveShadow = true;
      scene.add(mesh);
      return mesh;
    };
    addMesh(new THREE.PlaneGeometry(11, 8), floorTile, [0, 0, -0.4]).rotation.x = -Math.PI / 2;
    addMesh(new THREE.PlaneGeometry(11, 6), wallTile, [0, 3, -3.7], false);
    const sideWall = addMesh(new THREE.PlaneGeometry(8, 6), wallTile, [-5.5, 3, 0], false);
    sideWall.rotation.y = Math.PI / 2;
    addMesh(new THREE.BoxGeometry(11.2, 0.22, 0.18), darkStone, [0, 0.12, -3.58]);

    addMesh(new RoundedBoxGeometry(4.4, 1.15, 1.85, 8, 0.18), stone, [0, 0.76, -1.1]);
    const water = addMesh(new THREE.CylinderGeometry(1.62, 1.62, 0.025, 64), new THREE.MeshPhysicalMaterial({ color: "#b6c9c0", transmission: 0.38, roughness: 0.12, transparent: true, opacity: 0.88 }), [0, 1.29, -1.1], false);
    water.scale.z = 0.52;
    const tubRim = addMesh(new THREE.TorusGeometry(1.72, 0.045, 12, 64), stone, [0, 1.3, -1.1], false);
    tubRim.scale.z = 0.54;
    addMesh(new THREE.BoxGeometry(2.2, 0.12, 0.12), brass, [-2.9, 2.1, -2.5]);
    const glassWall = addMesh(new THREE.BoxGeometry(0.06, 2.7, 2.3), glass, [-3.7, 1.4, -1.6], false);
    glassWall.castShadow = false;
    addMesh(new THREE.BoxGeometry(0.12, 2.9, 0.12), brass, [-3.72, 1.45, -2.75]);
    addMesh(new THREE.BoxGeometry(0.12, 2.9, 0.12), brass, [-3.72, 1.45, -0.45]);

    addMesh(new THREE.BoxGeometry(1.9, 1.2, 0.62), darkStone, [3.0, 1.0, -3.2]);
    addMesh(new THREE.BoxGeometry(1.65, 0.07, 0.78), stone, [3.0, 1.63, -3.2]);
    addMesh(new THREE.CylinderGeometry(0.52, 0.52, 0.08, 48), stone, [3.0, 1.69, -3.18]);
    addMesh(new THREE.BoxGeometry(1.75, 1.3, 0.07), new THREE.MeshStandardMaterial({ color: "#8b8378", metalness: 0.12, roughness: 0.18 }), [3.0, 2.95, -3.57], false);
    addMesh(new THREE.TorusGeometry(0.16, 0.03, 8, 32), brass, [3.0, 2.95, -3.49], false);
    addMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.48, 12), brass, [3.0, 1.95, -3.18]);
    addMesh(new THREE.TorusGeometry(0.12, 0.025, 8, 24, Math.PI), brass, [3.0, 2.2, -3.18]);

    const shelf = addMesh(new THREE.BoxGeometry(2.2, 0.08, 0.35), darkStone, [0.9, 3.6, -3.5]);
    shelf.castShadow = false;
    addMesh(new THREE.BoxGeometry(0.08, 0.75, 0.08), brass, [0.05, 3.2, -3.5]);
    addMesh(new THREE.BoxGeometry(0.08, 0.75, 0.08), brass, [1.75, 3.2, -3.5]);

    const plantPot = addMesh(new THREE.CylinderGeometry(0.4, 0.5, 0.7, 32), darkStone, [4.2, 0.36, -1.6]);
    plantPot.scale.z = 0.72;
    for (let index = 0; index < 6; index += 1) {
      const stem = addMesh(new THREE.CylinderGeometry(0.018, 0.018, 1.5, 8), new THREE.MeshStandardMaterial({ color: "#546346" }), [4.1 + (index % 3) * 0.18, 1.25 + (index % 2) * 0.25, -1.6], false);
      stem.rotation.z = (index - 2) * 0.13;
      const leaf = addMesh(new THREE.SphereGeometry(0.18, 12, 8), new THREE.MeshStandardMaterial({ color: index % 2 ? "#788b68" : "#5e7456", roughness: 0.8 }), [4.1 + (index % 3) * 0.2, 1.9 + (index % 2) * 0.22, -1.6], false);
      leaf.scale.set(0.7, 1.5, 0.28);
      leaf.rotation.z = index * 0.35;
    }

    const resize = () => {
      const bounds = root.getBoundingClientRect();
      const width = Math.max(1, bounds.width);
      const height = Math.max(1, bounds.height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    let animationFrame = 0;
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      observer.disconnect();
      controls.dispose();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
        materials.forEach((material) => material.dispose());
      });
      ownedTextures.forEach((texture) => texture.dispose());
      renderer.dispose();
      root.removeChild(renderer.domElement);
    };
  }, [floorMaterial, wallMaterial]);

  return <div ref={mountRef} className="visualizer-render-scene" aria-label="Реальный 3D-рэндер ванной комнаты" />;
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
              <Bathroom3DScene wallMaterial={appliedWall} floorMaterial={appliedFloor} />
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
                <h2 className="font-display">Визуализатор</h2>
                <p className="visualizer-breadcrumb"><span>Ванная</span><i>/</i>Плитка</p>
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
