import type { ColorRepresentation } from 'three';

export type ThemeId = 'classic-lantern' | 'crimson-ember' | 'deep-azure' | 'solar-gold' | 'aurora' | 'ocean';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  textureId: string;
  presetId: string;
  emissiveColor: ColorRepresentation;
  emissiveIntensity: number;
  glowColor: ColorRepresentation;
  particleColor: ColorRepresentation;
  ambientColor: ColorRepresentation;
  keyLightColor: ColorRepresentation;
  fillLightColor: ColorRepresentation;
  backgroundColor: ColorRepresentation;
}
