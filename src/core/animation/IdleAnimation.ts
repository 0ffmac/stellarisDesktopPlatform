import { animationController, type AnimationClip } from './AnimationController';

export interface IdleAnimationConfig {
  floatingAmplitude: number;
  floatingFrequency: number;
  rotationSpeed: number;
}

const DEFAULT_CONFIG: IdleAnimationConfig = {
  floatingAmplitude: 0.05,
  floatingFrequency: 0.3,
  rotationSpeed: 0.15,
};

export class IdleAnimation {
  private config: IdleAnimationConfig;
  private clipId = 'star-idle';

  constructor(config: Partial<IdleAnimationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  start(
    onUpdate: (rotation: number, floatingOffset: number) => void,
  ): void {
    const clip: AnimationClip = {
      id: this.clipId,
      loop: true,
      yoyo: true,
      keyframes: [
        {
          target: { floatOffset: this.config.floatingAmplitude, rotY: this.config.rotationSpeed },
          duration: 2000 / this.config.floatingFrequency,
          easing: (t) => Math.sin(t * Math.PI * 2) * 0.5 + 0.5,
        },
      ],
    };

    const object = { floatOffset: 0, rotY: 0 };

    animationController.play(clip, object, (state) => {
      onUpdate(state.floatOffset, state.rotY);
    });
  }

  stop(): void {
    animationController.stop(this.clipId);
  }

  updateConfig(config: Partial<IdleAnimationConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
