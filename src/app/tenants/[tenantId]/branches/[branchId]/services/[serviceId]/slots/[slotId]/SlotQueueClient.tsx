"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Loader2,
  ListOrdered,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import { Container } from "@/components/layout/container";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { slotApi, type ServiceSlot } from "@/lib/api/booking";
import { queueApi, type Queue, type QueueRequest } from "@/lib/api/queue";
import { useAuthStore } from "@/store/use-auth-store";
import { toast } from "@/store/use-toast-store";

// ── Animation variants ─────────────────────────────────────────────────────

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────

function formatTime(t: string) {
  return t?.slice(0, 5) ?? t;
}

function formatDate(d: string) {
  if (!d) return d;
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(
    new Date(d + "T00:00:00"),
  );
}

// ── Status badge ───────────────────────────────────────────────────────────

function SlotStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    OPEN: "bg-accent/10 text-accent",
    BLOCKED: "bg-red-100 text-red-600",
    FULL: "bg-amber-100 text-amber-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? "bg-slate-100 text-slate-500"}`}
    >
      {status}
    </span>
  );
}

// ── Create Queue Modal ─────────────────────────────────────────────────────

type CreateQueueModalProps = {
  tenantId: string;
  branchId: string;
  serviceId: string;
  slotId: string;
  accessToken: string;
  onClose: () => void;
  onCreated: (queue: Queue) => void;
};

function CreateQueueModal({
  tenantId,
  branchId,
  serviceId,
  slotId,
  accessToken,
  onClose,
  onCreated,
}: CreateQueueModalProps) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    const body: QueueRequest = {
      name: name.trim(),
      tenantId,
      branchId,
      serviceId,
      slotId,
    };
    try {
      const created = await queueApi.createQueue(body, accessToken);
      onCreated(created);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create queue";
      setError(message);
      toast.error(message);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <ListOrdered className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-base font-semibold text-slate-900">
              Create Queue
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 px-6 py-5"
          noValidate
        >
          <div className="space-y-1.5">
            <label
              htmlFor="queue-name"
              className="text-sm font-medium text-slate-700"
            >
              Queue name{" "}
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id="queue-name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning Consultation Queue"
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !name.trim()}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              Create Queue
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

type Props = {
  tenantId: string;
  branchId: string;
  serviceId: string;
  slotId: string;
};

export default function SlotQueueClient({
  tenantId,
  branchId,
  serviceId,
  slotId,
}: Props) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(() =>
    useAuthStore.persist.hasHydrated(),
  );
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [slot, setSlot] = useState<ServiceSlot | null>(null);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    return unsub;
  }, []);

  useEffect(() => {
    if (hydrated && (!user || !accessToken)) router.replace("/login");
  }, [hydrated, user, accessToken, router]);

  const loadData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const [slotData, queueList] = await Promise.all([
        slotApi.getSlot(slotId, accessToken),
        queueApi.getQueuesBySlot(slotId, accessToken),
      ]);
      setSlot(slotData);
      setQueues(queueList);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load data";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [slotId, accessToken]);

  useEffect(() => {
    if (hydrated && accessToken) loadData();
  }, [hydrated, accessToken, loadData]);

  const handleQueueCreated = (queue: Queue) => {
    setQueues((prev) => [...prev, queue]);
    setShowCreateModal(false);
    toast.success("Queue created successfully");
  };

  const handleDeleteQueue = async (queueId: string) => {
    if (!accessToken || !confirm("Delete this queue? This cannot be undone."))
      return;
    setDeletingId(queueId);
    try {
      await queueApi.deleteQueue(queueId, accessToken);
      setQueues((prev) => prev.filter((q) => q.id !== queueId));
      toast.success("Queue deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  if (!hydrated || !user || !accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showCreateModal && slot && accessToken && (
          <CreateQueueModal
            tenantId={tenantId}
            branchId={branchId}
            serviceId={serviceId}
            slotId={slotId}
            accessToken={accessToken}
            onClose={() => setShowCreateModal(false)}
            onCreated={handleQueueCreated}
          />
        )}
      </AnimatePresence>

      <Navbar />
      <main className="py-10 sm:py-16 lg:py-20">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mx-auto max-w-3xl"
          >
            {/* Back */}
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/tenants/${tenantId}/branches/${branchId}/services/${serviceId}`,
                )
              }
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Service
            </button>

            {loading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600">
                {error}
              </div>
            ) : slot ? (
              <>
                {/* Slot detail card */}
                <Card className="mb-8 overflow-hidden rounded-2xl border-slate-200/80 shadow-sm">
                  <div className="h-1 w-full bg-primary" />
                  <CardHeader className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Clock className="h-7 w-7" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl">
                          {formatTime(slot.startTime)} –{" "}
                          {formatTime(slot.endTime)}
                        </CardTitle>
                        <CardDescription className="mt-1 flex flex-wrap items-center gap-3">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Calendar className="h-4 w-4" aria-hidden="true" />
                            {formatDate(slot.slotDate)}
                          </span>
                          <SlotStatusBadge status={slot.status} />
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  {slot.maxCapacity != null && (
                    <CardContent className="pb-5">
                      <span className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Users
                          className="h-4 w-4 text-slate-400"
                          aria-hidden="true"
                        />
                        {slot.currentBookings} / {slot.maxCapacity} booked
                      </span>
                    </CardContent>
                  )}
                </Card>

                {/* Queues section */}
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">
                      Queue
                    </h2>
                    <p className="text-sm text-slate-500">
                      {queues.length === 0
                        ? "No queue created for this slot yet"
                        : "Queue is active for this slot"}
                    </p>
                  </div>
                  {queues.length === 0 && (
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      aria-label="Create a queue for this slot"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      Create Queue
                    </Button>
                  )}
                </div>

                {queues.length === 0 ? (
                  /* Empty state */
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <ListOrdered
                        className="h-6 w-6 text-primary"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-4 text-base font-semibold text-slate-800">
                      No queue yet
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Create a queue for this time slot so staff can manage
                      walk-ins and appointments in order.
                    </p>
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      Create Queue
                    </Button>
                  </div>
                ) : (
                  /* Queue list */
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: { transition: { staggerChildren: 0.07 } },
                    }}
                    className="space-y-3"
                  >
                    {queues.map((queue) => (
                      <motion.div key={queue.id} variants={itemVariants}>
                        <Card className="group overflow-hidden rounded-2xl border-slate-200/80 shadow-sm transition-all hover:shadow-md hover:border-primary/40">
                          <CardContent className="flex items-center justify-between gap-4 px-5 py-4">
                            <Link
                              href={`/queue/${queue.id}`}
                              className="flex flex-1 items-center gap-4 min-w-0 focus-visible:outline-none"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                                <ListOrdered
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-900 group-hover:text-primary transition-colors">
                                  {queue.name}
                                </p>
                                <p className="mt-0.5 truncate text-xs text-slate-400">
                                  View live queue →
                                </p>
                              </div>
                            </Link>

                            <button
                              type="button"
                              disabled={deletingId === queue.id}
                              onClick={() => handleDeleteQueue(queue.id)}
                              className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:opacity-40"
                              aria-label="Delete queue"
                            >
                              {deletingId === queue.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                              )}
                            </button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </>
            ) : null}
          </motion.div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
