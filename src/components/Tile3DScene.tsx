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
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.needsUpdate = true;
}

export function Tile3DScene({ material }: { material: TileMaterial }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const root = mountRef.current;
    if (!root) return;

    setLoading(true);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#d8cec1");

    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
    camera.position.set(4.3, 3.55, 5.1);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    root.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = new RoomEnvironment();
    scene.environment = pmrem.fromScene(environment).texture;
    scene.environmentIntensity = 0.7;
    environment.dispose();
    pmrem.dispose();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.55, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 4;
    controls.maxDistance = 8.5;
    controls.minPolarAngle = Math.PI * 0.19;
    controls.maxPolarAngle = Math.PI * 0.46;
    controls.update();

    const keyLight = new THREE.DirectionalLight("#fff7e9", 4.4);
    keyLight.position.set(-3.6, 7.5, 4.8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1536, 1536);
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight("#b9c9d7", 1.2);
    fillLight.position.set(4, 3, -4);
    scene.add(fillLight);
    scene.add(new THREE.HemisphereLight("#fff9ef", "#695849", 0.55));

    const studioMaterial = new THREE.MeshStandardMaterial({ color: "#a99b8d", roughness: 0.84 });
    const studioFloor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), studioMaterial);
    studioFloor.rotation.x = -Math.PI / 2;
    studioFloor.position.y = -0.03;
    studioFloor.receiveShadow = true;
    scene.add(studioFloor);

    const studioWall = new THREE.Mesh(new THREE.PlaneGeometry(16, 9), new THREE.MeshStandardMaterial({ color: "#d8cec1", roughness: 0.92 }));
    studioWall.position.set(0, 4.2, -4.5);
    studioWall.receiveShadow = true;
    scene.add(studioWall);

    const tile = new THREE.Group();
    tile.position.y = 0.26;
    tile.rotation.x = -0.16;
    tile.rotation.z = -0.025;

    const bodyMaterial = new THREE.MeshStandardMaterial({ color: "#beb4a8", roughness: 0.34, metalness: 0.015 });
    const body = new THREE.Mesh(new RoundedBoxGeometry(3.65, 0.17, 3.65, 10, 0.065), bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    tile.add(body);

    const surfaceMaterial = new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      roughness: material.finish.toLowerCase().includes("gloss") ? 0.2 : 0.36,
      metalness: 0.01,
      clearcoat: material.finish.toLowerCase().includes("gloss") ? 0.24 : 0.1,
      clearcoatRoughness: 0.22,
      side: THREE.FrontSide,
    });
    const surface = new THREE.Mesh(new THREE.PlaneGeometry(3.48, 3.48), surfaceMaterial);
    surface.rotation.x = -Math.PI / 2;
    surface.position.y = 0.09;
    surface.castShadow = true;
    surface.receiveShadow = true;
    tile.add(surface);

    const bevelHighlight = new THREE.LineSegments(
      new THREE.EdgesGeometry(new RoundedBoxGeometry(3.65, 0.17, 3.65, 10, 0.065)),
      new THREE.LineBasicMaterial({ color: "#e5ddd2", transparent: true, opacity: 0.42 }),
    );
    bevelHighlight.position.y = 0.002;
    tile.add(bevelHighlight);
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
  }, [material.textureUrl, material.finish]);

  return (
    <div className="visualizer-render-scene-shell">
      <div ref={mountRef} className="visualizer-render-scene" aria-label={`3D-модель плитки ${material.name}`} />
      {loading && <div className="visualizer-render-loading">Подготовка материала…</div>}
      <span className="visualizer-render-hint">Поверните модель мышью</span>
    </div>
  );
}
