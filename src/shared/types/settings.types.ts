import type { FPSLimit, InteractionMode, Language, ScenePresetId, ThemeId } from './index';

export interface AppSettings {
  version: string;
  themeSettings: ThemeSettings;
  displaySettings: DisplaySettings;
  interactionSettings: InteractionSettings;
  startupSettings: StartupSettings;
  language: Language;
}

export interface ThemeSettings {
  activeThemeId: ThemeId;
  customThemes: string[];
}

export interface DisplaySettings {
  fpsLimit: FPSLimit;
  qualityPreset: 'auto' | 'low' | 'medium' | 'high' | 'ultra';
  enableBloom: boolean;
  bloomIntensity: number;
  enableParticles: boolean;
  particleCount: number;
  enableShadows: boolean;
  shadowQuality: 'low' | 'medium' | 'high';
  targetMonitorId: string;
}

export interface InteractionSettings {
  mode: InteractionMode;
  enableRotation: boolean;
  enableDrag: boolean;
  enableZoom: boolean;
  enableDamping: boolean;
  dampingFactor: number;
  rotateSpeed: number;
  zoomSpeed: number;
  minZoom: number;
  maxZoom: number;
  doubleClickReset: boolean;
  contextMenuEnabled: boolean;
}

export interface StartupSettings {
  launchAtStartup: boolean;
  startMinimized: boolean;
  rememberPosition: boolean;
  lastPosition: [number, number] | null;
  lastSize: [number, number] | null;
  resumeLastTheme: boolean;
}

export interface SceneSettings {
  activeSceneId: ScenePresetId;
  backgroundColor: string;
  ambientIntensity: number;
  keyLightIntensity: number;
  fillLightIntensity: number;
}
