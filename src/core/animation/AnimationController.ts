export type EasingFn = (t: number) => number;

export const Easing = {
  linear: (t: number) => t,
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeOutElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  easeInOutBack: (t: number) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
};

export interface AnimationKeyframe {
  target: Record<string, number>;
  duration: number;
  easing?: EasingFn;
  onComplete?: () => void;
}

export interface AnimationClip {
  id: string;
  keyframes: AnimationKeyframe[];
  loop?: boolean;
  yoyo?: boolean;
}

type AnimatedObject = Record<string, number>;

export class AnimationController {
  private animations = new Map<string, AnimationState>();
  private frameId: number | null = null;
  private lastTime = 0;

  play(clip: AnimationClip, object: AnimatedObject, onUpdate: (obj: AnimatedObject) => void): void {
    this.stop(clip.id);

    const state: AnimationState = {
      clip,
      object: { ...object },
      onUpdate,
      currentKeyframe: 0,
      elapsed: 0,
      playing: true,
      direction: 1,
    };

    this.animations.set(clip.id, state);
    this.startLoop();
  }

  stop(id: string): void {
    this.animations.delete(id);
    if (this.animations.size === 0) {
      this.stopLoop();
    }
  }

  pause(id: string): void {
    const state = this.animations.get(id);
    if (state) state.playing = false;
  }

  resume(id: string): void {
    const state = this.animations.get(id);
    if (state) state.playing = true;
  }

  isPlaying(id: string): boolean {
    return this.animations.get(id)?.playing ?? false;
  }

  stopAll(): void {
    this.animations.clear();
    this.stopLoop();
  }

  private startLoop(): void {
    if (this.frameId !== null) return;
    this.lastTime = performance.now();
    const tick = (now: number) => {
      const dt = (now - this.lastTime) / 1000;
      this.lastTime = now;
      this.update(dt);
      this.frameId = requestAnimationFrame(tick);
    };
    this.frameId = requestAnimationFrame(tick);
  }

  private stopLoop(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  private update(dt: number): void {
    for (const [id, state] of this.animations) {
      if (!state.playing) continue;

      const keyframe = state.clip.keyframes[state.currentKeyframe];
      state.elapsed += dt * 1000;

      const progress = Math.min(state.elapsed / keyframe.duration, 1);
      const eased = keyframe.easing ? keyframe.easing(progress) : progress;

      for (const prop of Object.keys(keyframe.target)) {
        const start = state.object[prop] ?? 0;
        const end = keyframe.target[prop];
        state.object[prop] = start + (end - start) * eased;
      }

      state.onUpdate({ ...state.object });

      if (progress >= 1) {
        Object.assign(state.object, keyframe.target);
        keyframe.onComplete?.();

        if (state.currentKeyframe < state.clip.keyframes.length - 1) {
          state.currentKeyframe++;
          state.elapsed = 0;

          const nextKeyframe = state.clip.keyframes[state.currentKeyframe];
          for (const prop of Object.keys(nextKeyframe.target)) {
            state.object[prop] = keyframe.target[prop] ?? state.object[prop];
          }
        } else if (state.clip.loop) {
          state.currentKeyframe = 0;
          state.elapsed = 0;

          if (state.clip.yoyo) {
            state.clip.keyframes = state.clip.keyframes.slice().reverse();
          }
        } else {
          state.playing = false;
          this.animations.delete(id);
        }
      }
    }

    if (this.animations.size === 0) {
      this.stopLoop();
    }
  }
}

interface AnimationState {
  clip: AnimationClip;
  object: AnimatedObject;
  onUpdate: (obj: AnimatedObject) => void;
  currentKeyframe: number;
  elapsed: number;
  playing: boolean;
  direction: 1 | -1;
}

export const animationController = new AnimationController();
