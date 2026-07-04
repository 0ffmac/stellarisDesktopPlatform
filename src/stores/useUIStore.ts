import { create } from 'zustand';

type PanelId = 'settings' | null;

interface UIStore {
  activePanel: PanelId;
  contextMenuVisible: boolean;
  contextMenuPosition: { x: number; y: number };
  toolbarVisible: boolean;

  openPanel: (panel: PanelId) => void;
  closePanel: () => void;
  togglePanel: (panel: PanelId) => void;
  showContextMenu: (x: number, y: number) => void;
  hideContextMenu: () => void;
  setToolbarVisible: (visible: boolean) => void;
  toggleToolbar: () => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  activePanel: null,
  contextMenuVisible: false,
  contextMenuPosition: { x: 0, y: 0 },
  toolbarVisible: true,

  openPanel: (panel) => set({ activePanel: panel }),
  closePanel: () => set({ activePanel: null }),
  togglePanel: (panel) => {
    const current = get().activePanel;
    set({ activePanel: current === panel ? null : panel });
  },
  showContextMenu: (x, y) =>
    set({ contextMenuVisible: true, contextMenuPosition: { x, y } }),
  hideContextMenu: () => set({ contextMenuVisible: false }),
  setToolbarVisible: (toolbarVisible) => set({ toolbarVisible }),
  toggleToolbar: () => set((s) => ({ toolbarVisible: !s.toolbarVisible })),
}));
