import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { StarMesh } from './StarMesh';
import { Environment } from './Environment';
import { Lighting } from './Lighting';
import { PostProcessing } from './PostProcessing';
import { useStarStore } from '../../stores/useStarStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useRef, useEffect, Suspense } from 'react';
import { Vector3 } from 'three';
import { getModelPath, getTexturePath } from '@shared-assets/metadata/index';

function LoadingSphere() {
  const loading = useStarStore((s) => s.loading);
  if (!loading) return null;
  return (
    <mesh scale={0.8}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial
        color="#5818e4"
        roughness={0.3}
        metalness={0.1}
        wireframe
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

function StarRenderer() {
  const star = useStarStore((s) => s.star);
  const activeTheme = useThemeStore((s) => s.activeTheme);
  const setError = useStarStore((s) => s.setError);

  const modelPath = getModelPath('star') ?? '/assets/models/Star.glb';
  const textureId = activeTheme.textureId;
  const texturePath = getTexturePath(textureId);

  useEffect(() => {
    if (!texturePath) {
      setError(`Texture not found for theme: ${activeTheme.name}`);
    }
  }, [texturePath, activeTheme, setError]);

  if (!texturePath) return null;

  return (
    <group position={[star.position[0], star.position[1], star.position[2]]}>
      <Suspense fallback={null}>
        <StarMesh
          modelUrl={modelPath}
          textureUrl={texturePath}
          scale={star.scale[0]}
          roughness={star.roughness}
          metalness={star.metalness}
          glowEnabled={star.glowEnabled}
          glowIntensity={star.glowIntensity}
          wireframe={star.wireframe}
          autoRotate={star.autoRotate}
          autoRotateSpeed={star.autoRotateSpeed}
          theme={activeTheme}
        />
      </Suspense>
    </group>
  );
}

const _vec = new Vector3();

export function Scene() {
  const controlsRef = useRef<any>(null);
  const interactionSettings = useSettingsStore((s) => s.settings.interactionSettings);
  const setModelLoaded = useStarStore((s) => s.setModelLoaded);
  const setPosition = useStarStore((s) => s.setPosition);
  const { camera, gl } = useThree();

  const isDragging = useRef(false);
  const dragStart = useRef({ screenX: 0, screenY: 0, worldX: 0, worldY: 0 });

  useEffect(() => {
    setModelLoaded(true);
    useStarStore.getState().setLoading(false);
  }, [setModelLoaded]);

  useEffect(() => {
    const el = gl.domElement;
    const ctrl = controlsRef.current;

    const onPointerDown = (e: PointerEvent) => {
      if (!e.metaKey) return;
      isDragging.current = true;
      dragStart.current = {
        screenX: e.clientX,
        screenY: e.clientY,
        worldX: useStarStore.getState().star.position[0],
        worldY: useStarStore.getState().star.position[1],
      };
      el.setPointerCapture(e.pointerId);
      if (ctrl) ctrl.enableRotate = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - dragStart.current.screenX;
      const dy = e.clientY - dragStart.current.screenY;
      const worldDelta = _vec.set(dx, -dy, 0).applyQuaternion(camera.quaternion);
      setPosition(
        dragStart.current.worldX + worldDelta.x * 0.01,
        dragStart.current.worldY + worldDelta.y * 0.01,
      );
    };

    const onPointerUp = () => {
      isDragging.current = false;
      if (ctrl) ctrl.enableRotate = interactionSettings.enableRotation;
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
    };
  }, [gl, camera, setPosition, interactionSettings.enableRotation]);

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={interactionSettings.enableZoom}
        enableRotate={interactionSettings.enableRotation}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
      />

      <Environment />
      <Lighting />
      <PostProcessing />

      <LoadingSphere />

      <Suspense fallback={null}>
        <StarRenderer />
      </Suspense>
    </>
  );
}
