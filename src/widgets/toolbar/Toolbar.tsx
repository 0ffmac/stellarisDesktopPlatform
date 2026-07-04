import { useState } from 'react';
import { useUIStore } from '../../stores/useUIStore';
import { useDesktopStore } from '../../stores/useDesktopStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { useStarStore } from '../../stores/useStarStore';
import { THEMES } from '../../shared/constants/themes';

export function Toolbar() {
  const [showThemePicker, setShowThemePicker] = useState(false);
  const togglePanel = useUIStore((s) => s.togglePanel);
  const mode = useDesktopStore((s) => s.mode);
  const setMode = useDesktopStore((s) => s.setMode);
  const activeThemeId = useThemeStore((s) => s.activeThemeId);
  const setTheme = useThemeStore((s) => s.setTheme);
  const autoRotate = useStarStore((s) => s.star.autoRotate);
  const setAutoRotate = useStarStore((s) => s.setAutoRotate);
  const wireframe = useStarStore((s) => s.star.wireframe);
  const setWireframe = useStarStore((s) => s.setWireframe);
  const resetStar = useStarStore((s) => s.resetStar);

  const toolbarVisible = useUIStore((s) => s.toolbarVisible);

  if (!toolbarVisible) return null;

  return (
    <div className="absolute top-12 left-1/2 -translate-x-1/2 z-10">
      <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-[var(--color-surface-overlay)] backdrop-blur-xl border border-[var(--color-border)] shadow-lg">
        <ToolbarButton
          label="Theme"
          icon="◇"
          active={showThemePicker}
          onClick={() => setShowThemePicker((v) => !v)}
        />

        <div className="w-px h-4 bg-[var(--color-border)]" />

        <ToolbarButton
          label={autoRotate ? 'Pause' : 'Rotate'}
          icon="⟳"
          active={autoRotate}
          onClick={() => setAutoRotate(!autoRotate)}
        />

        <ToolbarButton
          label="Reset"
          icon="⟲"
          onClick={resetStar}
        />

        <ToolbarButton
          label={wireframe ? 'Solid' : 'Wireframe'}
          icon="◇"
          active={wireframe}
          onClick={() => setWireframe(!wireframe)}
        />

        <div className="w-px h-4 bg-[var(--color-border)]" />

        <ToolbarButton
          label={mode === 'click_through' ? 'Lock' : mode === 'locked' ? 'Locked' : 'Free'}
          icon={mode === 'click_through' ? '🔒' : '🔓'}
          active={mode !== 'interactive'}
          onClick={() => {
            if (mode === 'interactive') {
              setMode('click_through');
            } else {
              setMode('interactive');
            }
          }}
        />

        <div className="w-px h-4 bg-[var(--color-border)]" />

        <ToolbarButton
          label="Settings"
          icon="⚙"
          onClick={() => togglePanel('settings')}
        />
      </div>

      {showThemePicker && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 rounded-xl bg-[var(--color-surface-overlay)] backdrop-blur-xl border border-[var(--color-border)] shadow-lg min-w-[200px]">
          <div className="grid grid-cols-3 gap-1.5">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  setTheme(theme.id);
                  setShowThemePicker(false);
                }}
                className={`
                  flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200
                  ${activeThemeId === theme.id
                    ? 'bg-[var(--color-accent)] ring-1 ring-white/20'
                    : 'hover:bg-white/5'
                  }
                `}
              >
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: String(theme.emissiveColor) }}
                />
                <span className="text-[10px] text-[var(--color-text-secondary)] leading-tight text-center">
                  {theme.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`
        flex items-center justify-center w-8 h-8 rounded-lg text-sm
        transition-all duration-150
        ${active
          ? 'bg-[var(--color-accent)] text-white'
          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5'
        }
      `}
    >
      {icon}
    </button>
  );
}
