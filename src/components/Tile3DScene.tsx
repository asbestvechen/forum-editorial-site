import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { getTileDimensions, type TileMaterial } from "@/lib/materials";

export type TileLighting = {
  intensity: number;
  temperature: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function configureTexture(texture: THREE.Texture, renderer: THREE.WebGLRenderer) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  // Keep the original vein detail at the scale used by the preview. The
  // surface is already rendered at a controlled size, so an early mip level
  // makes the material look softer than its catalog swatch.
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
}

function temperatureColor(temperature: number, coolHex: string, warmHex: string) {
  const neutral = new THREE.Color("#fffaf1");
  const endpoint = new THREE.Color(temperature < 0 ? coolHex : warmHex);
  return endpoint.lerp(neutral, 1 - Math.abs(temperature));
}

function applyStudioLighting(
  lighting: TileLighting,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  keyLight: THREE.DirectionalLight,
  reliefLight: THREE.DirectionalLight,
  fillLight: THREE.DirectionalLight,
  hemisphereLight: THREE.HemisphereLight,
) {
  const intensity = clamp(lighting.intensity, 0.15, 2.4);
  const temperature = clamp(lighting.temperature, -1, 1);

  // Direct and ambient components both follow the slider. Previously the
  // environment stayed fixed, which made the extremes look almost identical.
  keyLight.intensity = 3.15 * intensity;
  keyLight.color.copy(temperatureColor(temperature, "#8fc3ff", "#ffc487"));
  // A low side light skims across the surface so bump/displacement detail is
  // actually readable instead of being flattened by a frontal studio setup.
  reliefLight.intensity = 0.72 * intensity;
  reliefLight.color.copy(temperatureColor(temperature, "#a8d5ff", "#ffd09a"));
  fillLight.intensity = 0.86 * intensity;
  fillLight.color.copy(temperatureColor(temperature, "#a9d8ff", "#ffd7a4"));
  hemisphereLight.intensity = 0.48 * intensity;
  hemisphereLight.color.copy(temperatureColor(temperature, "#a9d5ff", "#ffe0b7"));
  hemisphereLight.groundColor.copy(temperatureColor(temperature, "#465e78", "#9a6745"));
  scene.environmentIntensity = 0.08 + intensity * 0.22;
  renderer.toneMappingExposure = 0.82 + intensity * 0.18;
}

function configureGeneratedTexture(texture: THREE.Texture, sourceTexture: THREE.Texture) {
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.repeat.copy(sourceTexture.repeat);
  texture.offset.copy(sourceTexture.offset);
  texture.needsUpdate = true;
}

function createSurfaceMaps(image: unknown, sourceTexture: THREE.Texture) {
  if (typeof document === "undefined") return null;

  const source = image as { width?: number; height?: number } & CanvasImageSource;
  const sourceWidth = Number(source.width);
  const sourceHeight = Number(source.height);
  if (!sourceWidth || !sourceHeight) return null;

  const scale = Math.min(1, 768 / sourceWidth);
  const width = Math.max(2, Math.round(sourceWidth * scale));
  const height = Math.max(2, Math.round(sourceHeight * scale));
  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = width;
  sourceCanvas.height = height;
  const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
  if (!sourceContext) return null;

  try {
    sourceContext.drawImage(source, 0, 0, width, height);
  } catch {
    return null;
  }

  let imageData: ImageData;
  try {
    imageData = sourceContext.getImageData(0, 0, width, height);
  } catch {
    return null;
  }

  const luminance = new Float32Array(width * height);
  for (let index = 0; index < luminance.length; index += 1) {
    const pixel = index * 4;
    luminance[index] = (imageData.data[pixel] * 0.2126) + (imageData.data[pixel + 1] * 0.7152) + (imageData.data[pixel + 2] * 0.0722);
  }

  const heightPixels = new Uint8ClampedArray(width * height * 4);
  const roughnessPixels = new Uint8ClampedArray(width * height * 4);
  const pixelAt = (x: number, y: number) => luminance[Math.min(height - 1, Math.max(0, y)) * width + Math.min(width - 1, Math.max(0, x))];
  const writePixel = (target: Uint8ClampedArray, offset: number, value: number) => {
    const channel = Math.max(0, Math.min(255, Math.round(value)));
    target[offset] = channel;
    target[offset + 1] = channel;
    target[offset + 2] = channel;
    target[offset + 3] = 255;
  };

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      const center = luminance[index];
      const left = pixelAt(x - 1, y);
      const right = pixelAt(x + 1, y);
      const up = pixelAt(x, y - 1);
      const down = pixelAt(x, y + 1);
      const localAverage = (left + right + up + down) / 4;
      const edgeStrength = Math.abs(left - right) + Math.abs(up - down);
      const heightValue = 128 + ((center - localAverage) * 1.7) + (edgeStrength * 0.72);
      const roughnessValue = 188 - ((center - 128) * 0.22) + (edgeStrength * 0.12);
      const offset = index * 4;
      writePixel(heightPixels, offset, heightValue);
      writePixel(roughnessPixels, offset, roughnessValue);
    }
  }

  const createMap = (pixels: Uint8ClampedArray) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return null;
    const mapData = context.createImageData(width, height);
    mapData.data.set(pixels);
    context.putImageData(mapData, 0, 0);
    const map = new THREE.CanvasTexture(canvas);
    configureGeneratedTexture(map, sourceTexture);
    return map;
  };

  const bumpMap = createMap(heightPixels);
  const roughnessMap = createMap(roughnessPixels);
  if (!bumpMap || !roughnessMap) {
    bumpMap?.dispose();
    roughnessMap?.dispose();
    return null;
  }
  return { bumpMap, roughnessMap };
}

