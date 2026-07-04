import { create } from 'zustand';
import type { StarState } from '../shared/types';
import { DEFAULT_STAR_STATE } from '../shared/constants/defaults';

interface StarStore {
  star: StarState;
  loading: boolean;
  progress: number;
  error: string | null;
  modelLoaded: boolean;

  setStar: (star: Partial<StarState>) => void;
  resetStar: () => void;
  setLoading: (loading: boolean) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  setModelLoaded: (loaded: boolean) => void;

  setPosition: (x: number, y: number) => void;
  setRotation: (x: number, y: number, z: number) => void;
  setScale: (s: number) => void;
  setRoughness: (v: number) => void;
  setMetalness: (v: number) => void;
  setGlowIntensity: (v: number) => void;
  setGlowEnabled: (v: boolean) => void;
  setWireframe: (v: boolean) => void;
  setAutoRotate: (v: boolean) => void;
  setAutoRotateSpeed: (v: number) => void;
  setBloom: (v: boolean) => void;
  setBloomIntensity: (v: number) => void;
}

export const useStarStore = create<StarStore>((set) => ({
  star: { ...DEFAULT_STAR_STATE },
  loading: true,
  progress: 0,
  error: null,
  modelLoaded: false,

  setStar: (partial) =>
    set((state) => ({ star: { ...state.star, ...partial } })),

  resetStar: () => set({ star: { ...DEFAULT_STAR_STATE } }),

  setLoading: (loading) => set({ loading }),
  setProgress: (progress) => set({ progress }),
  setError: (error) => set({ error }),
  setModelLoaded: (modelLoaded) => set({ modelLoaded }),

  setPosition: (x, y) =>
    set((state) => ({ star: { ...state.star, position: [x, y, state.star.position[2]] } })),
  setRotation: (x, y, z) =>
    set((state) => ({ star: { ...state.star, rotation: [x, y, z] } })),
  setScale: (s) =>
    set((state) => ({ star: { ...state.star, scale: [s, s, s] } })),
  setRoughness: (roughness) =>
    set((state) => ({ star: { ...state.star, roughness } })),
  setMetalness: (metalness) =>
    set((state) => ({ star: { ...state.star, metalness } })),
  setGlowIntensity: (glowIntensity) =>
    set((state) => ({ star: { ...state.star, glowIntensity } })),
  setGlowEnabled: (glowEnabled) =>
    set((state) => ({ star: { ...state.star, glowEnabled } })),
  setWireframe: (wireframe) =>
    set((state) => ({ star: { ...state.star, wireframe } })),
  setAutoRotate: (autoRotate) =>
    set((state) => ({ star: { ...state.star, autoRotate } })),
  setAutoRotateSpeed: (autoRotateSpeed) =>
    set((state) => ({ star: { ...state.star, autoRotateSpeed } })),
  setBloom: (bloom) =>
    set((state) => ({ star: { ...state.star, bloom } })),
  setBloomIntensity: (bloomIntensity) =>
    set((state) => ({ star: { ...state.star, bloomIntensity } })),
}));
