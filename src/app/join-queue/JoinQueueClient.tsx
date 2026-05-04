"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  GitBranch,
  Layers,
  Loader2,
  Search,
  Users,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import { Container } from "@/components/layout/container";
import Footer from "@/components/layout/Footer";
import { accountApi } from "@/lib/api/account";
import { bookingApi } from "@/lib/api/booking";
import { queueApi, type Queue } from "@/lib/api/queue";
import { useAuthStore } from "@/store/use-auth-store";

// ── Types ──────────────────────────────────────────────────────────────────

type FilterField = "queueName" | "tenant" | "branch" | "service";

interface EnrichedQueue extends Queue {
  tenantName: string;
  branchName: string;
  serviceName: string;
}

const FILTER_OPTIONS: { value: FilterField; label: string }[] = [
  { value: "queueName", label: "Queue Name" },
  { value: "tenant", label: "Tenant" },
  { value: "branch", label: "Branch" },
  { value: "service", label: "Service" },
];

// ── Card component ─────────────────────────────────────────────────────────

function QueueCard({
  queue,
  filterField,
}: {
  queue: EnrichedQueue;
  filterField: FilterField;
}) {
  // Primary label + route depend on which filter is active
  const primary: { label: string; href: string; icon: React.ReactNode } =
    filterField === "tenant"
      ? {
          label: queue.tenantName || queue.tenantId,
          href: `/tenant/${queue.tenantId}`,
          icon: <Building2 className="h-4 w-4" />,
        }
      : filterField === "branch"
        ? {
            label: queue.branchName || queue.branchId,
            href: `/branch/${queue.branchId}`,
            icon: <GitBranch className="h-4 w-4" />,
          }
        : filterField === "service"
          ? {
              label: queue.serviceName || queue.serviceId || "—",
              href: queue.serviceId
                ? `/service/${queue.serviceId}`
                : `/branch/${queue.branchId}`,
              icon: <Layers className="h-4 w-4" />,
            }
          : {
              // queueName (default)
              label: queue.name,
              href: `/queue/${queue.id}`,
              icon: <Users className="h-4 w-4" />,
            };

  // Secondary breadcrumb lines — everything that isn't the primary
  const meta: { icon: React.ReactNode; text: string }[] = [];
  if (filterField !== "tenant" && queue.tenantName)
    meta.push({
      icon: <Building2 className="h-3 w-3 shrink-0" />,
      text: queue.tenantName,
    });
  if (filterField !== "branch" && queue.branchName)
    meta.push({
      icon: <GitBranch className="h-3 w-3 shrink-0" />,
      text: queue.branchName,
    });
  if (filterField !== "service" && queue.serviceName)
    meta.push({
      icon: <Layers className="h-3 w-3 shrink-0" />,
      text: queue.serviceName,
    });
  if (filterField !== "queueName")
    meta.push({
      icon: <Users className="h-3 w-3 shrink-0" />,
      text: queue.name,
    });

  return (
    <Link href={primary.href} className="group block h-full">
      <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md">
        {/* Primary heading */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
              {primary.icon}
            </div>
            <p className="text-base font-bold leading-snug text-slate-900 group-hover:text-accent">
              {primary.label}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-accent" />
        </div>

        {/* Secondary breadcrumb meta */}
        {meta.length > 0 && (
          <div className="mt-auto space-y-1.5">
            {meta.map((m, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 text-xs text-slate-500"
              >
                {m.icon}
                <span className="truncate">{m.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function JoinQueueClient() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(() =>
    useAuthStore.persist.hasHydrated(),
  );

  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  const [allQueues, setAllQueues] = useState<EnrichedQueue[]>([]);
  const [displayed, setDisplayed] = useState<EnrichedQueue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // search state
  const [filterField, setFilterField] = useState<FilterField>("queueName");
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // hydration guard
  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    return unsub;
  }, []);

  useEffect(() => {
    if (hydrated && (!user || !accessToken)) router.replace("/login");
  }, [hydrated, user, accessToken, router]);

  // ── Load all queues and enrich with names ──────────────────────────────
  const loadQueues = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);

    try {
      const queues: Queue[] = await queueApi.getAllQueues(accessToken);

      // Batch-resolve unique IDs
      const tenantIds = [
        ...new Set(queues.map((q) => q.tenantId).filter(Boolean)),
      ];
      const branchIds = [
        ...new Set(queues.map((q) => q.branchId).filter(Boolean)),
      ];
      const serviceIds = [
        ...new Set(queues.map((q) => q.serviceId).filter(Boolean) as string[]),
      ];

      const [tenantResults, branchResults, serviceResults] =
        await Promise.allSettled([
          Promise.all(
            tenantIds.map((id) =>
              accountApi
                .getTenant(id, accessToken)
                .then((t) => ({ id, name: t.name }))
                .catch(() => ({ id, name: id })),
            ),
          ),
          Promise.all(
            branchIds.map((id) =>
              accountApi
                .getBranch(id, accessToken)
                .then((b) => ({ id, name: b.name }))
                .catch(() => ({ id, name: id })),
            ),
          ),
          Promise.all(
            serviceIds.map((id) =>
              bookingApi
                .getService(id, accessToken)
                .then((s) => ({ id, name: s.name }))
                .catch(() => ({ id, name: id })),
            ),
          ),
        ]);

      const tenantMap = new Map<string, string>(
        tenantResults.status === "fulfilled"
          ? tenantResults.value.map((r) => [r.id, r.name])
          : [],
      );
      const branchMap = new Map<string, string>(
        branchResults.status === "fulfilled"
          ? branchResults.value.map((r) => [r.id, r.name])
          : [],
      );
      const serviceMap = new Map<string, string>(
        serviceResults.status === "fulfilled"
          ? serviceResults.value.map((r) => [r.id, r.name])
          : [],
      );

      const enriched: EnrichedQueue[] = queues.map((q) => ({
        ...q,
        tenantName: tenantMap.get(q.tenantId) ?? "",
        branchName: branchMap.get(q.branchId) ?? "",
        serviceName: q.serviceId ? (serviceMap.get(q.serviceId) ?? "") : "",
      }));

      setAllQueues(enriched);
      setDisplayed(enriched);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load queues.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (hydrated && accessToken) loadQueues();
  }, [hydrated, accessToken, loadQueues]);

  // ── Search / filter ────────────────────────────────────────────────────
  function applyFilter(q: string, field: FilterField) {
    const term = q.trim().toLowerCase();
    if (!term) {
      setDisplayed(allQueues);
      return;
    }
    setDisplayed(
      allQueues.filter((queue) => {
        switch (field) {
          case "tenant":
            return queue.tenantName.toLowerCase().includes(term);
          case "branch":
            return queue.branchName.toLowerCase().includes(term);
          case "service":
            return queue.serviceName.toLowerCase().includes(term);
          default:
            return queue.name.toLowerCase().includes(term);
        }
      }),
    );
  }

  function handleSearch() {
    setQuery(inputValue);
    applyFilter(inputValue, filterField);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSearch();
  }

  function handleFilterChange(newField: FilterField) {
    setFilterField(newField);
    // Re-apply current query against new field
    applyFilter(inputValue, newField);
  }

  // ── Render ─────────────────────────────────────────────────────────────
  if (!hydrated || !user || !accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2
          className="h-8 w-8 animate-spin text-teal-700"
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-10 sm:py-14">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mx-auto max-w-5xl"
          >
            {/* Back link */}
            <Link
              href="/home"
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            {/* Page header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                Join a Queue
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Browse all active queues. Click a card to view details and join.
              </p>
            </div>

            {/* Search bar — 3-part layout */}
            <div className="mb-8 flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {/* Left: filter dropdown */}
              <select
                value={filterField}
                onChange={(e) =>
                  handleFilterChange(e.target.value as FilterField)
                }
                className="shrink-0 border-r border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent"
                aria-label="Filter by field"
              >
                {FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Middle: text input */}
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Search by ${FILTER_OPTIONS.find((o) => o.value === filterField)?.label ?? "Queue Name"}…`}
                className="min-w-0 flex-1 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                aria-label="Search query"
              />

              {/* Right: search button */}
              <button
                type="button"
                onClick={handleSearch}
                className="shrink-0 border-l border-slate-200 bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>

            {/* Result summary */}
            {!loading && !error && (
              <p className="mb-4 text-xs text-slate-500">
                {query
                  ? `${displayed.length} result${displayed.length !== 1 ? "s" : ""} for "${query}" in ${FILTER_OPTIONS.find((o) => o.value === filterField)?.label}`
                  : `${displayed.length} active queue${displayed.length !== 1 ? "s" : ""}`}
              </p>
            )}

            {/* States */}
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-7 w-7 animate-spin text-accent" />
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
                <p className="text-sm font-medium text-red-600">{error}</p>
                <button
                  type="button"
                  onClick={loadQueues}
                  className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            ) : displayed.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <p className="mt-4 text-sm font-medium text-slate-700">
                  {query
                    ? "No queues match your search."
                    : "No active queues found."}
                </p>
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputValue("");
                      setQuery("");
                      setDisplayed(allQueues);
                    }}
                    className="mt-3 text-xs font-medium text-accent hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.04 } },
                }}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {displayed.map((queue) => (
                  <motion.div
                    key={queue.id}
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.3, ease: "easeOut" },
                      },
                    }}
                  >
                    <QueueCard queue={queue} filterField={filterField} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
