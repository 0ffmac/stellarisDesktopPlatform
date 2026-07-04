import type { QualityPreset } from '../../shared/types';

export const QUALITY_PRESETS: Record<string, QualityPreset> = {
  low: {
    name: 'low',
    pixelRatio: 0.75,
    shadowMapSize: 512,
    antialias: false,
    bloom: false,
    bloomResolution: 0.25,
    ambientOcclusion: false,
    ssaoSamples: 0,
    maxTextureSize: 1024,
  },
  medium: {
    name: 'medium',
    pixelRatio: 1,
    shadowMapSize: 1024,
    antialias: true,
    bloom: true,
    bloomResolution: 0.5,
    ambientOcclusion: false,
    ssaoSamples: 8,
    maxTextureSize: 2048,
  },
  high: {
    name: 'high',
    pixelRatio: 1.5,
    shadowMapSize: 2048,
    antialias: true,
    bloom: true,
    bloomResolution: 0.5,
    ambientOcclusion: true,
    ssaoSamples: 16,
    maxTextureSize: 4096,
  },
  ultra: {
    name: 'ultra',
    pixelRatio: 2,
    shadowMapSize: 4096,
    antialias: true,
    bloom: true,
    bloomResolution: 1,
    ambientOcclusion: true,
    ssaoSamples: 32,
    maxTextureSize: 8192,
  },
};

export interface GPUInfo {
  vendor: string;
  renderer: string;
  maxTextureSize: number;
  maxShaderPrecision: number;
  floatPrecision: string;
}

export class QualityManager {
  private gpuInfo: GPUInfo | null = null;

  async detectGPU(): Promise<GPUInfo> {
    if (this.gpuInfo) return this.gpuInfo;

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') as WebGL2RenderingContext | null;

    if (!gl) {
      this.gpuInfo = {
        vendor: 'unknown',
        renderer: 'unknown',
        maxTextureSize: 2048,
        maxShaderPrecision: 16,
        floatPrecision: 'mediump',
      };
      return this.gpuInfo;
    }

    const ext = gl.getExtension('WEBGL_debug_renderer_info');

    this.gpuInfo = {
      vendor: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : 'unknown',
      renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown',
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxShaderPrecision: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      floatPrecision: gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT) ? 'highp' : 'mediump',
    };

    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return this.gpuInfo;
  }

  async autoDetectQuality(): Promise<QualityPreset> {
    const gpu = await this.detectGPU();
    const isIntegrated = gpu.renderer.toLowerCase().includes('intel');
    const isAppleSilicon = gpu.renderer.toLowerCase().includes('apple');
    const isDedicatedGPU = !isIntegrated || isAppleSilicon;

    if (isAppleSilicon || gpu.maxTextureSize >= 16384) {
      return QUALITY_PRESETS.ultra;
    }
    if (isDedicatedGPU && gpu.maxTextureSize >= 8192) {
      return QUALITY_PRESETS.high;
    }
    if (gpu.maxTextureSize >= 4096) {
      return QUALITY_PRESETS.medium;
    }
    return QUALITY_PRESETS.low;
  }
}

export const qualityManager = new QualityManager();
