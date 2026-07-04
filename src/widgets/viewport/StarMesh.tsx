import type { Group } from 'three';
import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  TextureLoader,
  MeshStandardMaterial,
  SRGBColorSpace,
  RepeatWrapping,
  Color,
  Mesh,
} from 'three';
import type { BufferAttribute } from 'three';
import type { ThemeDefinition } from '../../shared/types/theme.types';

interface StarMeshProps {
  modelUrl: string;
  textureUrl: string;
  scale: number;
  roughness: number;
  metalness: number;
  glowEnabled: boolean;
  glowIntensity: number;
  wireframe: boolean;
  autoRotate: boolean;
  autoRotateSpeed: number;
  theme: ThemeDefinition;
}

export function StarMesh(props: StarMeshProps) {
  const { modelUrl, textureUrl, scale: scaleVal, roughness, metalness, glowEnabled, glowIntensity, wireframe, autoRotate, autoRotateSpeed, theme } = props;

  const groupRef = useRef<Group>(null);
  const materialRef = useRef<MeshStandardMaterial | null>(null);

  const gltf = useLoader(GLTFLoader, modelUrl);
  const gltfTexture = useLoader(TextureLoader, textureUrl);

  const material = useMemo(() => {
    const tex = gltfTexture.clone();
    tex.colorSpace = SRGBColorSpace;
    tex.wrapS = tex.wrapT = RepeatWrapping;
    tex.flipY = false;

    const mat = new MeshStandardMaterial({
      map: tex,
      roughness,
      metalness,
      side: 2,
      transparent: true,
      opacity: 1,
      wireframe,
      envMapIntensity: 1,
    });

    if (glowEnabled) {
      mat.emissive = new Color(theme.emissiveColor);
      mat.emissiveIntensity = glowIntensity;
      mat.emissiveMap = mat.map;
    }

    materialRef.current = mat;
    return mat;
  }, [roughness, metalness, wireframe, glowEnabled, glowIntensity, theme, gltfTexture]);

  useEffect(() => {
    if (!gltf) return;
    const group = groupRef.current;
    if (!group) return;
    group.rotation.x = -Math.PI / 2;

    gltf.scene.traverse((child) => {
      const mesh = child as Mesh;
      if (mesh.isMesh) {
        const pos = mesh.geometry.getAttribute('position');
        const uv = mesh.geometry.getAttribute('uv');

        if (uv && pos) {
          const uvArray = uv.array;
          let uMin = Infinity;
          let uMax = -Infinity;
          let vMin = Infinity;
          let vMax = -Infinity;
          for (let i = 0; i < pos.count; i++) {
            if (uvArray[i * 2] < uMin) uMin = uvArray[i * 2];
            if (uvArray[i * 2] > uMax) uMax = uvArray[i * 2];
            if (uvArray[i * 2 + 1] < vMin) vMin = uvArray[i * 2 + 1];
            if (uvArray[i * 2 + 1] > vMax) vMax = uvArray[i * 2 + 1];
          }

          if (Math.abs(uMin - uMax) < 0.001 && Math.abs(vMin - vMax) < 0.001) {
            const newUv = new Float32Array(pos.count * 2);
            for (let i = 0; i < pos.count; i++) {
              const x = pos.getX(i);
              const z = pos.getZ(i);
              newUv[i * 2] = (x + 1) / 2;
              newUv[i * 2 + 1] = (z + 1) / 2;
            }
            (mesh.geometry.getAttribute('uv') as BufferAttribute).array = newUv;
            (mesh.geometry.getAttribute('uv') as BufferAttribute).needsUpdate = true;
          }
        }
        mesh.material = material;
      }
    });
    group.add(gltf.scene);
  }, [gltf, material]);

  useEffect(() => {
    if (!materialRef.current) return;
    const mat = materialRef.current;
    mat.roughness = roughness;
    mat.metalness = metalness;
    mat.wireframe = wireframe;

    if (glowEnabled) {
      mat.emissive = new Color(theme.emissiveColor);
      mat.emissiveIntensity = glowIntensity;
      mat.emissiveMap = mat.map;
    } else {
      mat.emissive = new Color(0x000000);
      mat.emissiveIntensity = 0;
      mat.emissiveMap = null;
    }
    mat.needsUpdate = true;
  }, [roughness, metalness, wireframe, glowEnabled, glowIntensity, theme]);

  useEffect(() => {
    if (!materialRef.current || !gltfTexture) return;
    const tex = gltfTexture.clone();
    tex.colorSpace = SRGBColorSpace;
    tex.wrapS = tex.wrapT = RepeatWrapping;
    tex.flipY = false;
    materialRef.current.map = tex;
    if (glowEnabled) {
      materialRef.current.emissiveMap = tex;
    }
    materialRef.current.needsUpdate = true;
  }, [gltfTexture, glowEnabled]);

  const floatOffset = useRef(0);
  const time = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    time.current += delta;
    if (autoRotate) {
      groupRef.current.rotation.y += delta * autoRotateSpeed * 0.15;
    }
    floatOffset.current = Math.sin(time.current * 0.3) * 0.03;
    groupRef.current.position.y = floatOffset.current;
  });

  return <group ref={groupRef} scale={scaleVal} />;
}
