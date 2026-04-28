"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Building2, ClipboardList, ScanLine } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const actions = [
  {
    key: "join",
    label: "Quick Action",
    title: "Join a Queue",
    description:
      "Scan a QR code or enter a queue ID to instantly join and track your position in real time.",
    icon: ScanLine,
    href: "/join-queue",
    ariaLabel: "Join an existing queue",
    accentClass: "from-teal-50 to-white",
    borderClass: "border-t-accent",
    iconBgClass: "bg-accent/10 text-accent",
    badgeBgClass: "bg-accent/10 text-accent",
    buttonClass:
      "bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 focus-visible:ring-accent",
    highlightClass: "bg-accent",
    metaItems: [
      { label: "Real-time position" },
      { label: "SMS notifications" },
      { label: "No app required" },
    ],
  },
  {
    key: "create",
    label: "For Businesses",
    title: "Create a Queue",
    description:
      "Set up a managed queue for your customers in minutes. Customise slots, services, and notifications.",
    icon: ClipboardList,
    href: "/create-queue",
    ariaLabel: "Create a new queue",
    accentClass: "from-blue-50 to-white",
    borderClass: "border-t-primary",
    iconBgClass: "bg-primary/10 text-primary",
    badgeBgClass: "bg-primary/10 text-primary",
    buttonClass:
      "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:ring-primary",
    highlightClass: "bg-primary",
    metaItems: [
      { label: "Custom services" },
      { label: "Analytics included" },
      { label: "Instant setup" },
    ],
  },
  {
    key: "organisation",
    label: "Multi-tenant",
    title: "Add Organisation",
    description:
      "Create an organisation, add branches, and manage multiple queues across your entire business network.",
    icon: Building2,
    href: "/tenants/new",
    ariaLabel: "Create a new organisation",
    accentClass: "from-violet-50 to-white",
    borderClass: "border-t-violet-500",
    iconBgClass: "bg-violet-100 text-violet-600",
    badgeBgClass: "bg-violet-100 text-violet-600",
    buttonClass:
      "bg-violet-600 text-white shadow-sm hover:bg-violet-700 focus-visible:ring-violet-500",
    highlightClass: "bg-violet-500",
    metaItems: [
      { label: "Multiple branches" },
      { label: "Team access" },
      { label: "Queue management" },
    ],
  },
] as const;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" as const } },
};

export default function QuickActionCards() {
  return (
    <section aria-label="Quick actions">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3"
      >
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <motion.div key={action.key} variants={cardVariants}>
              <div
                className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-linear-to-b ${action.accentClass} shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
              >
                {/* Colored top stripe */}
                <div className={`h-1 w-full ${action.highlightClass}`} />

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  {/* Header row */}
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.iconBgClass} transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${action.badgeBgClass}`}
                    >
                      {action.label}
                    </span>
                  </div>

                  {/* Title and description */}
                  <div className="mt-5 flex-1">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                      {action.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {action.description}
                    </p>
                  </div>

                  {/* Feature chips */}
                  <ul className="mt-5 flex flex-wrap gap-2" aria-label="Features">
                    {action.metaItems.map((item) => (
                      <li
                        key={item.label}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        {item.label}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-6">
                    <Link
                      href={action.href}
                      aria-label={action.ariaLabel}
                      className={cn(
                        buttonVariants(),
                        "w-full",
                        action.buttonClass,
                      )}
                    >
                      {action.title}
                      <ArrowRight
                        className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