function frameTexture(texture: THREE.Texture, surfaceWidth: number, surfaceHeight: number) {
  const image = texture.image as { width?: number; height?: number } | undefined;
  if (!image?.width || !image.height) return;

  const imageAspect = image.width / image.height;
  const surfaceAspect = surfaceWidth / surfaceHeight;
  texture.repeat.set(1, 1);
  texture.offset.set(0, 0);

  if (imageAspect > surfaceAspect) {
    const visibleWidth = surfaceAspect / imageAspect;
    texture.repeat.x = visibleWidth;
    texture.offset.x = (1 - visibleWidth) / 2;
  } else {
    const visibleHeight = imageAspect / surfaceAspect;
    texture.repeat.y = visibleHeight;
    texture.offset.y = (1 - visibleHeight) / 2;
  }
  texture.needsUpdate = true;
}

export function Tile3DScene({ material, lighting, showRuler = true }: { material: TileMaterial; lighting: TileLighting; showRuler?: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const lengthLabelRef = useRef<HTMLSpanElement>(null);
  const widthLabelRef = useRef<HTMLSpanElement>(null);
  const thicknessLabelRef = useRef<HTMLSpanElement>(null);
  const lightingRef = useRef(lighting);
  const [loading, setLoading] = useState(true);
  const dimensions = getTileDimensions(material);

  useEffect(() => {
    lightingRef.current = lighting;
  }, [lighting]);

  useEffect(() => {
    const root = mountRef.current;
    if (!root) return;

    setLoading(true);

    const scene = new THREE.Scene();
    const useDarkStudio = material.colorGroup === "Светлые" || material.color === "Белый";
    const studioPalette = useDarkStudio
      ? { background: "#292c2f", wall: "#3b3f43", floor: "#25282b", base: "#44494d", top: "#565b5f" }
      : { background: "#e7e0d8", wall: "#d9d1c8", floor: "#bdb2a7", base: "#a99c90", top: "#bdb1a5" };
    scene.background = new THREE.Color(studioPalette.background);

    // Use one shared scene scale for every material: 1 cm maps to 0.011 world
    // units. This keeps the physical difference between a 120 cm and a 278 cm
    // slab visible instead of normalizing every selection to the same length.
    // The camera target follows the model, while the controls still allow the
    // user to zoom into narrow formats such as 5 × 80 cm.
    const displayScale = 0.011;
    const tileWidth = dimensions.widthCm * displayScale;
    const tileHeight = dimensions.lengthCm * displayScale;
    const tileDepth = (dimensions.thicknessMm / 10) * displayScale;
    const tileBaseY = 0.57;
    const tileCenterY = tileBaseY + tileHeight / 2;
    const surfaceInset = Math.min(0.024, Math.min(tileWidth, tileHeight) * 0.08);
    const cornerRadius = Math.min(tileWidth, tileHeight, tileDepth) * 0.34;

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(5.05, tileCenterY + 2.35, 7.65);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.AgXToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    root.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = new RoomEnvironment();
    scene.environment = pmrem.fromScene(environment).texture;
    scene.environmentIntensity = 0.3;
    environment.dispose();
    pmrem.dispose();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, tileCenterY, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    // Keep a generous close-up range: the shared physical scale makes narrow
    // formats much smaller than the large slabs, so the surface must remain
    // inspectable all the way down to a near-detail view.
    controls.minDistance = 0.72;
    controls.maxDistance = 12.5;
    controls.minPolarAngle = Math.PI * 0.22;
    controls.maxPolarAngle = Math.PI * 0.46;
    controls.update();

    const blockPageWheel = (event: WheelEvent) => event.preventDefault();
    root.addEventListener("wheel", blockPageWheel, { passive: false });

    const keyLight = new THREE.DirectionalLight("#fff8ed", 2.8);
    keyLight.position.set(-3.8, 7.5, 5.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 6;
    keyLight.shadow.camera.bottom = -3;
    keyLight.shadow.bias = -0.0002;
    scene.add(keyLight);

    const reliefLight = new THREE.DirectionalLight("#d6e9ff", 0.72);
    reliefLight.position.set(-4.8, 2.4, 3.6);
    scene.add(reliefLight);

    const fillLight = new THREE.DirectionalLight("#dce9f1", 0.78);
    fillLight.position.set(4.5, 3.5, -4.5);
    scene.add(fillLight);
    const hemisphereLight = new THREE.HemisphereLight("#fffaf2", "#76675a", 0.42);
    scene.add(hemisphereLight);
    applyStudioLighting(lightingRef.current, scene, renderer, keyLight, reliefLight, fillLight, hemisphereLight);

    const floorMaterial = new THREE.MeshStandardMaterial({ color: studioPalette.floor, roughness: 0.9 });
    const studioFloor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), floorMaterial);
    studioFloor.rotation.x = -Math.PI / 2;
    studioFloor.position.y = -0.02;
    studioFloor.receiveShadow = true;
    scene.add(studioFloor);

    const wallMaterial = new THREE.MeshStandardMaterial({ color: studioPalette.wall, roughness: 0.94 });
    const studioWall = new THREE.Mesh(new THREE.PlaneGeometry(16, 10), wallMaterial);
    studioWall.position.set(0, 4.5, -4.6);
    studioWall.receiveShadow = true;
    scene.add(studioWall);

    const baseMaterial = new THREE.MeshStandardMaterial({ color: studioPalette.base, roughness: 0.7 });
    const base = new THREE.Mesh(new RoundedBoxGeometry(4.25, 0.4, 2.25, 8, 0.08), baseMaterial);
    base.position.y = 0.2;
    base.castShadow = true;
    base.receiveShadow = true;
    scene.add(base);

    const topMaterial = new THREE.MeshStandardMaterial({ color: studioPalette.top, roughness: 0.6 });
    const top = new THREE.Mesh(new RoundedBoxGeometry(3.85, 0.16, 1.88, 8, 0.04), topMaterial);
    top.position.y = 0.48;
    top.castShadow = true;
    top.receiveShadow = true;
    scene.add(top);

    const tile = new THREE.Group();
    tile.position.set(0, tileCenterY, -0.03);
    tile.rotation.x = -0.045;
    tile.rotation.y = 0.02;

    const bodyMaterial = new THREE.MeshStandardMaterial({ color: "#81756a", roughness: 0.55, metalness: 0.01 });
    const body = new THREE.Mesh(new RoundedBoxGeometry(tileWidth, tileHeight, tileDepth, 10, cornerRadius), bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    tile.add(body);

    const surfaceMaterial = new THREE.MeshPhysicalMaterial({
      // Keep the catalog image as the albedo. A warm base color here makes
      // cool stones render beige and breaks the swatch-to-render comparison.
      color: "#ffffff",
      roughness: material.finish.toLowerCase().includes("gloss") ? 0.33 : 0.58,
      metalness: 0.01,
      clearcoat: material.finish.toLowerCase().includes("gloss") ? 0.3 : 0.12,
      clearcoatRoughness: 0.16,
      specularIntensity: material.finish.toLowerCase().includes("gloss") ? 0.48 : 0.3,
      side: THREE.DoubleSide,
    });
    const surface = new THREE.Mesh(new THREE.PlaneGeometry(Math.max(0.012, tileWidth - surfaceInset), Math.max(0.012, tileHeight - surfaceInset), 64, 96), surfaceMaterial);
    surface.position.z = tileDepth / 2 + Math.max(0.0015, tileDepth * 0.35);
    surface.castShadow = true;
    surface.receiveShadow = true;
    tile.add(surface);

    const edgeMaterial = new THREE.LineBasicMaterial({ color: "#f4eee6", transparent: true, opacity: 0.6 });
    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(new RoundedBoxGeometry(tileWidth, tileHeight, tileDepth, 10, cornerRadius)),
      edgeMaterial,
    );
    edge.position.z = Math.max(0.0015, tileDepth * 0.25);
    tile.add(edge);

    const rulerGroup = new THREE.Group();
    rulerGroup.visible = showRuler;
    rulerGroup.renderOrder = 10;
    const rulerGap = Math.max(0.08, Math.min(0.18, tileWidth * 0.22));
    const rulerFrontZ = tileDepth / 2 + Math.max(0.018, tileDepth * 1.6);
    const rulerPoints: number[] = [];
    const addRulerSegment = (start: THREE.Vector3, end: THREE.Vector3) => {
      rulerPoints.push(start.x, start.y, start.z, end.x, end.y, end.z);
    };
    const verticalX = -tileWidth / 2 - rulerGap;
    addRulerSegment(new THREE.Vector3(verticalX, -tileHeight / 2, rulerFrontZ), new THREE.Vector3(verticalX, tileHeight / 2, rulerFrontZ));
    addRulerSegment(new THREE.Vector3(verticalX - 0.06, -tileHeight / 2, rulerFrontZ), new THREE.Vector3(verticalX + 0.06, -tileHeight / 2, rulerFrontZ));
    addRulerSegment(new THREE.Vector3(verticalX - 0.06, tileHeight / 2, rulerFrontZ), new THREE.Vector3(verticalX + 0.06, tileHeight / 2, rulerFrontZ));
    const horizontalY = tileHeight / 2 + rulerGap;
    addRulerSegment(new THREE.Vector3(-tileWidth / 2, horizontalY, rulerFrontZ), new THREE.Vector3(tileWidth / 2, horizontalY, rulerFrontZ));
    addRulerSegment(new THREE.Vector3(-tileWidth / 2, horizontalY - 0.06, rulerFrontZ), new THREE.Vector3(-tileWidth / 2, horizontalY + 0.06, rulerFrontZ));
    addRulerSegment(new THREE.Vector3(tileWidth / 2, horizontalY - 0.06, rulerFrontZ), new THREE.Vector3(tileWidth / 2, horizontalY + 0.06, rulerFrontZ));
    const thicknessX = tileWidth / 2 + rulerGap;
    addRulerSegment(new THREE.Vector3(thicknessX, 0, -tileDepth / 2), new THREE.Vector3(thicknessX, 0, tileDepth / 2));
    const rulerGeometry = new THREE.BufferGeometry();
    rulerGeometry.setAttribute("position", new THREE.Float32BufferAttribute(rulerPoints, 3));
    const rulerMaterial = new THREE.LineBasicMaterial({ color: "#d59700", depthTest: false, transparent: true, opacity: 0.9 });
    const rulerLines = new THREE.LineSegments(rulerGeometry, rulerMaterial);
    rulerLines.renderOrder = 10;
    rulerGroup.add(rulerLines);
    tile.add(rulerGroup);
    scene.add(tile);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
    let loadedTexture: THREE.Texture | null = null;
    const generatedTextures: THREE.Texture[] = [];
    let cancelled = false;
    textureLoader.load(material.textureUrl, (texture) => {
      if (cancelled) {
        texture.dispose();
        return;
      }
      loadedTexture = texture;
      configureTexture(texture, renderer);
      frameTexture(texture, tileWidth - 0.1, tileHeight - 0.1);
      surfaceMaterial.map = texture;
      const maps = createSurfaceMaps(texture.image, texture);
      if (maps) {
        generatedTextures.push(maps.bumpMap, maps.roughnessMap);
        surfaceMaterial.bumpMap = maps.bumpMap;
        surfaceMaterial.bumpScale = material.finish.toLowerCase().includes("gloss") ? 0.018 : 0.036;
        surfaceMaterial.displacementMap = maps.bumpMap;
        const requestedDisplacement = material.finish.toLowerCase().includes("gloss") ? 0.006 : 0.012;
        surfaceMaterial.displacementScale = Math.min(requestedDisplacement, tileDepth * 0.18);
        surfaceMaterial.displacementBias = -surfaceMaterial.displacementScale / 2;
        surfaceMaterial.roughnessMap = maps.roughnessMap;
      }
      surfaceMaterial.needsUpdate = true;
      setLoading(false);
    }, undefined, () => setLoading(false));

    const resize = () => {
      const bounds = root.getBoundingClientRect();
      const width = Math.max(1, bounds.width);
      const height = Math.max(1, bounds.height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);

    let animationFrame = 0;
    let appliedIntensity = Number.NaN;
    let appliedTemperature = Number.NaN;
    const syncLighting = () => {
      const next = lightingRef.current;
      if (next.intensity === appliedIntensity && next.temperature === appliedTemperature) return;
      applyStudioLighting(next, scene, renderer, keyLight, reliefLight, fillLight, hemisphereLight);
      appliedIntensity = next.intensity;
      appliedTemperature = next.temperature;
    };

    const updateRulerLabels = () => {
      if (!showRuler || !renderer.domElement.clientWidth || !renderer.domElement.clientHeight) return;
      const projectLabel = (localPoint: THREE.Vector3, label: HTMLSpanElement | null, anchor: "left" | "above" | "right") => {
        if (!label) return;
        const projected = tile.localToWorld(localPoint.clone()).project(camera);
        const visible = projected.z > -1 && projected.z < 1;
        const x = (projected.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
        const y = (-projected.y * 0.5 + 0.5) * renderer.domElement.clientHeight;
        const anchorTransform = anchor === "left" ? "translate(-100%, -50%)" : anchor === "above" ? "translate(-50%, -100%)" : "translate(0, -50%)";
        label.style.transform = `translate(${x}px, ${y}px) ${anchorTransform}`;
        label.style.opacity = visible ? "1" : "0";
      };
      projectLabel(new THREE.Vector3(verticalX, 0, rulerFrontZ), lengthLabelRef.current, "left");
      projectLabel(new THREE.Vector3(0, horizontalY, rulerFrontZ), widthLabelRef.current, "above");
      projectLabel(new THREE.Vector3(thicknessX, 0, 0), thicknessLabelRef.current, "right");
    };

    const animate = () => {
      syncLighting();
      controls.update();
      updateRulerLabels();
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      root.removeEventListener("wheel", blockPageWheel);
      controls.dispose();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
        materials.forEach((item) => item.dispose());
      });
      loadedTexture?.dispose();
      generatedTextures.forEach((texture) => texture.dispose());
      renderer.dispose();
      root.removeChild(renderer.domElement);
    };
  }, [dimensions.lengthCm, dimensions.thicknessMm, dimensions.widthCm, material.color, material.colorGroup, material.finish, material.id, material.textureUrl, showRuler]);

  return (
    <div className="visualizer-render-scene-shell">
      <div ref={mountRef} className="visualizer-render-scene" data-lenis-prevent="true" aria-label={`3D-модель плитки ${material.name}`} />
      {loading && <div className="visualizer-render-loading">Подготовка материала…</div>}
      <span className="visualizer-render-hint">Поверните модель мышью</span>
      {showRuler && (
        <div className="visualizer-dimension-ruler" aria-label={`Размер плитки: ширина ${dimensions.widthCm} сантиметров, длина ${dimensions.lengthCm} сантиметров, толщина ${dimensions.thicknessMm} миллиметров`}>
          <span ref={lengthLabelRef} className="visualizer-dimension-ruler__vertical">Длина {dimensions.lengthCm} см</span>
          <span ref={widthLabelRef} className="visualizer-dimension-ruler__horizontal">Ширина {dimensions.widthCm} см</span>
          <span ref={thicknessLabelRef} className="visualizer-dimension-ruler__thickness">Толщина {dimensions.thicknessMm.toLocaleString("ru-RU")} мм</span>
        </div>
      )}
    </div>
  );
}
