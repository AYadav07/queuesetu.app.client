"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, Loader2 } from "lucide-react";

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
  slotApi,
  bookingApi,
  type CreateServiceSlotRequest,
  type UpdateServiceSlotRequest,
} from "@/lib/api/booking";
import { useAuthStore } from "@/store/use-auth-store";
import { toast } from "@/store/use-toast-store";

const SLOT_STATUSES = ["OPEN", "BLOCKED"] as const;

type Props =
  | { mode: "create"; serviceId: string; slotId?: never }
  | { mode: "edit"; slotId: string; serviceId?: never };

export default function SlotFormClient({
  mode,
  serviceId: serviceIdProp,
  slotId,
}: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [hydrated, setHydrated] = useState(() =>
    useAuthStore.persist.hasHydrated(),
  );
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [serviceId, setServiceId] = useState(serviceIdProp ?? "");
  const [branchId, setBranchId] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    slotDate: "",
    startTime: "",
    endTime: "",
    maxCapacity: "",
    status: "OPEN",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    return unsub;
  }, []);

  // Load slot data (edit) or service data to get branchId (create)
  useEffect(() => {
    if (!accessToken || !hydrated) return;
    if (isEdit) {
      slotApi
        .getSlot(slotId!, accessToken)
        .then((s) => {
          setServiceId(s.serviceId);
          setBranchId(s.branchId);
          setFormData({
            slotDate: s.slotDate,
            startTime: s.startTime.slice(0, 5), // "HH:mm:ss" → "HH:mm"
            endTime: s.endTime.slice(0, 5),
            maxCapacity: s.maxCapacity != null ? String(s.maxCapacity) : "",
            status: s.status,
          });
        })
        .catch(() => {})
        .finally(() => setLoadingData(false));
    } else {
      bookingApi
        .getService(serviceIdProp!, accessToken)
        .then((s) => setBranchId(s.branchId))
        .catch(() => {})
        .finally(() => setLoadingData(false));
    }
  }, [isEdit, slotId, serviceIdProp, accessToken, hydrated]);

  useEffect(() => {
    if (hydrated && (!user || !accessToken)) router.replace("/login");
  }, [hydrated, user, accessToken, router]);

  if (!hydrated || !user || !accessToken || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
      </div>
    );
  }

  const onChange = (id: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const isValid =
    formData.slotDate.trim() &&
    formData.startTime.trim() &&
    formData.endTime.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      if (isEdit) {
        const body: UpdateServiceSlotRequest = {
          startTime: formData.startTime,
          endTime: formData.endTime,
          maxCapacity: formData.maxCapacity
            ? Number(formData.maxCapacity)
            : undefined,
          status: formData.status,
        };
        await slotApi.updateSlot(slotId!, body, accessToken);
        router.push(`/slot/${slotId}`);
      } else {
        const body: CreateServiceSlotRequest = {
          serviceId,
          branchId,
          slotDate: formData.slotDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
          maxCapacity: formData.maxCapacity
            ? Number(formData.maxCapacity)
            : undefined,
        };
        await slotApi.createSlot(body, accessToken);
        router.push(`/service/${serviceId}`);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast.error(message);
      setSubmitting(false);
    }
  };

  const backHref = isEdit ? `/slot/${slotId}` : `/service/${serviceId}`;

  return (
    <>
      <Navbar />
      <main className="py-10 sm:py-16 lg:py-20">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mx-auto max-w-xl"
          >
            {/* Back */}
            <button
              type="button"
              onClick={() => router.push(backHref)}
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {isEdit ? "Back to Slot" : "Back to Service"}
            </button>

            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm">
                <CalendarDays
                  className="h-3.5 w-3.5 text-accent"
                  aria-hidden="true"
                />
                <span className="text-xs font-medium text-slate-600">Slot</span>
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-primary">
                {isEdit ? "Edit Slot" : "Add a Slot"}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                {isEdit
                  ? "Update this time slot."
                  : "A slot defines a time window for a service on a specific date."}
              </p>
            </div>

            <Card className="rounded-2xl border-slate-200/80 shadow-sm">
              <CardHeader>
                <CardTitle>Slot details</CardTitle>
                <CardDescription>Set the date and time window.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {/* Date — only in create mode */}
                  {!isEdit && (
                    <div className="space-y-1.5">
                      <label
                        htmlFor="slotDate"
                        className="text-sm font-medium text-slate-700"
                      >
                        Date{" "}
                        <span className="text-destructive" aria-hidden="true">
                          *
                        </span>
                      </label>
                      <input
                        id="slotDate"
                        type="date"
                        required
                        autoFocus
                        value={formData.slotDate}
                        onChange={(e) => onChange("slotDate", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  )}

                  {/* Time range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="startTime"
                        className="text-sm font-medium text-slate-700"
                      >
                        Start time{" "}
                        <span className="text-destructive" aria-hidden="true">
                          *
                        </span>
                      </label>
                      <input
                        id="startTime"
                        type="time"
                        required
                        value={formData.startTime}
                        onChange={(e) => onChange("startTime", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="endTime"
                        className="text-sm font-medium text-slate-700"
                      >
                        End time{" "}
                        <span className="text-destructive" aria-hidden="true">
                          *
                        </span>
                      </label>
                      <input
                        id="endTime"
                        type="time"
                        required
                        value={formData.endTime}
                        onChange={(e) => onChange("endTime", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  {/* Max capacity */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="maxCapacity"
                      className="text-sm font-medium text-slate-700"
                    >
                      Max capacity
                    </label>
                    <input
                      id="maxCapacity"
                      type="number"
                      min={1}
                      value={formData.maxCapacity}
                      onChange={(e) => onChange("maxCapacity", e.target.value)}
                      placeholder="e.g. 20"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Status — only in edit mode */}
                  {isEdit && (
                    <div className="space-y-1.5">
                      <label
                        htmlFor="status"
                        className="text-sm font-medium text-slate-700"
                      >
                        Status
                      </label>
                      <select
                        id="status"
                        value={formData.status}
                        onChange={(e) => onChange("status", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        {SLOT_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {error && (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.push(backHref)}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting || !isValid}
                      className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-60"
                    >
                      {submitting ? (
                        <Loader2
                          className="h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                      ) : null}
                      {isEdit ? "Save Changes" : "Add Slot"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
