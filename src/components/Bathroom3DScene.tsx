import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { TileMaterial } from "@/lib/materials";

const modelUrl = "./assets/bathroom/bathroom_extended.gltf";

function configureTexture(texture: THREE.Texture, repeat: [number, number], renderer: THREE.WebGLRenderer) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(...repeat);
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
}

export function Bathroom3DScene({ wallMaterial, floorMaterial }: { wallMaterial: TileMaterial | undefined; floorMaterial: TileMaterial | undefined }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = mountRef.current;
    if (!root) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#d0c1ae");
    const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    root.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = new RoomEnvironment();
    scene.environment = pmrem.fromScene(environment).texture;
    environment.dispose();
    pmrem.dispose();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI * 0.23;
    controls.maxPolarAngle = Math.PI * 0.56;

    const keyLight = new THREE.DirectionalLight("#fff4dc", 2.8);
    keyLight.position.set(-4, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);
    scene.add(new THREE.HemisphereLight("#fff9ec", "#645343", 1.5));

    const loader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
    const loadedTextures: THREE.Texture[] = [];
    const replacedMaterials: THREE.Material[] = [];
    let cancelled = false;
    let currentModel: THREE.Object3D | null = null;

    const loadSurfaceTexture = (mesh: THREE.Mesh, material: TileMaterial, repeat: [number, number]) => {
      textureLoader.load(material.textureUrl, (texture) => {
        if (cancelled) {
          texture.dispose();
          return;
        }
        configureTexture(texture, repeat, renderer);
        loadedTextures.push(texture);
        const original = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
        const replacement = original.clone() as THREE.MeshStandardMaterial;
        replacement.map = texture;
        replacement.color.set("#ffffff");
        replacement.roughness = 0.58;
        replacement.needsUpdate = true;
        replacedMaterials.push(replacement);
        mesh.material = replacement;
      });
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
        if (wallMaterial && /(greywall|wallpaper|wall)/.test(materialName)) loadSurfaceTexture(mesh, wallMaterial, [2.2, 2.2]);
        if (floorMaterial && /floor/.test(materialName)) loadSurfaceTexture(mesh, floorMaterial, [4.5, 4.5]);
      });

      const bounds = new THREE.Box3().setFromObject(currentModel);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      currentModel.position.sub(center);
      scene.add(currentModel);
      const maxDimension = Math.max(size.x, size.y, size.z);
      camera.position.set(maxDimension * 0.9, maxDimension * 0.48, maxDimension * 0.92);
      camera.near = Math.max(0.01, maxDimension / 1000);
      camera.far = maxDimension * 10;
      camera.updateProjectionMatrix();
      controls.target.set(0, size.y * 0.42, 0);
      controls.minDistance = maxDimension * 0.55;
      controls.maxDistance = maxDimension * 1.8;
      controls.update();
    }, undefined, (error) => {
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
      renderer.dispose();
      root.removeChild(renderer.domElement);
    };
  }, [floorMaterial, wallMaterial]);

  return <div ref={mountRef} className="visualizer-render-scene" aria-label="Фотореалистичный 3D-рэндер ванной комнаты" />;
}
