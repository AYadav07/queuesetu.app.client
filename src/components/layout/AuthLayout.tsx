"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center lg:max-w-6xl">
        <div className="grid w-full overflow-hidden rounded-xl shadow-sm lg:min-h-160 lg:grid-cols-2">
          <aside className="relative hidden overflow-hidden bg-teal-700 p-10 text-white lg:flex lg:flex-col lg:justify-center">
            <div
              aria-hidden="true"
              className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-teal-400/30 blur-2xl"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-2xl"
            />

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative"
            >
              <p className="text-3xl font-bold tracking-tight">QueueSetu</p>
              <p className="mt-3 text-base text-teal-50/90">
                Smart Queue Management
              </p>
              <p className="mt-6 max-w-sm text-sm leading-6 text-teal-50/85">
                Streamline walk-ins, reduce wait times, and deliver a smooth
                customer experience with real-time queue visibility.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}
                className="mt-8 space-y-3"
              >
                <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-teal-50/95">
                  Real-time queue tracking for faster service
                </div>
                <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-teal-50/95">
                  Smart notifications to keep customers informed
                </div>
              </motion.div>
            </motion.div>
          </aside>

          <section
            className="flex items-center justify-center bg-white p-6 sm:p-8 lg:p-10"
            aria-label="Authentication form section"
          >
            <div className="w-full max-w-md">{children}</div>
          </section>
        </div>
      </div>
    </div>
  );
}
