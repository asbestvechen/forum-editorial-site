import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { TileMaterial } from "@/lib/materials";

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

function getTileAspect(format: string) {
  const dimensions = format.match(/\d+(?:[.,]\d+)?/g)?.map(Number) ?? [];
  if (dimensions.length < 2) return 0.72;
  const [first, second] = dimensions;
  return Math.min(first, second) / Math.max(first, second);
}

export function Tile3DScene({ material }: { material: TileMaterial }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const root = mountRef.current;
    if (!root) return;

    setLoading(true);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#efebe5");

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(5.05, 3.55, 7.65);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;
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
    scene.add(new THREE.HemisphereLight("#fffaf2", "#76675a", 0.42));

    const floorMaterial = new THREE.MeshStandardMaterial({ color: "#c8bdb1", roughness: 0.9 });
    const studioFloor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), floorMaterial);
    studioFloor.rotation.x = -Math.PI / 2;
    studioFloor.position.y = -0.02;
    studioFloor.receiveShadow = true;
    scene.add(studioFloor);

    const wallMaterial = new THREE.MeshStandardMaterial({ color: "#efebe5", roughness: 0.94 });
    const studioWall = new THREE.Mesh(new THREE.PlaneGeometry(16, 10), wallMaterial);
    studioWall.position.set(0, 4.5, -4.6);
    studioWall.receiveShadow = true;
    scene.add(studioWall);

    const baseMaterial = new THREE.MeshStandardMaterial({ color: "#b5a99d", roughness: 0.7 });
    const base = new THREE.Mesh(new RoundedBoxGeometry(4.25, 0.4, 2.25, 8, 0.08), baseMaterial);
    base.position.y = 0.2;
    base.castShadow = true;
    base.receiveShadow = true;
    scene.add(base);

    const topMaterial = new THREE.MeshStandardMaterial({ color: "#cbc1b6", roughness: 0.6 });
    const top = new THREE.Mesh(new RoundedBoxGeometry(3.85, 0.16, 1.88, 8, 0.04), topMaterial);
    top.position.y = 0.48;
    top.castShadow = true;
    top.receiveShadow = true;
    scene.add(top);

    const aspect = getTileAspect(material.format);
    const tileHeight = aspect < 0.95 ? 3.62 : 3.25;
    const tileWidth = tileHeight * aspect;
    const tileDepth = 0.16;
    const tile = new THREE.Group();
    tile.position.set(0, 0.57 + tileHeight / 2, -0.03);
    tile.rotation.x = -0.045;
    tile.rotation.y = 0.02;

    const bodyMaterial = new THREE.MeshStandardMaterial({ color: "#8f8377", roughness: 0.55, metalness: 0.01 });
    const body = new THREE.Mesh(new RoundedBoxGeometry(tileWidth, tileHeight, tileDepth, 10, 0.055), bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    tile.add(body);

    const surfaceMaterial = new THREE.MeshPhysicalMaterial({
      color: "#d7cec3",
      roughness: material.finish.toLowerCase().includes("gloss") ? 0.21 : 0.39,
      metalness: 0.01,
      clearcoat: material.finish.toLowerCase().includes("gloss") ? 0.32 : 0.12,
      clearcoatRoughness: 0.2,
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
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
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
  }, [material.textureUrl, material.finish, material.format]);

  return (
    <div className="visualizer-render-scene-shell">
      <div ref={mountRef} className="visualizer-render-scene" aria-label={`3D-модель плитки ${material.name}`} />
      {loading && <div className="visualizer-render-loading">Подготовка материала…</div>}
      <span className="visualizer-render-hint">Поверните модель мышью</span>
    </div>
  );
}
