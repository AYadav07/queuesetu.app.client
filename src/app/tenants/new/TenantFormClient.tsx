"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Building2, Loader2 } from "lucide-react";

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
  accountApi,
  type TenantRequest,
  type TenantPlan,
} from "@/lib/api/account";
import { useAuthStore } from "@/store/use-auth-store";

const PLANS: { value: TenantPlan; label: string; description: string }[] = [
  { value: "FREE", label: "Free", description: "Up to 1 branch, 2 queues" },
  {
    value: "PRO",
    label: "Pro",
    description: "Up to 5 branches, unlimited queues",
  },
  {
    value: "ENTERPRISE",
    label: "Enterprise",
    description: "Unlimited branches and queues",
  },
];

type Props = {
  tenantId?: string; // pass to enter edit mode
  initialName?: string;
  initialPlan?: TenantPlan;
};

export default function TenantFormClient({
  tenantId,
  initialName = "",
  initialPlan = "FREE",
}: Props) {
  const router = useRouter();
  const isEdit = !!tenantId;

  const [hydrated, setHydrated] = useState(() =>
    useAuthStore.persist.hasHydrated(),
  );
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [tenantName, setTenantName] = useState(initialName);
  const [plan, setPlan] = useState<TenantPlan>(initialPlan);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(isEdit);

  // In edit mode, load the current tenant data
  useEffect(() => {
    if (!isEdit || !accessToken || !hydrated) return;
    accountApi
      .getTenant(tenantId!, accessToken)
      .then((t) => {
        setTenantName(t.name);
        if (t.plan && ["FREE", "PRO", "ENTERPRISE"].includes(t.plan)) {
          setPlan(t.plan as TenantPlan);
        }
      })
      .catch(() => {
        /* keep empty defaults */
      })
      .finally(() => setLoadingEdit(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, hydrated, accessToken]);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    return unsub;
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName.trim()) return;
    setSubmitting(true);
    setError(null);
    const body: TenantRequest = { tenantName: tenantName.trim(), plan };
    try {
      if (isEdit) {
        await accountApi.updateTenant(tenantId!, body, accessToken);
        router.push(`/tenants/${tenantId}`);
      } else {
        await accountApi.createTenant(body, accessToken);
        router.push("/tenants");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

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
            {/* Back link */}
            <button
              type="button"
              onClick={() => router.back()}
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>

            {/* Page header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm">
                <Building2
                  className="h-3.5 w-3.5 text-primary"
                  aria-hidden="true"
                />
                <span className="text-xs font-medium text-slate-600">
                  Organisation
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-primary">
                {isEdit ? "Edit Organisation" : "Add Organisation"}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                {isEdit
                  ? "Update your organisation details."
                  : "Set up a new organisation. You can add branches afterwards."}
              </p>
            </div>

            <Card className="rounded-2xl border-slate-200/80 shadow-sm">
              <CardHeader>
                <CardTitle>Organisation details</CardTitle>
                <CardDescription>
                  This will be the top-level entity for all your branches and
                  queues.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="tenantName"
                      className="text-sm font-medium text-slate-700"
                    >
                      Organisation name{" "}
                      <span className="text-destructive" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <input
                      id="tenantName"
                      type="text"
                      required
                      autoFocus
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      placeholder="e.g. City Hospital"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none ring-0 transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Plan */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">Plan</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {PLANS.map((p) => (
                        <label
                          key={p.value}
                          className={`relative flex cursor-pointer flex-col rounded-xl border p-4 transition-all ${
                            plan === p.value
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="plan"
                            value={p.value}
                            checked={plan === p.value}
                            onChange={() => setPlan(p.value)}
                            className="sr-only"
                          />
                          <span className="text-sm font-semibold text-slate-900">
                            {p.label}
                          </span>
                          <span className="mt-1 text-xs text-slate-500">
                            {p.description}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                      {error}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.back()}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting || !tenantName.trim()}
                      className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-60"
                    >
                      {submitting ? (
                        <Loader2
                          className="h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                      ) : null}
                      {isEdit ? "Save Changes" : "Add Organisation"}
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
