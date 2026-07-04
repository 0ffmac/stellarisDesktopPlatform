import { useRef, useCallback, useEffect } from 'react';
import { eventBus } from '../../core/events/EventBus';

interface PointerCaptureOptions {
  element?: HTMLElement | null;
  enabled?: boolean;
}

export function usePointerCapture({ element, enabled = true }: PointerCaptureOptions = {}) {
  const elementRef = useRef<HTMLElement | null>(element ?? null);

  const setRef = useCallback((node: HTMLElement | null) => {
    elementRef.current = node;
  }, []);

  useEffect(() => {
    const el = element ?? elementRef.current;
    if (!el || !enabled) return;

    const handlePointerDown = (e: PointerEvent) => {
      el.setPointerCapture(e.pointerId);
      eventBus.emit('pointer:down', e);
    };

    const handlePointerMove = (e: PointerEvent) => {
      eventBus.emit('pointer:move', e);
    };

    const handlePointerUp = (e: PointerEvent) => {
      eventBus.emit('pointer:up', e);
    };

    const handleDoubleClick = (e: MouseEvent) => {
      eventBus.emit('pointer:double-click', e as unknown as PointerEvent);
    };

    const handleContextMenu = (e: MouseEvent) => {
      eventBus.emit('pointer:right-click', e as unknown as PointerEvent);
    };

    el.addEventListener('pointerdown', handlePointerDown);
    el.addEventListener('pointermove', handlePointerMove);
    el.addEventListener('pointerup', handlePointerUp);
    el.addEventListener('dblclick', handleDoubleClick);
    el.addEventListener('contextmenu', handleContextMenu);

    return () => {
      el.removeEventListener('pointerdown', handlePointerDown);
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerup', handlePointerUp);
      el.removeEventListener('dblclick', handleDoubleClick);
      el.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [element, enabled]);

  return { ref: setRef };
}
