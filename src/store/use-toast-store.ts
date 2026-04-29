import { create } from "zustand";

export type ToastType = "error" | "warn" | "info" | "success";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 5000);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

/** Imperative helpers — call these outside React components */
export const toast = {
  error: (message: string) =>
    useToastStore.getState().addToast(message, "error"),
  warn: (message: string) => useToastStore.getState().addToast(message, "warn"),
  info: (message: string) => useToastStore.getState().addToast(message, "info"),
  success: (message: string) =>
    useToastStore.getState().addToast(message, "success"),
};
