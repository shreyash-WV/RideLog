import { create } from 'zustand';
import { Bike } from '../types/models';

interface GarageState {
  bikes: Bike[];
  activeBikeId: string | null;
  setActiveBike: (id: string) => void;
  addBike: (bike: Bike) => void;
}

export const useGarageStore = create<GarageState>((set) => ({
  bikes: [],
  activeBikeId: null,
  setActiveBike: (id) => set({ activeBikeId: id }),
  addBike: (bike) => set((state) => ({ bikes: [...state.bikes, bike] })),
}));
