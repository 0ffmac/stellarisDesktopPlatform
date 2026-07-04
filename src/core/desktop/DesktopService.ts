import { eventBus } from '../events/EventBus';
import type { InteractionMode } from '../../shared/types';
import { TauriIntegration } from './TauriIntegration';

export interface DesktopWindowState {
  isVisible: boolean;
  isFocused: boolean;
  width: number;
  height: number;
  x: number;
  y: number;
}

export class DesktopService {
  private static instance: DesktopService;
  private mode: InteractionMode = 'interactive';
  private windowState: DesktopWindowState = {
    isVisible: true,
    isFocused: true,
    width: 800,
    height: 600,
    x: 0,
    y: 0,
  };
  private tauri: TauriIntegration;

  private constructor() {
    this.tauri = new TauriIntegration();
    this.setupEventListeners();
  }

  static getInstance(): DesktopService {
    if (!DesktopService.instance) {
      DesktopService.instance = new DesktopService();
    }
    return DesktopService.instance;
  }

  private setupEventListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => {
        this.windowState.isFocused = true;
        eventBus.emit('desktop:focus', undefined);
      });

      window.addEventListener('blur', () => {
        this.windowState.isFocused = false;
        eventBus.emit('desktop:blur', undefined);
      });
    }
  }

  async initialize(): Promise<void> {
    await this.tauri.initialize();
  }

  getMode(): InteractionMode {
    return this.mode;
  }

  async setMode(mode: InteractionMode): Promise<void> {
    this.mode = mode;
    await this.tauri.setInteractionMode(mode);
    eventBus.emit('desktop:mode-change', mode);
  }

  async toggleClickThrough(enabled: boolean): Promise<void> {
    await this.tauri.toggleClickThrough(enabled);
    this.mode = enabled ? 'click_through' : 'interactive';
    eventBus.emit('desktop:mode-change', this.mode);
  }

  async show(): Promise<void> {
    await this.tauri.show();
    this.windowState.isVisible = true;
    eventBus.emit('desktop:show', undefined);
  }

  async hide(): Promise<void> {
    await this.tauri.hide();
    this.windowState.isVisible = false;
    eventBus.emit('desktop:hide', undefined);
  }

  getWindowState(): DesktopWindowState {
    return { ...this.windowState };
  }

  isTauri(): boolean {
    return this.tauri.isAvailable();
  }

  async getSystemInfo(): Promise<{ platform: string; arch: string; osVersion: string } | null> {
    return this.tauri.getSystemInfo();
  }

  dispose(): void {
    this.tauri.dispose();
  }
}

export const desktopService = DesktopService.getInstance();
