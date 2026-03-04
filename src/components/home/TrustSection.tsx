"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "10K+", label: "Users Served" },
  { value: "200+", label: "Businesses" },
  { value: "99.9%", label: "Uptime" },
];

export default function TrustSection() {
  return (
    <section
      className="mt-8 rounded-xl bg-white p-6 shadow-sm sm:p-8"
      aria-label="Trust metrics"
    >
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.08 },
          },
        }}
        className="grid gap-4 sm:grid-cols-3"
      >
        {stats.map((stat) => (
          <motion.article
            key={stat.label}
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.3, ease: "easeOut" },
              },
            }}
            className="rounded-xl border border-slate-100 bg-white p-6 text-center shadow-sm transition-transform hover:-translate-y-1"
          >
            <p className="text-3xl font-bold tracking-tight text-primary">
              {stat.value}
            </p>
            <p className="mt-2 text-sm font-medium text-slate-600">
              {stat.label}
            </p>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
