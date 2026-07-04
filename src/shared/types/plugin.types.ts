export interface PluginLifecycle {
  initialize(): Promise<void>;
  update(deltaTime: number): void;
  dispose(): void;
}

export interface CelestialPlugin extends PluginLifecycle {
  id: string;
  name: string;
  version: string;
  serialize(): Record<string, unknown>;
  deserialize(data: Record<string, unknown>): void;
}
