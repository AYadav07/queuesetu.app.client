import { create } from "zustand";

type AuthUIState = {
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
};

export const useAuthUIStore = create<AuthUIState>((set) => ({
  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),
}));
