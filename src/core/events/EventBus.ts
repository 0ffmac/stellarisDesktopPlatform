export type Listener<T = unknown> = (payload: T) => void;

export interface EventMap {
  'pointer:down': PointerEvent;
  'pointer:move': PointerEvent;
  'pointer:up': PointerEvent;
  'pointer:double-click': PointerEvent;
  'pointer:right-click': PointerEvent;
  'keyboard:keydown': KeyboardEvent;
  'keyboard:keyup': KeyboardEvent;
  'desktop:mode-change': string;
  'desktop:hide': void;
  'desktop:show': void;
  'desktop:focus': void;
  'desktop:blur': void;
  'settings:changed': { key: string; value: unknown };
  'settings:loaded': void;
  'theme:changed': string;
  'renderer:frame': number;
  'renderer:quality-change': string;
  'renderer:resize': { width: number; height: number };
  'renderer:power-change': 'low' | 'normal';
  'star:loaded': void;
  'star:interaction-start': void;
  'star:interaction-end': void;
  'ipc:settings-get': string;
  'ipc:settings-set': { key: string; value: unknown };
  'plugin:register': string;
  'plugin:unregister': string;
  'app:before-quit': void;
}

export type EventName = keyof EventMap;

export class EventBus {
  private listeners = new Map<string, Set<Listener>>();
  private onceListeners = new Map<string, Set<Listener>>();

  on<K extends EventName>(event: K, listener: Listener<EventMap[K]>): () => void {
    return this.addListener(event, listener as Listener);
  }

  once<K extends EventName>(event: K, listener: Listener<EventMap[K]>): () => void {
    return this.addListener(event, listener as Listener, true);
  }

  off<K extends EventName>(event: K, listener: Listener<EventMap[K]>): void {
    this.listeners.get(event)?.delete(listener as Listener);
    this.onceListeners.get(event)?.delete(listener as Listener);
  }

  emit<K extends EventName>(event: K, payload: EventMap[K]): void {
    this.listeners.get(event)?.forEach((listener) => {
      try {
        listener(payload);
      } catch (error) {
        console.error(`[EventBus] Error in listener for "${event}":`, error);
      }
    });

    this.onceListeners.get(event)?.forEach((listener) => {
      try {
        listener(payload);
      } catch (error) {
        console.error(`[EventBus] Error in once-listener for "${event}":`, error);
      }
    });
    this.onceListeners.delete(event);
  }

  clear(): void {
    this.listeners.clear();
    this.onceListeners.clear();
  }

  listenerCount(event: EventName): number {
    return (this.listeners.get(event)?.size ?? 0) + (this.onceListeners.get(event)?.size ?? 0);
  }

  private addListener(event: string, listener: Listener, once = false): () => void {
    const map = once ? this.onceListeners : this.listeners;
    if (!map.has(event)) {
      map.set(event, new Set());
    }
    map.get(event)!.add(listener);

    return () => {
      this.listeners.get(event)?.delete(listener);
      this.onceListeners.get(event)?.delete(listener);
    };
  }
}

export const eventBus = new EventBus();
