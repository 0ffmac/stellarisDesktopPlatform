import { eventBus } from '../../core/events/EventBus';
import type { InteractionMode } from '../../shared/types';

export interface InteractionState {
  isDragging: boolean;
  isRotating: boolean;
  isPointerDown: boolean;
  pointerPosition: { x: number; y: number };
  pointerDelta: { x: number; y: number };
}

export class DesktopInteractionFeature {
  private state: InteractionState = {
    isDragging: false,
    isRotating: false,
    isPointerDown: false,
    pointerPosition: { x: 0, y: 0 },
    pointerDelta: { x: 0, y: 0 },
  };

  private mode: InteractionMode = 'interactive';
  private cleanupFns: (() => void)[] = [];

  constructor() {
    this.setupListeners();
  }

  private setupListeners(): void {
    const handlePointerDown = (e: PointerEvent) => {
      if (this.mode !== 'interactive') return;
      this.state.isPointerDown = true;
      this.state.pointerPosition = { x: e.clientX, y: e.clientY };
      this.state.pointerDelta = { x: 0, y: 0 };
      eventBus.emit('star:interaction-start', undefined);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!this.state.isPointerDown) return;
      this.state.pointerDelta = {
        x: e.clientX - this.state.pointerPosition.x,
        y: e.clientY - this.state.pointerPosition.y,
      };
      this.state.pointerPosition = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      if (!this.state.isPointerDown) return;
      this.state.isPointerDown = false;
      this.state.isDragging = false;
      this.state.isRotating = false;
      this.state.pointerDelta = { x: 0, y: 0 };
      eventBus.emit('star:interaction-end', undefined);
    };

    const pointerDownCleanup = eventBus.on('pointer:down', handlePointerDown);
    const pointerMoveCleanup = eventBus.on('pointer:move', handlePointerMove);
    const pointerUpCleanup = eventBus.on('pointer:up', handlePointerUp);

    const modeCleanup = eventBus.on('desktop:mode-change', (mode) => {
      this.mode = mode as InteractionMode;
    });

    this.cleanupFns = [pointerDownCleanup, pointerMoveCleanup, pointerUpCleanup, modeCleanup];
  }

  getState(): InteractionState {
    return { ...this.state };
  }

  setMode(mode: InteractionMode): void {
    this.mode = mode;
  }

  dispose(): void {
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns = [];
  }
}
