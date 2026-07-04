import { create } from 'zustand';
import type { InteractionMode } from '../shared/types';
import { desktopService } from '../core/desktop/DesktopService';

interface DesktopStore {
  mode: InteractionMode;
  isVisible: boolean;
  isFocused: boolean;
  isTauri: boolean;

  setMode: (mode: InteractionMode) => Promise<void>;
  toggleClickThrough: (enabled: boolean) => Promise<void>;
  show: () => Promise<void>;
  hide: () => Promise<void>;
  initialize: () => Promise<void>;
  setFocused: (focused: boolean) => void;
  setVisible: (visible: boolean) => void;
}

export const useDesktopStore = create<DesktopStore>((set) => ({
  mode: 'interactive',
  isVisible: true,
  isFocused: true,
  isTauri: false,

  initialize: async () => {
    await desktopService.initialize();
    set({
      isTauri: desktopService.isTauri(),
      mode: desktopService.getMode(),
    });
  },

  setMode: async (mode) => {
    await desktopService.setMode(mode);
    set({ mode });
  },

  toggleClickThrough: async (enabled) => {
    await desktopService.toggleClickThrough(enabled);
    set({ mode: enabled ? 'click_through' : 'interactive' });
  },

  show: async () => {
    await desktopService.show();
    set({ isVisible: true });
  },

  hide: async () => {
    await desktopService.hide();
    set({ isVisible: false });
  },

  setFocused: (isFocused) => set({ isFocused }),
  setVisible: (isVisible) => set({ isVisible }),
}));
