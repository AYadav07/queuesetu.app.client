"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Layers, Loader2 } from "lucide-react";

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
  type CreateServiceDefinitionRequest,
  type UpdateServiceDefinitionRequest,
} from "@/lib/api/booking";
import { accountApi } from "@/lib/api/account";
import { useAuthStore } from "@/store/use-auth-store";
import { toast } from "@/store/use-toast-store";

type Props =
  | { mode: "create"; branchId: string; serviceId?: never }
  | { mode: "edit"; serviceId: string; branchId?: never };

export default function ServiceFormClient({
  mode,
  branchId: branchIdProp,
  serviceId,
}: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [hydrated, setHydrated] = useState(() =>
    useAuthStore.persist.hasHydrated(),
  );
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [branchId, setBranchId] = useState(branchIdProp ?? "");
  const [tenantId, setTenantId] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(true); // always fetch something on mount

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    avgDurationMin: "",
    bufferDurationMin: "",
    active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    return unsub;
  }, []);

  // In edit mode, load service data to pre-populate and derive branchId/tenantId.
  // In create mode, fetch branch to get tenantId.
  useEffect(() => {
    if (!accessToken || !hydrated) return;
    if (isEdit) {
      bookingApi
        .getService(serviceId!, accessToken)
        .then((s) => {
          setBranchId(s.branchId);
          setTenantId(s.tenantId);
          setFormData({
            name: s.name,
            description: s.description ?? "",
            avgDurationMin:
              s.avgDurationMin != null ? String(s.avgDurationMin) : "",
            bufferDurationMin:
              s.bufferDurationMin != null ? String(s.bufferDurationMin) : "",
            active: s.active,
          });
        })
        .catch(() => {})
        .finally(() => setLoadingEdit(false));
    } else {
      accountApi
        .getBranch(branchIdProp!, accessToken)
        .then((b) => setTenantId(b.tenantId))
        .catch(() => {})
        .finally(() => setLoadingEdit(false));
    }
  }, [isEdit, serviceId, branchIdProp, accessToken, hydrated]);

  useEffect(() => {
    if (hydrated && (!user || !accessToken)) router.replace("/login");
  }, [hydrated, user, accessToken, router]);

  if (!hydrated || !user || !accessToken || loadingEdit) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
      </div>
    );
  }

  const onChange = (id: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const isValid = formData.name.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      if (isEdit) {
        const body: UpdateServiceDefinitionRequest = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          avgDurationMin: formData.avgDurationMin
            ? Number(formData.avgDurationMin)
            : undefined,
          bufferDurationMin: formData.bufferDurationMin
            ? Number(formData.bufferDurationMin)
            : undefined,
          active: formData.active,
        };
        await bookingApi.updateService(serviceId!, body, accessToken);
        router.push(`/service/${serviceId}`);
      } else {
        const body: CreateServiceDefinitionRequest = {
          tenantId,
          branchId,
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          avgDurationMin: formData.avgDurationMin
            ? Number(formData.avgDurationMin)
            : undefined,
          bufferDurationMin: formData.bufferDurationMin
            ? Number(formData.bufferDurationMin)
            : undefined,
          active: formData.active,
        };
        await bookingApi.createService(body, accessToken);
        router.push(`/branch/${branchId}`);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast.error(message);
      setSubmitting(false);
    }
  };

  const backHref = isEdit ? `/service/${serviceId}` : `/branch/${branchId}`;

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
              {isEdit ? "Back to Service" : "Back to Branch"}
            </button>

            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm">
                <Layers
                  className="h-3.5 w-3.5 text-accent"
                  aria-hidden="true"
                />
                <span className="text-xs font-medium text-slate-600">
                  Service
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-primary">
                {isEdit ? "Edit Service" : "Add a Service"}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                {isEdit
                  ? "Update the service details."
                  : "A service is offered at a branch and can have multiple time slots."}
              </p>
            </div>

            <Card className="rounded-2xl border-slate-200/80 shadow-sm">
              <CardHeader>
                <CardTitle>Service details</CardTitle>
                <CardDescription>
                  Fill in the name and duration information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-slate-700"
                    >
                      Service name{" "}
                      <span className="text-destructive" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      autoFocus
                      value={formData.name}
                      onChange={(e) => onChange("name", e.target.value)}
                      placeholder="e.g. General Consultation"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="description"
                      className="text-sm font-medium text-slate-700"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => onChange("description", e.target.value)}
                      placeholder="Optional description of this service"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  {/* Duration fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="avgDurationMin"
                        className="text-sm font-medium text-slate-700"
                      >
                        Avg duration (min)
                      </label>
                      <input
                        id="avgDurationMin"
                        type="number"
                        min={1}
                        value={formData.avgDurationMin}
                        onChange={(e) =>
                          onChange("avgDurationMin", e.target.value)
                        }
                        placeholder="e.g. 15"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="bufferDurationMin"
                        className="text-sm font-medium text-slate-700"
                      >
                        Buffer (min)
                      </label>
                      <input
                        id="bufferDurationMin"
                        type="number"
                        min={0}
                        value={formData.bufferDurationMin}
                        onChange={(e) =>
                          onChange("bufferDurationMin", e.target.value)
                        }
                        placeholder="e.g. 5"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  {/* Active toggle */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData.active}
                      onClick={() => onChange("active", !formData.active)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                        formData.active ? "bg-primary" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                          formData.active ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <label className="text-sm font-medium text-slate-700">
                      {formData.active ? "Active" : "Inactive"}
                    </label>
                  </div>

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
                      {isEdit ? "Save Changes" : "Add Service"}
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
