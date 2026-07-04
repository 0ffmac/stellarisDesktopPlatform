import { useRef } from 'react';
import { useDesktopStore } from '../../stores/useDesktopStore';
import { useUIStore } from '../../stores/useUIStore';

export function TitleBar() {
  const mode = useDesktopStore((s) => s.mode);
  const toolbarVisible = useUIStore((s) => s.toolbarVisible);
  const toggleToolbar = useUIStore((s) => s.toggleToolbar);
  const barRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = async (e: React.PointerEvent) => {
    if ((e.target as HTMLElement)?.closest('button')) return;
    e.preventDefault();
    e.stopPropagation();
    const bar = barRef.current;
    if (!bar) return;
    bar.setPointerCapture(e.pointerId);

    try {
      const { getCurrentWindow, PhysicalPosition } = await import('@tauri-apps/api/window');
      const win = getCurrentWindow();
      const startX = e.clientX;
      const startY = e.clientY;
      const { x: winX, y: winY } = await win.outerPosition();
      const totalDx = { current: 0 };
      const totalDy = { current: 0 };

      const onMove = (ev: PointerEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
        totalDx.current = ev.clientX - startX;
        totalDy.current = ev.clientY - startY;
        win.setPosition(new PhysicalPosition(
          Math.round(winX + totalDx.current),
          Math.round(winY + totalDy.current),
        ));
      };

      const onUp = (ev: PointerEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
        bar.removeEventListener('pointermove', onMove);
        bar.removeEventListener('pointerup', onUp);
      };

      bar.addEventListener('pointermove', onMove);
      bar.addEventListener('pointerup', onUp);
    } catch {
      /* not in Tauri */
    }
  };

  const handleWindowAction = (action: 'close' | 'minimize' | 'maximize') => {
    import('@tauri-apps/api/window').then(async ({ getCurrentWindow }) => {
      const win = getCurrentWindow();
      if (action === 'close') await win.close();
      if (action === 'minimize') await win.minimize();
      if (action === 'maximize') {
        const isMax = await win.isMaximized();
        if (isMax) await win.unmaximize();
        else await win.maximize();
      }
    });
  };

  if (!toolbarVisible) {
    return (
      <div
        className="absolute top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      >
        <button
          onClick={toggleToolbar}
          className="pointer-events-auto mt-0.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full
            bg-[var(--color-surface-overlay)]/60 backdrop-blur-md
            border border-white/10
            text-[9px] text-white/40 hover:text-white/70
            transition-all duration-200 opacity-0 hover:opacity-100"
          title="Show UI (Cmd+Shift+B)"
        >
          <span>⌃</span>
          <span>Show UI</span>
        </button>
      </div>
    );
  }

  return (
    <div
      ref={barRef}
      onPointerDown={handlePointerDown}
      className="absolute top-0 left-0 right-0 z-50 flex items-center select-none h-8
        bg-gradient-to-b from-white/[0.06] to-transparent backdrop-blur-sm
        hover:from-white/[0.1]
        transition-all duration-300"
    >
      <div className="flex-1 flex items-center gap-1 px-2 h-full cursor-grab active:cursor-grabbing">
        <span className="text-[10px] text-white/40 font-medium tracking-widest uppercase">
          Stellaris
        </span>
        <span className="w-1 h-1 rounded-full bg-white/20" />
        <span className="text-[10px] text-white/25">
          {mode === 'click_through' ? 'Click-Through' : mode === 'locked' ? 'Locked' : 'Interactive'}
        </span>
      </div>

      <div className="flex items-center gap-1 px-2 h-full">
        <WindowButton label="Toggle UI" icon="⊙" onClick={toggleToolbar} />
        <WindowButton label="Minimize" icon="−" onClick={() => handleWindowAction('minimize')} />
        <WindowButton label="Maximize" icon="□" onClick={() => handleWindowAction('maximize')} />
        <WindowButton label="Close" icon="✕" onClick={() => handleWindowAction('close')} />
      </div>
    </div>
  );
}

function WindowButton({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={label}
      className="flex items-center justify-center w-6 h-6 rounded text-[10px] text-white/30 hover:text-white/80 hover:bg-white/10 transition-all duration-150"
    >
      {icon}
    </button>
  );
}
