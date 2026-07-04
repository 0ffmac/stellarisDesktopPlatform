import { useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Scene } from './Scene';
import { useStarStore } from '../../stores/useStarStore';
import { useUIStore } from '../../stores/useUIStore';
import { useDesktopStore } from '../../stores/useDesktopStore';


function FpsThrottle() {
  const { invalidate } = useThree();
  const visible = useRef(true);

  useEffect(() => {
    const onVisibility = () => {
      visible.current = !document.hidden;
      if (document.hidden) return;
      invalidate();
    };
    const onBlur = () => { visible.current = false; };
    const onFocus = () => { visible.current = true; invalidate(); };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);

    const id = setInterval(() => {
      if (visible.current) invalidate();
    }, 33);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, [invalidate]);

  return null;
}


export function Viewport() {
  const loading = useStarStore((s) => s.loading);
  const progress = useStarStore((s) => s.progress);
  const error = useStarStore((s) => s.error);
  const mode = useDesktopStore((s) => s.mode);
  const toolbarVisible = useUIStore((s) => s.toolbarVisible);
  const toggleToolbar = useUIStore((s) => s.toggleToolbar);
  const showContextMenu = useUIStore((s) => s.showContextMenu);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (mode === 'interactive' && !e.metaKey && !e.ctrlKey) {
      showContextMenu(e.clientX, e.clientY);
    }
  };

  const handleDoubleClick = () => {
    if (mode !== 'interactive') return;
    if (!toolbarVisible) {
      toggleToolbar();
    } else {
      useStarStore.getState().resetStar();
    }
  };

  return (
    <div
      className="absolute inset-0"
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
      style={{
        pointerEvents: mode === 'click_through' ? 'none' : 'auto',
      }}
    >
      <Canvas
        dpr={[1, 2]}
        frameloop="demand"
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        camera={{
          fov: 40,
          near: 0.1,
          far: 100,
          position: [0, 0, 3.5],
        }}
        style={{
          width: '100%',
          height: '100%',
          background: 'transparent',
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMappingExposure = 1.2;
        }}
      >
        <FpsThrottle />
        <Scene />
      </Canvas>

      {error && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-2 px-6 py-4 rounded-lg bg-[var(--color-surface-overlay)] border border-[var(--color-border)]">
            <span className="text-sm text-red-400">Failed to load star</span>
            <span className="text-xs text-[var(--color-text-secondary)]">{error}</span>
          </div>
        </div>
      )}

      {loading && !error && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface-overlay)] backdrop-blur-xl border border-[var(--color-border)]">
            <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
            <span className="text-xs text-[var(--color-text-secondary)]">
              {progress > 0 ? `${Math.round(progress)}%` : 'Loading star...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
