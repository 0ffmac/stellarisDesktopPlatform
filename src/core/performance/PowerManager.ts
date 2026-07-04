import { eventBus } from '../events/EventBus';

export interface PowerState {
  isLowPower: boolean;
  isBatteryLow: boolean;
  isBatteryCharging: boolean;
  avgFrameTimeMs: number;
  scaledDpr: number;
}

interface BatteryManager {
  level: number;
  charging: boolean;
  addEventListener: (event: string, handler: () => void) => void;
}

const BATTERY_LOW_THRESHOLD = 0.2;
const FRAME_WINDOW_SIZE = 30;
const SLOW_FRAME_THRESHOLD_MS = 50;
const LOW_POWER_FRAMERATE = 15;

export class PowerManager {
  private battery: { level: number; charging: boolean } | null = null;
  private frameTimes: number[] = [];
  private _state: PowerState = {
    isLowPower: false,
    isBatteryLow: false,
    isBatteryCharging: true,
    avgFrameTimeMs: 16,
    scaledDpr: 2,
  };
  private batteryListeners: (() => void)[] = [];

  async init(): Promise<void> {
    try {
      const bat = await (navigator as any).getBattery() as BatteryManager;
      this.battery = { level: bat.level, charging: bat.charging };
      bat.addEventListener('levelchange', () => {
        if (!this.battery) return;
        this.battery.level = bat.level;
        this.checkPowerState();
      });
      bat.addEventListener('chargingchange', () => {
        if (!this.battery) return;
        this.battery.charging = bat.charging;
        this.checkPowerState();
      });
    } catch {
      this.battery = null;
    }
    this.checkPowerState();
  }

  get state(): PowerState {
    return { ...this._state };
  }

  recordFrame(frameTimeMs: number): void {
    this.frameTimes.push(frameTimeMs);
    if (this.frameTimes.length > FRAME_WINDOW_SIZE) {
      this.frameTimes.shift();
    }
    const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    this._state.avgFrameTimeMs = Math.round(avg * 10) / 10;
    this.checkPowerState();
  }

  onBatteryChange(fn: () => void): () => void {
    this.batteryListeners.push(fn);
    return () => {
      this.batteryListeners = this.batteryListeners.filter((l) => l !== fn);
    };
  }

  private checkPowerState(): void {
    const wasLow = this._state.isLowPower;
    const isBatteryLow = this.battery !== null && !this.battery.charging && this.battery.level < BATTERY_LOW_THRESHOLD;
    const isSlowFrames = this._state.avgFrameTimeMs > SLOW_FRAME_THRESHOLD_MS;
    const isLowPower = isBatteryLow || isSlowFrames;

    this._state.isLowPower = isLowPower;
    this._state.isBatteryLow = isBatteryLow;
    this._state.isBatteryCharging = this.battery?.charging ?? true;
    this._state.scaledDpr = isLowPower ? 1 : 2;

    if (isLowPower !== wasLow) {
      eventBus.emit('renderer:power-change', isLowPower ? 'low' : 'normal');
      this.batteryListeners.forEach((fn) => fn());
    }
  }
}

export const powerManager = new PowerManager();
export const LOW_POWER_FRAMERATE_MS = Math.round(1000 / LOW_POWER_FRAMERATE);
