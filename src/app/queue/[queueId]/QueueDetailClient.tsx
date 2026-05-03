"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Hash,
  Layers,
  Loader2,
  ListOrdered,
  RefreshCw,
  Timer,
  Users,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import { Container } from "@/components/layout/container";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { queueApi, type QueueDetail, type QueueToken } from "@/lib/api/queue";
import { accountApi, type Tenant, type Branch } from "@/lib/api/account";
import {
  bookingApi,
  slotApi,
  type ServiceDefinition,
  type ServiceSlot,
} from "@/lib/api/booking";
import { useAuthStore } from "@/store/use-auth-store";
import { toast } from "@/store/use-toast-store";

// ── Animation variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(t: string) {
  return t?.slice(0, 5) ?? t;
}

function formatDate(d: string) {
  if (!d) return d;
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
    new Date(d + "T00:00:00"),
  );
}

// ── Stat card ────────────────────────────────────────────────────────────────

type StatCardProps = {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent?: string; // tailwind text/bg colour prefix
};
function StatCard({ label, value, icon, accent = "primary" }: StatCardProps) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="h-full rounded-2xl border-slate-200/80 shadow-sm">
        <CardContent className="flex items-center gap-4 px-5 py-5">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-${accent}/10 text-${accent}`}
          >
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Token row ────────────────────────────────────────────────────────────────

function TokenRow({
  token,
  highlight,
}: {
  token: QueueToken;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-xl px-4 py-3 ${highlight ? "bg-primary/5 ring-1 ring-primary/20" : "bg-slate-50"}`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${highlight ? "bg-primary text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}
      >
        #{token.tokenNumber}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">
          Token {token.tokenNumber}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">
          {token.type ?? "WALK-IN"} &middot;{" "}
          {new Date(token.checkinTime).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      <TokenStatusBadge status={token.status ?? "WAITING"} />
    </div>
  );
}

function TokenStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    WAITING: "bg-amber-100 text-amber-700",
    CALLED: "bg-primary/10 text-primary",
    COMPLETED: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? "bg-slate-100 text-slate-500"}`}
    >
      {status}
    </span>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function QueueDetailClient({ queueId }: { queueId: string }) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(() =>
    useAuthStore.persist.hasHydrated(),
  );
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [detail, setDetail] = useState<QueueDetail | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [service, setService] = useState<ServiceDefinition | null>(null);
  const [slot, setSlot] = useState<ServiceSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    return unsub;
  }, []);

  useEffect(() => {
    if (hydrated && (!user || !accessToken)) router.replace("/login");
  }, [hydrated, user, accessToken, router]);

  const loadDetail = useCallback(
    async (silent = false) => {
      if (!accessToken) return;
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError(null);
      try {
        const d = await queueApi.getQueueDetail(queueId, accessToken);
        setDetail(d);

        // Context entities (tenant/branch/service/slot) are static — only
        // fetch them on the first load (when detail is null), not on polls.
        if (!silent) {
          const [tenantResult, branchResult, serviceResult, slotResult] =
            await Promise.allSettled([
              d.tenantId
                ? accountApi.getTenant(d.tenantId, accessToken)
                : Promise.resolve(null),
              d.branchId
                ? accountApi.getBranch(d.branchId, accessToken)
                : Promise.resolve(null),
              d.serviceId
                ? bookingApi.getService(d.serviceId, accessToken)
                : Promise.resolve(null),
              d.slotId
                ? slotApi.getSlot(d.slotId, accessToken)
                : Promise.resolve(null),
            ]);

          if (tenantResult.status === "fulfilled")
            setTenant(tenantResult.value);
          if (branchResult.status === "fulfilled")
            setBranch(branchResult.value);
          if (serviceResult.status === "fulfilled")
            setService(serviceResult.value);
          if (slotResult.status === "fulfilled") setSlot(slotResult.value);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to load queue";
        setError(message);
        if (!silent) toast.error(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [queueId, accessToken],
  );

  // Initial load
  useEffect(() => {
    if (hydrated && accessToken) loadDetail();
  }, [hydrated, accessToken, loadDetail]);

  // Auto-poll every 10 s — only refreshes queue stats (silent=true)
  useEffect(() => {
    if (!hydrated || !accessToken) return;
    const id = setInterval(() => loadDetail(true), 10_000);
    return () => clearInterval(id);
  }, [hydrated, accessToken, loadDetail]);

  if (!hydrated || !user || !accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
      </div>
    );
  }

  // Build back-link: if we know the tenant/branch/service chain go there, otherwise /dashboard
  const backHref =
    detail?.tenantId && detail?.branchId && detail?.serviceId && detail?.slotId
      ? `/tenants/${detail.tenantId}/branches/${detail.branchId}/services/${detail.serviceId}/slots/${detail.slotId}`
      : "/dashboard";

  return (
    <>
      <Navbar />
      <main className="py-10 sm:py-16 lg:py-20">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mx-auto max-w-4xl"
          >
            {/* Back */}
            <button
              type="button"
              onClick={() => router.push(backHref)}
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>

            {loading ? (
              <div className="flex justify-center py-28">
                <Loader2 className="h-9 w-9 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600">
                {error}
              </div>
            ) : detail ? (
              <>
                {/* ── Page header ────────────────────────────────────────── */}
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <ListOrdered className="h-7 w-7" aria-hidden="true" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        {detail.name}
                      </h1>
                      <p className="mt-1 text-sm text-slate-500">
                        Queue details &amp; live status
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadDetail(true)}
                    disabled={refreshing}
                    className="shrink-0"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                      aria-hidden="true"
                    />
                    Refresh
                  </Button>
                </div>

                {/* ── Context breadcrumb (tenant → branch → service → slot) */}
                <Card className="mb-8 overflow-hidden rounded-2xl border-slate-200/80 shadow-sm">
                  <div className="h-1 w-full bg-primary" />
                  <CardContent className="px-5 py-4">
                    <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                      <ContextItem
                        label="Tenant"
                        value={tenant?.name ?? detail.tenantId ?? "—"}
                        icon={<Users className="h-4 w-4" />}
                      />
                      <ContextItem
                        label="Branch"
                        value={branch?.name ?? detail.branchId ?? "—"}
                        icon={<Layers className="h-4 w-4" />}
                      />
                      <ContextItem
                        label="Service"
                        value={service?.name ?? detail.serviceId ?? "—"}
                        icon={<Hash className="h-4 w-4" />}
                      />
                      {slot ? (
                        <ContextItem
                          label="Slot"
                          value={`${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}, ${formatDate(slot.slotDate)}`}
                          icon={<Calendar className="h-4 w-4" />}
                        />
                      ) : (
                        <ContextItem
                          label="Slot"
                          value="—"
                          icon={<Calendar className="h-4 w-4" />}
                        />
                      )}
                    </dl>
                  </CardContent>
                </Card>

                {/* ── Stats grid ─────────────────────────────────────────── */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                  className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4"
                >
                  <StatCard
                    label="Total Tokens"
                    value={detail.totalTokens}
                    icon={<Hash className="h-5 w-5" />}
                    accent="primary"
                  />
                  <StatCard
                    label="Waiting"
                    value={detail.waitingCount}
                    icon={<Timer className="h-5 w-5" />}
                    accent="amber-500"
                  />
                  <StatCard
                    label="Being Served"
                    value={detail.calledCount}
                    icon={<Clock className="h-5 w-5" />}
                    accent="primary"
                  />
                  <StatCard
                    label="Completed"
                    value={detail.completedCount}
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    accent="emerald-500"
                  />
                </motion.div>

                {/* ── Currently serving ──────────────────────────────────── */}
                <div className="mb-6">
                  <h2 className="mb-3 text-base font-semibold text-slate-800">
                    Currently Serving
                  </h2>
                  {detail.currentToken ? (
                    <TokenRow token={detail.currentToken} highlight />
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-center text-sm text-slate-400">
                      No token being served right now
                    </div>
                  )}
                </div>

                {/* ── Up next ────────────────────────────────────────────── */}
                <div>
                  <h2 className="mb-3 text-base font-semibold text-slate-800">
                    Up Next{" "}
                    <span className="ml-1 text-sm font-normal text-slate-400">
                      (next {detail.nextTokens.length})
                    </span>
                  </h2>
                  {detail.nextTokens.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-center text-sm text-slate-400">
                      No tokens waiting
                    </div>
                  ) : (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={containerVariants}
                      className="space-y-2"
                    >
                      {detail.nextTokens.map((t) => (
                        <motion.div key={t.id} variants={itemVariants}>
                          <TokenRow token={t} />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </>
            ) : null}
          </motion.div>
        </Container>
      </main>
      <Footer />
    </>
  );
}

// ── Context item helper ───────────────────────────────────────────────────────

function ContextItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0 text-slate-400">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs font-medium text-slate-500">{label}</dt>
        <dd className="mt-0.5 truncate text-sm font-semibold text-slate-900">
          {value}
        </dd>
      </div>
    </div>
  );
}
