import { create } from 'zustand';
import { Ride } from '../types/models';

interface RideState {
  history: Ride[];
  activeRide: Partial<Ride> | null;
  isRecording: boolean;
  startRide: (bikeId: string) => void;
  stopRide: () => void;
  addRideToHistory: (ride: Ride) => void;
  updateRideSyncStatus: (rideId: string, status: Ride['syncStatus']) => void;
}

export const useRideStore = create<RideState>((set) => ({
  history: [],
  activeRide: null,
  isRecording: false,
  startRide: (bikeId) => set({ 
    isRecording: true, 
    activeRide: { bikeId, startTime: Date.now(), route: [] } 
  }),
  stopRide: () => set({ isRecording: false }),
  addRideToHistory: (ride) => set((state) => ({ 
    history: [{...ride, syncStatus: 'pending'}, ...state.history],
    activeRide: null,
    isRecording: false
  })),
  updateRideSyncStatus: (rideId, status) => set((state) => ({
    history: state.history.map(r => r.id === rideId ? { ...r, syncStatus: status } : r)
  })),
}));
