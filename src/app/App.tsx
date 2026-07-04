import { useEffect } from 'react';
import { Viewport } from '../widgets/viewport/Viewport';
import { Toolbar } from '../widgets/toolbar/Toolbar';
import { TitleBar } from '../widgets/title-bar/TitleBar';
import { SettingsPanel } from '../widgets/settings-panel/SettingsPanel';
import { ErrorBoundary } from '../shared/ui/ErrorBoundary';
import { useKeyboardShortcuts } from '../shared/hooks/useKeyboardShortcuts';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useDesktopStore } from '../stores/useDesktopStore';
import { useThemeStore } from '../stores/useThemeStore';
import { useStarStore } from '../stores/useStarStore';
import { useUIStore } from '../stores/useUIStore';
import { ContextMenu } from '../shared/ui/ContextMenu';


function useWindowShortcut(key: string, fn: () => void) {
  useEffect(() => {
    const parts = key.split('+');
    const matchKey = parts[parts.length - 1];
    const codeKey = matchKey.length === 1 ? `Key${matchKey.toUpperCase()}` : '';

    const handler = (e: KeyboardEvent) => {
      const matchMeta = parts.includes('Meta') ? e.metaKey : !e.metaKey;
      const matchCtrl = parts.includes('Ctrl') ? e.ctrlKey : !e.ctrlKey;
      const matchShift = parts.includes('Shift') ? e.shiftKey : !e.shiftKey;
      const actualKey = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      if (matchMeta && matchCtrl && matchShift && (actualKey === matchKey || e.code === codeKey)) {
        e.preventDefault();
        e.stopPropagation();
        fn();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, fn]);
}


export function App() {
  const initializeSettings = useSettingsStore((s) => s.initialize);
  const initializeDesktop = useDesktopStore((s) => s.initialize);
  const setError = useStarStore((s) => s.setError);
  const activePanel = useUIStore((s) => s.activePanel);
  const contextMenuVisible = useUIStore((s) => s.contextMenuVisible);
  const hideContextMenu = useUIStore((s) => s.hideContextMenu);
  const resetStar = useStarStore((s) => s.resetStar);
  const setTheme = useThemeStore((s) => s.setTheme);
  const togglePanel = useUIStore((s) => s.togglePanel);
  const toolbarVisible = useUIStore((s) => s.toolbarVisible);
  const toggleToolbar = useUIStore((s) => s.toggleToolbar);
  const mode = useDesktopStore((s) => s.mode);
  const toggleClickThrough = useDesktopStore((s) => s.toggleClickThrough);
  const closePanel = useUIStore((s) => s.closePanel);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeDesktop();
        await initializeSettings();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize');
      }
    };
    init();
  }, [initializeDesktop, initializeSettings, setError]);

  useEffect(() => {
    import('@tauri-apps/api/event').then(({ listen }) => {
      const unlisten1 = listen('toggle-ui', () => toggleToolbar());
      const unlisten2 = listen<string>('mode-changed', async (event) => {
        await useDesktopStore.getState().setMode(event.payload as any);
      });
      return () => {
        unlisten1.then((fn) => fn());
        unlisten2.then((fn) => fn());
      };
    });
  }, [toggleToolbar]);

  useKeyboardShortcuts({
    'Meta+Shift+H': () => {
      toggleClickThrough(mode !== 'click_through');
    },
    'Meta+Shift+R': () => {
      resetStar();
      setTheme('classic-lantern');
    },
    'Meta+Shift+P': toggleToolbar,
    'Escape': () => {
      hideContextMenu();
      if (activePanel) closePanel();
    },
  });

  useWindowShortcut('Meta+Shift+P', toggleToolbar);
  useWindowShortcut('Meta+Shift+B', toggleToolbar);

  const handleReset = () => {
    resetStar();
    setTheme('classic-lantern');
  };

  const uiHint = !toolbarVisible && (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none
      px-2.5 py-1 rounded-full bg-[var(--color-surface-overlay)]/30 backdrop-blur-sm border border-white/5
      text-[9px] text-white/20 transition-opacity duration-500">
      <span className="tracking-wide">Right-click or double-click for menu</span>
    </div>
  );

  return (
    <div className="relative w-full h-full overflow-hidden bg-transparent group">
      {uiHint}

      <TitleBar />

      <ErrorBoundary>
        <Viewport />
      </ErrorBoundary>

      <Toolbar />

      {activePanel === 'settings' && <SettingsPanel />}

      {contextMenuVisible && (
        <ContextMenu
          onClose={hideContextMenu}
          items={[
            { label: 'Reset View', action: handleReset },
            { label: 'Toggle UI', action: toggleToolbar },
            { label: 'Toggle Click-Through', action: () => toggleClickThrough(mode !== 'click_through') },
            { label: 'Settings', action: () => togglePanel('settings') },
            { separator: true },
            { label: 'Minimize', action: () => import('@tauri-apps/api/window').then(({ getCurrentWindow }) => getCurrentWindow().minimize()) },
            { label: 'Maximize', action: () => import('@tauri-apps/api/window').then(async ({ getCurrentWindow }) => { const w = getCurrentWindow(); (await w.isMaximized()) ? w.unmaximize() : w.maximize(); }) },
            { label: 'Close', action: () => import('@tauri-apps/api/window').then(({ getCurrentWindow }) => getCurrentWindow().close()) },
          ]}
        />
      )}
    </div>
  );
}
