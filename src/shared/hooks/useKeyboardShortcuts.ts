import { useEffect, useCallback } from 'react';
import { eventBus } from '../../core/events/EventBus';

type ShortcutMap = Record<string, () => void>;

export function useKeyboardShortcuts(shortcuts: ShortcutMap): void {
  const handler = useCallback(
    (e: KeyboardEvent) => {
      const key = [
        e.metaKey ? 'Meta' : '',
        e.ctrlKey ? 'Ctrl' : '',
        e.altKey ? 'Alt' : '',
        e.shiftKey ? 'Shift' : '',
        e.key.length === 1 ? e.key.toUpperCase() : e.key,
      ]
        .filter(Boolean)
        .join('+');

      const action = shortcuts[key];
      if (action) {
        e.preventDefault();
        e.stopPropagation();
        action();
      }
    },
    [shortcuts],
  );

  useEffect(() => {
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handler]);
}

export function useTauriEvent(
  event: string,
  handler: (...args: unknown[]) => void,
): void {
  useEffect(() => {
    const cleanup = eventBus.on(event as never, handler as never);
    return cleanup;
  }, [event, handler]);
}
