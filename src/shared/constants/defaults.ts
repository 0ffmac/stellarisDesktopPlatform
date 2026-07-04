import type { AppSettings, StarState } from '../types';

export const APP_NAME = 'Stellaris Desktop';
export const APP_VERSION = '0.1.0';

export const DEFAULT_STAR_STATE: StarState = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  roughness: 0.4,
  metalness: 0.3,
  glowIntensity: 1.0,
  glowEnabled: true,
  wireframe: false,
  autoRotate: true,
  autoRotateSpeed: 0.5,
  bloom: true,
  bloomIntensity: 0.8,
};

export const DEFAULT_SETTINGS: AppSettings = {
  version: APP_VERSION,
  themeSettings: {
    activeThemeId: 'classic-lantern',
    customThemes: [],
  },
  displaySettings: {
    fpsLimit: 0,
    qualityPreset: 'auto',
    enableBloom: true,
    bloomIntensity: 0.8,
    enableParticles: true,
    particleCount: 100,
    enableShadows: true,
    shadowQuality: 'high',
    targetMonitorId: 'primary',
  },
  interactionSettings: {
    mode: 'interactive',
    enableRotation: true,
    enableDrag: true,
    enableZoom: true,
    enableDamping: true,
    dampingFactor: 0.08,
    rotateSpeed: 0.5,
    zoomSpeed: 0.5,
    minZoom: 1.5,
    maxZoom: 8,
    doubleClickReset: true,
    contextMenuEnabled: true,
  },
  startupSettings: {
    launchAtStartup: false,
    startMinimized: false,
    rememberPosition: true,
    lastPosition: null,
    lastSize: null,
    resumeLastTheme: true,
  },
  language: 'en',
};

export const FPS_LIMITS = [30, 60, 120, 144, 0] as const;

export const ZOOM_RANGE: [number, number] = [1.5, 8];
export const ROTATION_SPEED_RANGE: [number, number] = [0.1, 2.0];
export const ROUGHNESS_RANGE: [number, number] = [0, 1];
export const METALNESS_RANGE: [number, number] = [0, 1];
export const GLOW_RANGE: [number, number] = [0, 2];
export const BLOOM_RANGE: [number, number] = [0, 3];
