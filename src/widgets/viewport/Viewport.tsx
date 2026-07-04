import { useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Scene } from './Scene';
import { useStarStore } from '../../stores/useStarStore';
import { useUIStore } from '../../stores/useUIStore';
import { useDesktopStore } from '../../stores/useDesktopStore';
import { powerManager, LOW_POWER_FRAMERATE_MS } from '../../core/performance/PowerManager';


const IDLE_TIMEOUT_MS = 30_000;

function FpsThrottle() {
  const { invalidate } = useThree();
  const visible = useRef(true);
  const lastActivity = useRef(performance.now());
  const lowPower = useRef(false);
  const glowDisabled = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    powerManager.init();

    const unsubPower = powerManager.onBatteryChange(() => {
      lowPower.current = powerManager.state.isLowPower;
      if (powerManager.state.isLowPower && !glowDisabled.current) {
        glowDisabled.current = true;
        useStarStore.getState().setGlowEnabled(false);
      }
    });
    if (powerManager.state.isLowPower && !glowDisabled.current) {
      glowDisabled.current = true;
      useStarStore.getState().setGlowEnabled(false);
    }

    const schedule = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      const isIdle = performance.now() - lastActivity.current > IDLE_TIMEOUT_MS;
      const interval = lowPower.current || isIdle ? LOW_POWER_FRAMERATE_MS : 33;
      timerRef.current = setInterval(() => {
        if (!visible.current) return;
        const start = performance.now();
        invalidate();
        powerManager.recordFrame(performance.now() - start);
      }, interval);
    };

    const onActivity = () => {
      lastActivity.current = performance.now();
      if (!lowPower.current) schedule();
    };
    const onVisibility = () => {
      visible.current = !document.hidden;
      if (document.hidden) return;
      lastActivity.current = performance.now();
      invalidate();
      schedule();
    };
    const onBlur = () => { visible.current = false; };
    const onFocus = () => {
      visible.current = true;
      lastActivity.current = performance.now();
      invalidate();
      schedule();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    window.addEventListener('pointerdown', onActivity);
    window.addEventListener('pointermove', onActivity);
    window.addEventListener('keydown', onActivity);

    schedule();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      unsubPower();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('pointerdown', onActivity);
      window.removeEventListener('pointermove', onActivity);
      window.removeEventListener('keydown', onActivity);
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
