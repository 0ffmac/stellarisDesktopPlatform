import { create } from 'zustand';
import type { AppSettings, InteractionMode, FPSLimit, Language, ThemeId } from '../shared/types';
import { DEFAULT_SETTINGS } from '../shared/constants/defaults';
import { settingsService } from '../core/settings/SettingsService';

interface SettingsStore {
  settings: AppSettings;
  initialized: boolean;

  initialize: () => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;

  setThemeId: (id: ThemeId) => Promise<void>;
  setInteractionMode: (mode: InteractionMode) => Promise<void>;
  setFPSLimit: (limit: FPSLimit) => Promise<void>;
  setQualityPreset: (preset: AppSettings['displaySettings']['qualityPreset']) => Promise<void>;
  setLanguage: (lang: Language) => Promise<void>;
  setLaunchAtStartup: (enabled: boolean) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: { ...DEFAULT_SETTINGS },
  initialized: false,

  initialize: async () => {
    await settingsService.initialize();
    set({
      settings: settingsService.getAll(),
      initialized: true,
    });
  },

  updateSettings: async (partial) => {
    const current = get().settings;
    const merged = { ...current, ...partial };
    await settingsService.set('themeSettings', merged.themeSettings);
    set({ settings: merged });
  },

  setThemeId: async (activeThemeId) => {
    const current = get().settings;
    const themeSettings = { ...current.themeSettings, activeThemeId };
    await settingsService.setNested('themeSettings', 'activeThemeId', activeThemeId);
    set({ settings: { ...current, themeSettings } });
  },

  setInteractionMode: async (mode) => {
    const current = get().settings;
    const interactionSettings = { ...current.interactionSettings, mode };
    await settingsService.set('interactionSettings', interactionSettings);
    set({ settings: { ...current, interactionSettings } });
  },

  setFPSLimit: async (fpsLimit) => {
    const current = get().settings;
    const displaySettings = { ...current.displaySettings, fpsLimit };
    await settingsService.set('displaySettings', displaySettings);
    set({ settings: { ...current, displaySettings } });
  },

  setQualityPreset: async (qualityPreset) => {
    const current = get().settings;
    const displaySettings = { ...current.displaySettings, qualityPreset };
    await settingsService.set('displaySettings', displaySettings);
    set({ settings: { ...current, displaySettings } });
  },

  setLanguage: async (language) => {
    const current = get().settings;
    await settingsService.set('language', language);
    set({ settings: { ...current, language } });
  },

  setLaunchAtStartup: async (launchAtStartup) => {
    const current = get().settings;
    const startupSettings = { ...current.startupSettings, launchAtStartup };
    await settingsService.set('startupSettings', startupSettings);
    set({ settings: { ...current, startupSettings } });
  },

  resetSettings: async () => {
    await settingsService.reset();
    set({ settings: settingsService.getAll() });
  },
}));
