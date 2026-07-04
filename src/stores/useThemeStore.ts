import { create } from 'zustand';
import type { ThemeId } from '../shared/types';
import { THEMES, getThemeById } from '../shared/constants/themes';
import type { ThemeDefinition } from '../shared/types/theme.types';

interface ThemeStore {
  activeThemeId: ThemeId;
  activeTheme: ThemeDefinition;
  availableThemes: ThemeDefinition[];

  setTheme: (id: ThemeId) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  activeThemeId: 'classic-lantern',
  activeTheme: getThemeById('classic-lantern')!,
  availableThemes: THEMES,

  setTheme: (activeThemeId) => {
    const theme = getThemeById(activeThemeId);
    if (theme) {
      set({ activeThemeId, activeTheme: theme });
    }
  },
}));
