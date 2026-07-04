import { eventBus } from '../events/EventBus';
import type { InteractionMode } from '../../shared/types';

interface TauriWindow {
  show: () => Promise<void>;
  hide: () => Promise<void>;
  setIgnoreCursorEvents: (ignore: boolean) => Promise<void>;
  setAlwaysOnTop: (onTop: boolean) => Promise<void>;
  setFocus: () => Promise<void>;
  close: () => Promise<void>;
  onResized: (cb: () => void) => Promise<() => void>;
  onMoved: (cb: () => void) => Promise<() => void>;
  onFocusChanged: (cb: (focused: boolean) => void) => Promise<() => void>;
  onCloseRequested: (cb: () => void) => Promise<() => void>;
}

interface TauriAPI {
  invoke: (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;
  getCurrentWindow: () => TauriWindow;
}

export class TauriIntegration {
  private available = false;
  private api: TauriAPI | null = null;
  private cleanupFns: (() => void)[] = [];

  async initialize(): Promise<void> {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const { getCurrentWindow } = await import('@tauri-apps/api/window');

      this.api = {
        invoke,
        getCurrentWindow: getCurrentWindow as unknown as () => TauriWindow,
      };

      this.available = true;
      await this.setupWindowListeners();
    } catch {
      this.available = false;
    }
  }

  isAvailable(): boolean {
    return this.available;
  }

  async toggleClickThrough(enabled: boolean): Promise<void> {
    if (!this.available || !this.api) return;
    const win = this.api.getCurrentWindow();
    await win.setIgnoreCursorEvents(enabled);
  }

  async setInteractionMode(mode: InteractionMode): Promise<void> {
    if (!this.available || !this.api) return;
    try {
      await this.api.invoke('set_interaction_mode', { mode });
    } catch {
      const win = this.api.getCurrentWindow();
      await win.setIgnoreCursorEvents(mode === 'click_through');
    }
  }

  async show(): Promise<void> {
    if (!this.available || !this.api) return;
    const win = this.api.getCurrentWindow();
    await win.show();
    await win.setFocus();
  }

  async hide(): Promise<void> {
    if (!this.available || !this.api) return;
    const win = this.api.getCurrentWindow();
    await win.hide();
  }

  async setAlwaysOnTop(onTop: boolean): Promise<void> {
    if (!this.available || !this.api) return;
    const win = this.api.getCurrentWindow();
    await win.setAlwaysOnTop(onTop);
  }

  async getSystemInfo(): Promise<{ platform: string; arch: string; osVersion: string } | null> {
    if (!this.available || !this.api) return null;
    try {
      const info = await this.api.invoke('get_system_info') as {
        platform: string;
        arch: string;
        os_version: string;
      };
      return {
        platform: info.platform,
        arch: info.arch,
        osVersion: info.os_version,
      };
    } catch {
      return null;
    }
  }

  private async setupWindowListeners(): Promise<void> {
    if (!this.available || !this.api) return;
    const win = this.api.getCurrentWindow();

    const cleanupResize = await win.onResized(() => {
      eventBus.emit('renderer:resize', { width: 0, height: 0 });
    });

    const cleanupFocus = await win.onFocusChanged((focused: boolean) => {
      if (focused) {
        eventBus.emit('desktop:focus', undefined);
      } else {
        eventBus.emit('desktop:blur', undefined);
      }
    });

    this.cleanupFns.push(cleanupResize, cleanupFocus);
  }

  dispose(): void {
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns = [];
    this.api = null;
    this.available = false;
  }
}
