import type { ColorRepresentation } from 'three';

export interface LightConfig {
  ambientColor: ColorRepresentation;
  ambientIntensity: number;
  keyLightColor: ColorRepresentation;
  keyLightIntensity: number;
  keyLightPosition: [number, number, number];
  fillLightColor: ColorRepresentation;
  fillLightIntensity: number;
  fillLightPosition: [number, number, number];
  backgroundColor: ColorRepresentation;
}

export interface ScenePreset {
  id: string;
  name: string;
  description: string;
  lighting: LightConfig;
  cameraPosition: [number, number, number];
  autoRotate: boolean;
  autoRotateSpeed: number;
}

export const SCENE_PRESETS: ScenePreset[] = [
  {
    id: 'studio',
    name: 'Studio',
    description: 'Clean neutral lighting for product showcase',
    cameraPosition: [0, 0, 3.5],
    autoRotate: true,
    autoRotateSpeed: 0.7,
    lighting: {
      ambientColor: '#ffffff',
      ambientIntensity: 0.4,
      keyLightColor: '#ffffff',
      keyLightIntensity: 2.0,
      keyLightPosition: [5, 5, 5],
      fillLightColor: '#ffffff',
      fillLightIntensity: 0.8,
      fillLightPosition: [-3, 2, 3],
      backgroundColor: '#1c1c24',
    },
  },
  {
    id: 'living-room',
    name: 'Living Room',
    description: 'Warm cozy ambient lighting',
    cameraPosition: [0, 0.5, 4],
    autoRotate: true,
    autoRotateSpeed: 0.5,
    lighting: {
      ambientColor: '#ffeebb',
      ambientIntensity: 0.3,
      keyLightColor: '#ffcc88',
      keyLightIntensity: 1.5,
      keyLightPosition: [4, 6, 4],
      fillLightColor: '#ffaa66',
      fillLightIntensity: 0.5,
      fillLightPosition: [-3, 1, 3],
      backgroundColor: '#2a2018',
    },
  },
  {
    id: 'christmas',
    name: 'Christmas',
    description: 'Festive red and green holiday lighting',
    cameraPosition: [0, -0.3, 3.8],
    autoRotate: true,
    autoRotateSpeed: 1.0,
    lighting: {
      ambientColor: '#ff4444',
      ambientIntensity: 0.2,
      keyLightColor: '#ff6622',
      keyLightIntensity: 2.2,
      keyLightPosition: [6, 4, 5],
      fillLightColor: '#44ff66',
      fillLightIntensity: 0.6,
      fillLightPosition: [-4, 3, 4],
      backgroundColor: '#0a0a1a',
    },
  },
];

export function getScenePreset(id: string): ScenePreset | undefined {
  return SCENE_PRESETS.find((p) => p.id === id);
}

export function getDefaultPreset(): ScenePreset {
  return SCENE_PRESETS[0];
}
