export type { StarConfig, StarState, StarTheme } from './star.types';
export type { RendererConfig, QualityPreset, PostProcessingConfig } from './renderer.types';
export type { AppSettings, ThemeSettings, DisplaySettings, InteractionSettings } from './settings.types';
export type { ThemeId, ThemeDefinition } from './theme.types';
export type { CelestialPlugin, PluginLifecycle } from './plugin.types';

export type InteractionMode = 'click_through' | 'interactive' | 'locked';
export type ScenePresetId = 'studio' | 'living-room' | 'christmas';
export type FPSLimit = 30 | 60 | 120 | 144 | 0;
export type Language = 'en' | 'fr' | 'de' | 'ja' | 'zh';
