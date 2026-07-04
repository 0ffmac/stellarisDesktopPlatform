import type { ColorRepresentation } from 'three';

export interface StarConfig {
  id: string;
  name: string;
  modelPath: string;
  defaultTexture?: string;
  scale: [number, number, number];
  rotationSpeed: number;
  floatingAmplitude: number;
  floatingFrequency: number;
}

export interface StarState {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  roughness: number;
  metalness: number;
  glowIntensity: number;
  glowEnabled: boolean;
  wireframe: boolean;
  autoRotate: boolean;
  autoRotateSpeed: number;
  bloom: boolean;
  bloomIntensity: number;
}

export interface StarTheme {
  id: string;
  name: string;
  textureId: string;
  emissiveColor: ColorRepresentation;
  emissiveIntensity: number;
  glowColor: ColorRepresentation;
  particleColor: ColorRepresentation;
  sceneBackground: ColorRepresentation;
}
