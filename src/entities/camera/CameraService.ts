import { Vector3 } from 'three';
import type { Camera, PerspectiveCamera, OrthographicCamera } from 'three';

export type CameraMode = 'perspective' | 'orthographic';

export interface CameraConfig {
  mode: CameraMode;
  fov: number;
  near: number;
  far: number;
  position: Vector3;
  target: Vector3;
  zoom: number;
  zoomMin: number;
  zoomMax: number;
  orthographicSize: number;
}

const DEFAULT_CONFIG: CameraConfig = {
  mode: 'perspective',
  fov: 40,
  near: 0.1,
  far: 100,
  position: new Vector3(0, 0, 3.5),
  target: new Vector3(0, 0, 0),
  zoom: 1,
  zoomMin: 0.5,
  zoomMax: 3,
  orthographicSize: 5,
};

function isCameraWithProjection(camera: Camera): camera is PerspectiveCamera | OrthographicCamera {
  return 'updateProjectionMatrix' in camera;
}

export class CameraService {
  private config: CameraConfig;
  private camera: Camera | null = null;

  constructor(config: Partial<CameraConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.config.position = config.position ?? DEFAULT_CONFIG.position.clone();
    this.config.target = config.target ?? DEFAULT_CONFIG.target.clone();
  }

  setCamera(camera: Camera): void {
    this.camera = camera;
    this.applyConfig();
  }

  getCamera(): Camera | null {
    return this.camera;
  }

  getConfig(): CameraConfig {
    return { ...this.config, position: this.config.position.clone(), target: this.config.target.clone() };
  }

  setMode(mode: CameraMode): void {
    this.config.mode = mode;
  }

  setPosition(x: number, y: number, z: number): void {
    this.config.position.set(x, y, z);
    if (this.camera) {
      this.camera.position.set(x, y, z);
    }
  }

  setTarget(x: number, y: number, z: number): void {
    this.config.target.set(x, y, z);
  }

  setZoom(zoom: number): void {
    this.config.zoom = Math.max(this.config.zoomMin, Math.min(this.config.zoomMax, zoom));
  }

  reset(): void {
    this.config.position.copy(DEFAULT_CONFIG.position);
    this.config.target.copy(DEFAULT_CONFIG.target);
    this.config.zoom = DEFAULT_CONFIG.zoom;
    this.applyConfig();
  }

  applyConfig(): void {
    if (!this.camera) return;
    this.camera.position.copy(this.config.position);
    this.camera.lookAt(this.config.target);
    if ('zoom' in this.camera) {
      (this.camera as PerspectiveCamera | OrthographicCamera).zoom = this.config.zoom;
    }
    if (isCameraWithProjection(this.camera)) {
      this.camera.updateProjectionMatrix();
    }
  }

  dispose(): void {
    this.camera = null;
  }
}
