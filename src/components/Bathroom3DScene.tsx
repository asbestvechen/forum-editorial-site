import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import type { TileMaterial } from "@/lib/materials";

const modelUrl = "./assets/bathroom/bathroom.glb";

function configureTexture(texture: THREE.Texture, repeat: [number, number], renderer: THREE.WebGLRenderer) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(...repeat);
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
}

export function Bathroom3DScene({ wallMaterial, floorMaterial }: { wallMaterial: TileMaterial | undefined; floorMaterial: TileMaterial | undefined }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const applySurfacesRef = useRef<((wall: TileMaterial | undefined, floor: TileMaterial | undefined) => void) | null>(null);
  const currentMaterialsRef = useRef({ wall: wallMaterial, floor: floorMaterial });
  currentMaterialsRef.current = { wall: wallMaterial, floor: floorMaterial };
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const root = mountRef.current;
    if (!root) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#c9b9a6");
    const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.35));
    root.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = new RoomEnvironment();
    scene.environment = pmrem.fromScene(environment).texture;
    scene.environmentIntensity = 0.52;
    environment.dispose();
    pmrem.dispose();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI * 0.23;
    controls.maxPolarAngle = Math.PI * 0.56;

    const keyLight = new THREE.DirectionalLight("#fff4dc", 1.35);
    keyLight.position.set(-4, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);
    scene.add(new THREE.HemisphereLight("#fff9ec", "#645343", 0.62));

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
    const loadedTextures: THREE.Texture[] = [];
    const replacedMaterials = new Set<THREE.Material>();
    const textureCache = new Map<string, THREE.Texture>();
    const surfaceMeshes: Record<"wall" | "floor", THREE.Mesh[]> = { wall: [], floor: [] };
    let cancelled = false;
    let currentModel: THREE.Object3D | null = null;

    const applyTextureToMeshes = (meshes: THREE.Mesh[], material: TileMaterial | undefined, repeat: [number, number]) => {
      if (!material) return;
      const applyTexture = (texture: THREE.Texture) => {
        meshes.forEach((mesh) => {
          const original = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
          const previous = mesh.userData.forumReplacement as THREE.MeshStandardMaterial | undefined;
          const replacement = previous ?? new THREE.MeshStandardMaterial({
            color: "#ffffff",
            roughness: 0.42,
            metalness: 0.02,
            side: original.side,
          });
          replacement.map = texture;
          replacement.color.set("#ffffff");
          replacement.roughness = 0.42;
          replacement.metalness = 0.02;
          replacement.alphaMap = null;
          replacement.alphaTest = 0;
          replacement.transparent = false;
          replacement.needsUpdate = true;
          mesh.userData.forumReplacement = replacement;
          mesh.material = replacement;
          replacedMaterials.add(replacement);
        });
      };

      const cached = textureCache.get(material.textureUrl);
      if (cached) {
        configureTexture(cached, repeat, renderer);
        applyTexture(cached);
        return;
      }

      textureLoader.load(material.textureUrl, (texture) => {
        if (cancelled) {
          texture.dispose();
          return;
        }
        texture.flipY = false;
        configureTexture(texture, repeat, renderer);
        textureCache.set(material.textureUrl, texture);
        loadedTextures.push(texture);
        applyTexture(texture);
      });
    };

    applySurfacesRef.current = (wall, floor) => {
      applyTextureToMeshes(surfaceMeshes.wall, wall, [2.2, 2.2]);
      applyTextureToMeshes(surfaceMeshes.floor, floor, [4.5, 4.5]);
    };

    loader.load(modelUrl, (gltf) => {
      if (cancelled) return;
      currentModel = gltf.scene;
      currentModel.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const original = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
        const materialName = `${mesh.name} ${original?.name ?? ""}`.toLowerCase();
        if (/(greywall|wallpaper|wall|ceiling)/.test(materialName)) surfaceMeshes.wall.push(mesh);
        if (/(floor|rug)/.test(materialName)) surfaceMeshes.floor.push(mesh);
      });

      const bounds = new THREE.Box3().setFromObject(currentModel);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      const maxDimension = Math.max(size.x, size.y, size.z);
      const importedCamera = gltf.cameras.find((candidate): candidate is THREE.PerspectiveCamera => candidate instanceof THREE.PerspectiveCamera);

      if (importedCamera) {
        camera.position.copy(importedCamera.position);
        camera.quaternion.copy(importedCamera.quaternion);
        camera.fov = importedCamera.fov;
        camera.near = Math.max(0.01, importedCamera.near);
        camera.far = importedCamera.far;
        const viewDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
        controls.target.copy(camera.position).addScaledVector(viewDirection, maxDimension * 0.72);
      } else {
        currentModel.position.sub(center);
        camera.position.set(maxDimension * 0.9, maxDimension * 0.48, maxDimension * 0.92);
        camera.near = Math.max(0.01, maxDimension / 1000);
        camera.far = maxDimension * 10;
        controls.target.set(0, size.y * 0.42, 0);
      }
      scene.add(currentModel);
      camera.updateProjectionMatrix();
      controls.minDistance = maxDimension * 0.55;
      controls.maxDistance = maxDimension * 1.8;
      controls.update();
      setLoading(false);
      applySurfacesRef.current?.(currentMaterialsRef.current.wall, currentMaterialsRef.current.floor);
    }, undefined, (error) => {
      setLoading(false);
      setLoadError(true);
      console.error("Bathroom GLTF failed to load", error);
    });

    const resize = () => {
      const bounds = root.getBoundingClientRect();
      camera.aspect = Math.max(1, bounds.width) / Math.max(1, bounds.height);
      camera.updateProjectionMatrix();
      renderer.setSize(Math.max(1, bounds.width), Math.max(1, bounds.height), false);
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
      if (currentModel) {
        currentModel.traverse((object) => {
          const mesh = object as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
        });
        scene.remove(currentModel);
      }
      replacedMaterials.forEach((material) => material.dispose());
      loadedTextures.forEach((texture) => texture.dispose());
      textureCache.clear();
      renderer.dispose();
      root.removeChild(renderer.domElement);
      applySurfacesRef.current = null;
    };
  }, []);

  useEffect(() => {
    applySurfacesRef.current?.(currentMaterialsRef.current.wall, currentMaterialsRef.current.floor);
  }, [floorMaterial?.textureUrl, wallMaterial?.textureUrl]);

  return (
    <div className="visualizer-render-scene-shell" aria-label="Фотореалистичный 3D-рэндер ванной комнаты">
      <div ref={mountRef} className="visualizer-render-scene" />
      {loading && <div className="visualizer-render-loading">Загрузка 3D-сцены…</div>}
      {loadError && <div className="visualizer-render-loading">Не удалось загрузить 3D-сцену</div>}
    </div>
  );
}
