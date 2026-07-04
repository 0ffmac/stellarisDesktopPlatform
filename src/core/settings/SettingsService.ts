import type { AppSettings } from '../../shared/types';
import { DEFAULT_SETTINGS } from '../../shared/constants/defaults';
import { eventBus } from '../events/EventBus';

interface StoreAPI {
  get: <T>(key: string) => Promise<T | null>;
  set: (key: string, value: unknown) => Promise<void>;
  save: () => Promise<void>;
}

export class SettingsService {
  private static instance: SettingsService;
  private settings: AppSettings;
  private initialized = false;
  private store: StoreAPI | null = null;

  private constructor() {
    this.settings = this.cloneDefaults();
  }

  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const { load } = await import('@tauri-apps/plugin-store');
      const store = await load('settings.json');
      this.store = {
        get: async <T>(key: string): Promise<T | null> => {
          const val = await store.get<T>(key);
          return val ?? null;
        },
        set: async (key: string, value: unknown) => {
          await store.set(key, value);
        },
        save: async () => {
          await store.save();
        },
      };
      const stored = await this.store.get<Partial<AppSettings>>('app_settings');
      if (stored) {
        this.settings = this.mergeSettings(this.cloneDefaults(), stored);
      }
    } catch {
      this.store = null;
    }

    this.initialized = true;
    eventBus.emit('settings:loaded', undefined);
  }

  get<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.settings[key];
  }

  getNested<K1 extends keyof AppSettings, K2 extends keyof AppSettings[K1]>(
    key1: K1,
    key2: K2,
  ): AppSettings[K1][K2] {
    return this.settings[key1][key2];
  }

  async set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void> {
    (this.settings as any)[key] = value;
    await this.persist();
    eventBus.emit('settings:changed', { key, value });
  }

  async setNested<K1 extends keyof AppSettings, K2 extends keyof AppSettings[K1]>(
    key1: K1,
    key2: K2,
    value: AppSettings[K1][K2],
  ): Promise<void> {
    (this.settings[key1] as any)[key2] = value;
    await this.persist();
    eventBus.emit('settings:changed', { key: `${key1}.${String(key2)}`, value });
  }

  getAll(): AppSettings {
    return { ...this.settings };
  }

  async reset(): Promise<void> {
    this.settings = this.cloneDefaults();
    await this.persist();
  }

  private async persist(): Promise<void> {
    if (this.store) {
      await this.store.set('app_settings', this.settings);
      await this.store.save();
    }
  }

  private cloneDefaults(): AppSettings {
    return JSON.parse(JSON.stringify(DEFAULT_SETTINGS)) as AppSettings;
  }

  private mergeSettings(base: AppSettings, override: Partial<AppSettings>): AppSettings {
    const merged = JSON.parse(JSON.stringify(base)) as AppSettings;
    for (const key of Object.keys(override) as (keyof AppSettings)[]) {
      const val = override[key];
      if (val !== undefined) {
        (merged as any)[key] = val;
      }
    }
    return merged;
  }
}

export const settingsService = SettingsService.getInstance();
