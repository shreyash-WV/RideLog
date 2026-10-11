import { create } from 'zustand';

interface LiveTelemetryState {
  speed: number;
  maxSpeed: number;
  distance: number;
  leanAngle: number;
  maxLeanAngle: number;
  setSpeed: (speed: number) => void;
  setDistance: (distance: number) => void;
  setLeanAngle: (angle: number) => void;
  reset: () => void;
}

export const useLiveTelemetryStore = create<LiveTelemetryState>((set) => ({
  speed: 0,
  maxSpeed: 0,
  distance: 0,
  leanAngle: 0,
  maxLeanAngle: 0,
  setSpeed: (speed) => set((state) => ({ 
    speed, 
    maxSpeed: Math.max(state.maxSpeed, speed) 
  })),
  setDistance: (distance) => set({ distance }),
  setLeanAngle: (angle) => set((state) => ({ 
    leanAngle: angle, 
    maxLeanAngle: Math.max(state.maxLeanAngle, angle) 
  })),
  reset: () => set({ speed: 0, maxSpeed: 0, distance: 0, leanAngle: 0, maxLeanAngle: 0 }),
}));
