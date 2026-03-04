"use client";

import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section
      className="rounded-xl bg-white px-4 py-10 shadow-sm sm:px-6 sm:py-12 lg:px-10 lg:py-14"
      aria-label="Hero section"
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="grid gap-8 lg:grid-cols-2 lg:items-center"
      >
        <div className="text-center lg:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl lg:text-5xl">
            Smart Queue Management for Modern Businesses
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg lg:mx-0">
            Reduce waiting time. Notify users in real time. Track queues
            effortlessly.
          </p>
          <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row lg:justify-start">
            <Button
              type="button"
              className="bg-accent text-accent-foreground shadow-sm hover:bg-accent/90"
            >
              Get Started
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-primary text-primary hover:bg-primary/5 hover:text-primary"
            >
              Watch Demo
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}
          className="mx-auto w-full max-w-md"
        >
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <p className="text-sm font-semibold text-slate-800">
                Today’s Queue
              </p>
              <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
                Live
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm">
                <span className="text-sm text-slate-600">Now serving</span>
                <span className="text-sm font-semibold text-primary">
                  A-103
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm">
                <span className="text-sm text-slate-600">Waiting</span>
                <span className="text-sm font-semibold text-slate-800">18</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm">
                <span className="text-sm text-slate-600">Avg wait</span>
                <span className="text-sm font-semibold text-slate-800">
                  12 min
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
