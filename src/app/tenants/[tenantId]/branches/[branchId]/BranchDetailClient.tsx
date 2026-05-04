"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  GitBranch,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Stethoscope,
  Trash2,
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
import { accountApi, type Branch } from "@/lib/api/account";
import {
  bookingApi,
  type ServiceDefinition,
  type CreateServiceDefinitionRequest,
} from "@/lib/api/booking";
import { useAuthStore } from "@/store/use-auth-store";
import { toast } from "@/store/use-toast-store";

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

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "ACTIVE"
      ? "bg-accent/10 text-accent"
      : status === "SUSPENDED"
        ? "bg-red-100 text-red-600"
        : "bg-slate-100 text-slate-500";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {status}
    </span>
  );
}

// ── Add Service Modal ──────────────────────────────────────────────────────

type AddServiceModalProps = {
  tenantId: string;
  branchId: string;
  onClose: () => void;
  onCreated: (svc: ServiceDefinition) => void;
  accessToken: string;
};

function AddServiceModal({
  tenantId,
  branchId,
  onClose,
  onCreated,
  accessToken,
}: AddServiceModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avgDuration, setAvgDuration] = useState("");
  const [bufferDuration, setBufferDuration] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    const body: CreateServiceDefinitionRequest = {
      tenantId,
      branchId,
      name: name.trim(),
      description: description.trim() || undefined,
      avgDurationMin: avgDuration ? parseInt(avgDuration, 10) : undefined,
      bufferDurationMin: bufferDuration
        ? parseInt(bufferDuration, 10)
        : undefined,
      active: true,
    };
    try {
      const created = await bookingApi.createService(body, accessToken);
      onCreated(created);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create service";
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
            <Stethoscope className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-base font-semibold text-slate-900">
              Add Service
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

        <form
          onSubmit={handleSubmit}
          className="space-y-4 px-6 py-5"
          noValidate
        >
          {/* Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="svc-name"
              className="text-sm font-medium text-slate-700"
            >
              Service name{" "}
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id="svc-name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. General Consultation"
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="svc-desc"
              className="text-sm font-medium text-slate-700"
            >
              Description
            </label>
            <textarea
              id="svc-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description (optional)"
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Durations */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="svc-avg"
                className="text-sm font-medium text-slate-700"
              >
                Avg. duration (min)
              </label>
              <input
                id="svc-avg"
                type="number"
                min={1}
                value={avgDuration}
                onChange={(e) => setAvgDuration(e.target.value)}
                placeholder="e.g. 15"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="svc-buf"
                className="text-sm font-medium text-slate-700"
              >
                Buffer (min)
              </label>
              <input
                id="svc-buf"
                type="number"
                min={0}
                value={bufferDuration}
                onChange={(e) => setBufferDuration(e.target.value)}
                placeholder="e.g. 5"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
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
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              Add Service
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

type Props = { branchId: string };

export default function BranchDetailClient({ branchId }: Props) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(() =>
    useAuthStore.persist.hasHydrated(),
  );
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [branch, setBranch] = useState<Branch | null>(null);
  const [services, setServices] = useState<ServiceDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddService = () => {
    router.push(`/branch/${branchId}/add-new-service`);
  };

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
      const [b, svcs] = await Promise.all([
        accountApi.getBranch(branchId, accessToken),
        bookingApi.getServicesByBranch(branchId, accessToken),
      ]);
      setBranch(b);
      setServices(svcs);
      // no need to store tenantId separately — use branch.tenantId
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load data";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [branchId, accessToken]);

  useEffect(() => {
    if (hydrated && accessToken) loadData();
  }, [hydrated, accessToken, loadData]);

  const handleServiceCreated = (svc: ServiceDefinition) => {
    setServices((prev) => [...prev, svc]);
    setShowAddModal(false);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!accessToken || !confirm("Delete this service? This cannot be undone."))
      return;
    setDeletingId(serviceId);
    try {
      await bookingApi.deleteService(serviceId, accessToken);
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
      toast.success("Service deleted");
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
        {showAddModal && branch && accessToken && (
          <AddServiceModal
            tenantId={branch.tenantId}
            branchId={branchId}
            accessToken={accessToken}
            onClose={() => setShowAddModal(false)}
            onCreated={handleServiceCreated}
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
              onClick={() => router.push(`/tenant/${branch?.tenantId}`)}
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Organisation
            </button>

            {loading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600">
                {error}
              </div>
            ) : branch ? (
              <>
                {/* Branch Card */}
                <Card className="mb-8 overflow-hidden rounded-2xl border-slate-200/80 shadow-sm">
                  <div className="h-1 w-full bg-accent" />
                  <CardHeader className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                          <GitBranch className="h-7 w-7" aria-hidden="true" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl">
                            {branch.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            <StatusBadge status={branch.status} />
                          </CardDescription>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => router.push(`/branch/${branchId}/edit`)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                        aria-label="Edit branch"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                      {branch.address && (
                        <span className="flex items-center gap-1.5">
                          <MapPin
                            className="h-4 w-4 shrink-0 text-slate-400"
                            aria-hidden="true"
                          />
                          {branch.address}, {branch.city} — {branch.pinCode}
                        </span>
                      )}
                      {branch.phoneCode && (
                        <span className="flex items-center gap-1.5">
                          <Phone
                            className="h-4 w-4 shrink-0 text-slate-400"
                            aria-hidden="true"
                          />
                          {branch.phoneCode}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Services header */}
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">
                      Services
                    </h2>
                    <p className="text-sm text-slate-500">
                      {services.length} service
                      {services.length !== 1 ? "s" : ""} in this branch
                    </p>
                  </div>
                  <Button
                    onClick={handleAddService}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    aria-label="Add a new service"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add Service
                  </Button>
                </div>

                {/* Services list */}
                {services.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Stethoscope
                        className="h-6 w-6 text-primary"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-4 text-base font-semibold text-slate-800">
                      No services yet
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Add services to this branch so customers can book
                      appointments.
                    </p>
                    <Button
                      onClick={handleAddService}
                      className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Add Service
                    </Button>
                  </div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-4 sm:grid-cols-2"
                  >
                    {services.map((svc) => (
                      <motion.div key={svc.id} variants={itemVariants}>
                        <Card className="h-full transition-all duration-200 hover:shadow-md">
                          <CardContent className="flex h-full flex-col justify-between pt-5 pb-4 px-5">
                            <Link
                              href={`/service/${svc.id}`}
                              className="flex-1 focus-visible:outline-none"
                            >
                              <div className="mb-3 flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Stethoscope
                                      className="h-4 w-4"
                                      aria-hidden="true"
                                    />
                                  </div>
                                  <p className="font-semibold text-slate-900 leading-tight">
                                    {svc.name}
                                  </p>
                                </div>
                                <span
                                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                                    svc.active
                                      ? "bg-accent/10 text-accent"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {svc.active ? "Active" : "Inactive"}
                                </span>
                              </div>

                              {svc.description && (
                                <p className="text-sm text-slate-500 leading-relaxed">
                                  {svc.description}
                                </p>
                              )}

                              <div className="mt-3 flex gap-4 text-xs text-slate-500">
                                {svc.avgDurationMin != null && (
                                  <span className="flex items-center gap-1">
                                    <Clock
                                      className="h-3.5 w-3.5"
                                      aria-hidden="true"
                                    />
                                    {svc.avgDurationMin} min avg
                                  </span>
                                )}
                                {svc.bufferDurationMin != null && (
                                  <span className="flex items-center gap-1">
                                    <Clock
                                      className="h-3.5 w-3.5 text-slate-300"
                                      aria-hidden="true"
                                    />
                                    {svc.bufferDurationMin} min buffer
                                  </span>
                                )}
                              </div>
                            </Link>

                            <div className="mt-4 flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  router.push(`/service/${svc.id}/edit`);
                                }}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                                aria-label={`Edit service ${svc.name}`}
                              >
                                <Pencil
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                              </button>
                              <button
                                type="button"
                                disabled={deletingId === svc.id}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDeleteService(svc.id);
                                }}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:opacity-40"
                                aria-label={`Delete service ${svc.name}`}
                              >
                                {deletingId === svc.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                  />
                                )}
                              </button>
                            </div>
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
