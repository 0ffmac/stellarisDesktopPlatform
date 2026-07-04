import { getModelPath, getTexturePath } from '@shared-assets/metadata/index';

export interface StarConfigData {
  id: string;
  name: string;
  modelUrl: string;
  textureUrl: string;
  scale: number;
  rotationSpeed: number;
}

export function loadStarConfig(
  starId: string,
  textureId: string,
): StarConfigData | null {
  const modelPath = getModelPath(starId);
  const texturePath = getTexturePath(textureId);

  if (!modelPath || !texturePath) return null;

  return {
    id: starId,
    name: starId.charAt(0).toUpperCase() + starId.slice(1),
    modelUrl: modelPath,
    textureUrl: texturePath,
    scale: 1,
    rotationSpeed: 0.5,
  };
}

export function createDefaultStarConfig(): StarConfigData {
  return {
    id: 'star',
    name: 'Star',
    modelUrl: getModelPath('star') ?? '/assets/models/Star.glb',
    textureUrl: getTexturePath('classic-lantern') ?? '/assets/skins/skin.png',
    scale: 1,
    rotationSpeed: 0.5,
  };
}
