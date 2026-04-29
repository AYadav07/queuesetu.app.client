"use client";

import { useEffect, useState } from "react";
import { X, AlertCircle, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { useToastStore, type ToastType } from "@/store/use-toast-store";

const styles: Record<ToastType, { wrapper: string; icon: React.ReactNode }> = {
  error: {
    wrapper: "border-red-200 bg-red-50 text-red-800",
    icon: <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />,
  },
  warn: {
    wrapper: "border-amber-200 bg-amber-50 text-amber-800",
    icon: <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />,
  },
  info: {
    wrapper: "border-blue-200 bg-blue-50 text-blue-800",
    icon: <Info className="h-4 w-4 shrink-0 text-blue-500" />,
  },
  success: {
    wrapper: "border-green-200 bg-green-50 text-green-800",
    icon: <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />,
  },
};

function ToastItem({
  id,
  message,
  type,
}: {
  id: string;
  message: string;
  type: ToastType;
}) {
  const remove = useToastStore((s) => s.removeToast);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation on mount
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const { wrapper, icon } = styles[type];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-md transition-all duration-300 ${wrapper} ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      {icon}
      <p className="flex-1 text-sm font-medium leading-snug">{message}</p>
      <button
        onClick={() => remove(id)}
        aria-label="Dismiss notification"
        className="ml-1 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      aria-label="Notifications"
      className="pointer-events-none fixed bottom-6 right-6 z-9999 flex w-80 flex-col gap-2"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem {...t} />
        </div>
      ))}
    </div>
  );
}
