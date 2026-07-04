export interface AssetManifest {
  models: ModelEntry[];
  textures: TextureEntry[];
  patterns: PatternEntry[];
  hdri: HDRIEntry[];
}

export interface ModelEntry {
  id: string;
  name: string;
  path: string;
  type: 'glb' | 'gltf';
}

export interface TextureEntry {
  id: string;
  name: string;
  path: string;
  type: 'diffuse' | 'emissive' | 'normal' | 'roughness' | 'metalness';
  format: 'png' | 'jpg' | 'webp';
}

export interface PatternEntry {
  id: string;
  name: string;
  path: string;
  type: 'pattern';
}

export interface HDRIEntry {
  id: string;
  name: string;
  path: string;
  format: 'hdr' | 'exr';
}

export const assetManifest: AssetManifest = {
  models: [
    {
      id: 'star',
      name: 'Star',
      path: '/assets/models/Star.glb',
      type: 'glb',
    },
  ],
  textures: [
    {
      id: 'classic-lantern',
      name: 'Classic Lantern',
      path: '/assets/skins/skin.png',
      type: 'diffuse',
      format: 'png',
    },
    {
      id: 'crimson-ember',
      name: 'Crimson Ember',
      path: '/assets/skins/skin1.png',
      type: 'diffuse',
      format: 'png',
    },
    {
      id: 'deep-azure',
      name: 'Deep Azure',
      path: '/assets/skins/skin2.png',
      type: 'diffuse',
      format: 'png',
    },
    {
      id: 'solar-gold',
      name: 'Solar Gold',
      path: '/assets/skins/skin3.png',
      type: 'diffuse',
      format: 'png',
    },
  ],
  patterns: [],
  hdri: [],
};

export type ThemeId = 'classic-lantern' | 'crimson-ember' | 'deep-azure' | 'solar-gold'
  | 'aurora' | 'ocean';

export const themeTextureMap: Record<ThemeId, string> = {
  'classic-lantern': 'classic-lantern',
  'crimson-ember': 'crimson-ember',
  'deep-azure': 'deep-azure',
  'solar-gold': 'solar-gold',
  'aurora': 'classic-lantern',
  'ocean': 'deep-azure',
};

export function getModelPath(id: string): string | undefined {
  return assetManifest.models.find((m) => m.id === id)?.path;
}

export function getTexturePath(id: string): string | undefined {
  return assetManifest.textures.find((t) => t.id === id)?.path;
}
