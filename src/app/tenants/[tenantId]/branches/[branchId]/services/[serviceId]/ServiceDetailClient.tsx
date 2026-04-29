"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  CalendarPlus,
  Clock,
  Loader2,
  Stethoscope,
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
import {
  bookingApi,
  slotApi,
  type ServiceDefinition,
  type ServiceSlot,
  type CreateServiceSlotRequest,
} from "@/lib/api/booking";
import { useAuthStore } from "@/store/use-auth-store";
import { toast } from "@/store/use-toast-store";

// ── Animation variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

// ── Status badge ───────────────────────────────────────────────────────────

function SlotStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    OPEN: "bg-accent/10 text-accent",
    BLOCKED: "bg-red-100 text-red-600",
    FULL: "bg-amber-100 text-amber-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? "bg-slate-100 text-slate-500"}`}
    >
      {status}
    </span>
  );
}

// ── Add Slot Modal ─────────────────────────────────────────────────────────

type AddSlotModalProps = {
  serviceId: string;
  branchId: string;
  accessToken: string;
  onClose: () => void;
  onCreated: (slot: ServiceSlot) => void;
};

function AddSlotModal({
  serviceId,
  branchId,
  accessToken,
  onClose,
  onCreated,
}: AddSlotModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const [slotDate, setSlotDate] = useState(today);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotDate || !startTime || !endTime) return;
    setSubmitting(true);
    setError(null);
    const body: CreateServiceSlotRequest = {
      serviceId,
      branchId,
      slotDate,
      startTime,
      endTime,
      maxCapacity: maxCapacity ? parseInt(maxCapacity, 10) : undefined,
    };
    try {
      const created = await slotApi.createSlot(body, accessToken);
      onCreated(created);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create slot";
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
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-base font-semibold text-slate-900">Add Slot</h2>
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

        <form
          onSubmit={handleSubmit}
          className="space-y-4 px-6 py-5"
          noValidate
        >
          {/* Date */}
          <div className="space-y-1.5">
            <label
              htmlFor="slot-date"
              className="text-sm font-medium text-slate-700"
            >
              Date{" "}
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id="slot-date"
              type="date"
              required
              value={slotDate}
              min={today}
              onChange={(e) => setSlotDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Start / End time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="slot-start"
                className="text-sm font-medium text-slate-700"
              >
                Start time{" "}
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="slot-start"
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="slot-end"
                className="text-sm font-medium text-slate-700"
              >
                End time{" "}
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="slot-end"
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Max capacity */}
          <div className="space-y-1.5">
            <label
              htmlFor="slot-cap"
              className="text-sm font-medium text-slate-700"
            >
              Max capacity
            </label>
            <input
              id="slot-cap"
              type="number"
              min={1}
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(e.target.value)}
              placeholder="Unlimited if blank"
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
              disabled={submitting || !slotDate || !startTime || !endTime}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              Add Slot
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatTime(t: string) {
  // "HH:mm:ss" → "HH:mm"
  return t?.slice(0, 5) ?? t;
}

function formatDate(d: string) {
  if (!d) return d;
  const dt = new Date(d + "T00:00:00");
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(dt);
}

// Group slots by date for display
function groupByDate(slots: ServiceSlot[]): Map<string, ServiceSlot[]> {
  const map = new Map<string, ServiceSlot[]>();
  const sorted = [...slots].sort((a, b) => {
    if (a.slotDate !== b.slotDate) return a.slotDate.localeCompare(b.slotDate);
    return a.startTime.localeCompare(b.startTime);
  });
  for (const s of sorted) {
    const arr = map.get(s.slotDate) ?? [];
    arr.push(s);
    map.set(s.slotDate, arr);
  }
  return map;
}

// ── Main Component ─────────────────────────────────────────────────────────

type Props = {
  tenantId: string;
  branchId: string;
  serviceId: string;
};

