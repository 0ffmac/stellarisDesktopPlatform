import type { ToneMapping } from 'three';

export interface RendererConfig {
  antialias: boolean;
  alpha: boolean;
  powerPreference: string;
  toneMapping: ToneMapping;
  toneMappingExposure: number;
  pixelRatio: number;
  outputColorSpace: 'srgb' | 'linear';
  transparent: boolean;
}

export interface QualityPreset {
  name: 'low' | 'medium' | 'high' | 'ultra';
  pixelRatio: number;
  shadowMapSize: number;
  antialias: boolean;
  bloom: boolean;
  bloomResolution: number;
  ambientOcclusion: boolean;
  ssaoSamples: number;
  maxTextureSize: number;
}

export interface PostProcessingConfig {
  bloom: boolean;
  bloomIntensity: number;
  bloomThreshold: number;
  bloomRadius: number;
  ambientOcclusion: boolean;
  toneMapping: boolean;
  vignette: boolean;
}
