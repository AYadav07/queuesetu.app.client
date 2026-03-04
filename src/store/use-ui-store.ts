import { create } from "zustand";

type UIState = {
  isMobileMenuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  toggleMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMenu: () => set({ isMobileMenuOpen: false }),
}));