export default function ServiceDetailClient({
  tenantId,
  branchId,
  serviceId,
}: Props) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(() =>
    useAuthStore.persist.hasHydrated(),
  );
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [service, setService] = useState<ServiceDefinition | null>(null);
  const [slots, setSlots] = useState<ServiceSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
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
      const [svc, slotList] = await Promise.all([
        bookingApi.getService(serviceId, accessToken),
        slotApi.getSlotsByService(serviceId, accessToken),
      ]);
      setService(svc);
      setSlots(slotList);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load data";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [serviceId, accessToken]);

  useEffect(() => {
    if (hydrated && accessToken) loadData();
  }, [hydrated, accessToken, loadData]);

  const handleSlotCreated = (slot: ServiceSlot) => {
    setSlots((prev) => [...prev, slot]);
    setShowAddModal(false);
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!accessToken || !confirm("Delete this slot? This cannot be undone."))
      return;
    setDeletingId(slotId);
    try {
      await slotApi.deleteSlot(slotId, accessToken);
      setSlots((prev) => prev.filter((s) => s.id !== slotId));
      toast.success("Slot deleted");
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

  const grouped = groupByDate(slots);

  return (
    <>
      <AnimatePresence>
        {showAddModal && service && accessToken && (
          <AddSlotModal
            serviceId={serviceId}
            branchId={branchId}
            accessToken={accessToken}
            onClose={() => setShowAddModal(false)}
            onCreated={handleSlotCreated}
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
                router.push(`/tenants/${tenantId}/branches/${branchId}`)
              }
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Branch
            </button>

            {loading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600">
                {error}
              </div>
            ) : service ? (
              <>
                {/* Service Card */}
                <Card className="mb-8 overflow-hidden rounded-2xl border-slate-200/80 shadow-sm">
                  <div className="h-1 w-full bg-primary" />
                  <CardHeader className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Stethoscope className="h-7 w-7" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl">
                          {service.name}
                        </CardTitle>
                        {service.description && (
                          <CardDescription className="mt-1">
                            {service.description}
                          </CardDescription>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          service.active
                            ? "bg-accent/10 text-accent"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {service.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-5">
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
                      {service.avgDurationMin != null && (
                        <span className="flex items-center gap-1.5">
                          <Clock
                            className="h-4 w-4 text-slate-400"
                            aria-hidden="true"
                          />
                          {service.avgDurationMin} min avg
                        </span>
                      )}
                      {service.bufferDurationMin != null && (
                        <span className="flex items-center gap-1.5">
                          <Clock
                            className="h-4 w-4 text-slate-300"
                            aria-hidden="true"
                          />
                          {service.bufferDurationMin} min buffer
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Slots header */}
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">
                      Slots
                    </h2>
                    <p className="text-sm text-slate-500">
                      {slots.length} slot{slots.length !== 1 ? "s" : ""}{" "}
                      scheduled
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    aria-label="Add a new slot"
                  >
                    <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                    Add Slot
                  </Button>
                </div>

                {/* Slots list */}
                {slots.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Calendar
                        className="h-6 w-6 text-primary"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-4 text-base font-semibold text-slate-800">
                      No slots scheduled
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Add time slots so customers can book appointments for this
                      service.
                    </p>
                    <Button
                      onClick={() => setShowAddModal(true)}
                      className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Add Slot
                    </Button>
                  </div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                  >
                    {Array.from(grouped.entries()).map(([date, dateSlots]) => (
                      <motion.div key={date} variants={itemVariants}>
                        {/* Date group header */}
                        <div className="mb-2 flex items-center gap-2">
                          <Calendar
                            className="h-4 w-4 text-slate-400"
                            aria-hidden="true"
                          />
                          <span className="text-sm font-semibold text-slate-700">
                            {formatDate(date)}
                          </span>
                          <span className="text-xs text-slate-400">
                            ({dateSlots.length} slot
                            {dateSlots.length !== 1 ? "s" : ""})
                          </span>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          {dateSlots.map((slot) => (
                            <Card
                              key={slot.id}
                              className="transition-all duration-200 hover:shadow-md"
                            >
                              <CardContent className="flex items-center justify-between gap-3 px-4 py-3.5">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Clock
                                      className="h-4 w-4"
                                      aria-hidden="true"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-slate-900 text-sm">
                                      {formatTime(slot.startTime)} –{" "}
                                      {formatTime(slot.endTime)}
                                    </p>
                                    <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                                      {slot.maxCapacity != null && (
                                        <span className="flex items-center gap-1">
                                          <Users
                                            className="h-3 w-3"
                                            aria-hidden="true"
                                          />
                                          {slot.currentBookings}/
                                          {slot.maxCapacity}
                                        </span>
                                      )}
                                      <SlotStatusBadge status={slot.status} />
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  disabled={deletingId === slot.id}
                                  onClick={() => handleDeleteSlot(slot.id)}
                                  className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:opacity-40"
                                  aria-label="Delete slot"
                                >
                                  {deletingId === slot.id ? (
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
                          ))}
                        </div>
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
