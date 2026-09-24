import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { TileMaterial } from "@/lib/materials";

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
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
}

function temperatureColor(temperature: number, coolHex: string, warmHex: string) {
  const neutral = new THREE.Color("#fffaf1");
  const endpoint = new THREE.Color(temperature < 0 ? coolHex : warmHex);
  return endpoint.lerp(neutral, 1 - Math.abs(temperature));
}

function applyStudioLighting(
  lighting: TileLighting,
  keyLight: THREE.DirectionalLight,
  fillLight: THREE.DirectionalLight,
  hemisphereLight: THREE.HemisphereLight,
) {
  const intensity = clamp(lighting.intensity, 0.45, 1.55);
  const temperature = clamp(lighting.temperature, -1, 1);

  keyLight.intensity = 2.8 * intensity;
  keyLight.color.copy(temperatureColor(temperature, "#c9e2ff", "#fff0d7"));
  fillLight.intensity = 0.78 * intensity;
  fillLight.color.copy(temperatureColor(temperature, "#d6edff", "#ffe6c1"));
  hemisphereLight.intensity = 0.42 * intensity;
  hemisphereLight.color.copy(temperatureColor(temperature, "#d7eaff", "#fff3dc"));
  hemisphereLight.groundColor.copy(temperatureColor(temperature, "#65788c", "#876b52"));
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

export function Tile3DScene({ material, lighting }: { material: TileMaterial; lighting: TileLighting }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const lightingRef = useRef(lighting);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    lightingRef.current = lighting;
  }, [lighting]);

  useEffect(() => {
    const root = mountRef.current;
    if (!root) return;

    setLoading(true);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#e7e0d8");

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(5.05, 3.55, 7.65);

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
    scene.environmentIntensity = 0.42;
    environment.dispose();
    pmrem.dispose();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.78, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.minDistance = 5.8;
    controls.maxDistance = 10.5;
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

    const fillLight = new THREE.DirectionalLight("#dce9f1", 0.78);
    fillLight.position.set(4.5, 3.5, -4.5);
    scene.add(fillLight);
    const hemisphereLight = new THREE.HemisphereLight("#fffaf2", "#76675a", 0.42);
    scene.add(hemisphereLight);
    applyStudioLighting(lightingRef.current, keyLight, fillLight, hemisphereLight);

    const floorMaterial = new THREE.MeshStandardMaterial({ color: "#bdb2a7", roughness: 0.9 });
    const studioFloor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), floorMaterial);
    studioFloor.rotation.x = -Math.PI / 2;
    studioFloor.position.y = -0.02;
    studioFloor.receiveShadow = true;
    scene.add(studioFloor);

    const wallMaterial = new THREE.MeshStandardMaterial({ color: "#d9d1c8", roughness: 0.94 });
    const studioWall = new THREE.Mesh(new THREE.PlaneGeometry(16, 10), wallMaterial);
    studioWall.position.set(0, 4.5, -4.6);
    studioWall.receiveShadow = true;
    scene.add(studioWall);

    const baseMaterial = new THREE.MeshStandardMaterial({ color: "#a99c90", roughness: 0.7 });
    const base = new THREE.Mesh(new RoundedBoxGeometry(4.25, 0.4, 2.25, 8, 0.08), baseMaterial);
    base.position.y = 0.2;
    base.castShadow = true;
    base.receiveShadow = true;
    scene.add(base);

    const topMaterial = new THREE.MeshStandardMaterial({ color: "#bdb1a5", roughness: 0.6 });
    const top = new THREE.Mesh(new RoundedBoxGeometry(3.85, 0.16, 1.88, 8, 0.04), topMaterial);
    top.position.y = 0.48;
    top.castShadow = true;
    top.receiveShadow = true;
    scene.add(top);

    // Keep the product geometry and framing invariant across selections.
    // Catalog format is metadata; it must not reshape the preview object.
    const tileWidth = 2.72;
    const tileHeight = 3.55;
    const tileDepth = 0.16;
    const tile = new THREE.Group();
    tile.position.set(0, 0.57 + tileHeight / 2, -0.03);
    tile.rotation.x = -0.045;
    tile.rotation.y = 0.02;

    const bodyMaterial = new THREE.MeshStandardMaterial({ color: "#81756a", roughness: 0.55, metalness: 0.01 });
    const body = new THREE.Mesh(new RoundedBoxGeometry(tileWidth, tileHeight, tileDepth, 10, 0.055), bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    tile.add(body);

    const surfaceMaterial = new THREE.MeshPhysicalMaterial({
      // Keep the catalog image as the albedo. A warm base color here makes
      // cool stones render beige and breaks the swatch-to-render comparison.
      color: "#ffffff",
      roughness: material.finish.toLowerCase().includes("gloss") ? 0.18 : 0.34,
      metalness: 0.01,
      clearcoat: material.finish.toLowerCase().includes("gloss") ? 0.26 : 0.08,
      clearcoatRoughness: 0.16,
      side: THREE.DoubleSide,
    });
    const surface = new THREE.Mesh(new THREE.PlaneGeometry(Math.max(0.8, tileWidth - 0.1), tileHeight - 0.1), surfaceMaterial);
    surface.position.z = tileDepth / 2 + 0.006;
    surface.castShadow = true;
    surface.receiveShadow = true;
    tile.add(surface);

    const edgeMaterial = new THREE.LineBasicMaterial({ color: "#f4eee6", transparent: true, opacity: 0.6 });
    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(new RoundedBoxGeometry(tileWidth, tileHeight, tileDepth, 10, 0.055)),
      edgeMaterial,
    );
    edge.position.z = 0.003;
    tile.add(edge);
    scene.add(tile);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
    let loadedTexture: THREE.Texture | null = null;
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
      applyStudioLighting(next, keyLight, fillLight, hemisphereLight);
      appliedIntensity = next.intensity;
      appliedTemperature = next.temperature;
    };

    const animate = () => {
      syncLighting();
      controls.update();
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
      renderer.dispose();
      root.removeChild(renderer.domElement);
    };
  }, [material.textureUrl, material.finish]);

  return (
    <div className="visualizer-render-scene-shell">
      <div ref={mountRef} className="visualizer-render-scene" data-lenis-prevent="true" aria-label={`3D-модель плитки ${material.name}`} />
      {loading && <div className="visualizer-render-loading">Подготовка материала…</div>}
      <span className="visualizer-render-hint">Поверните модель мышью</span>
    </div>
  );
}
