"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ClipboardList,
  Loader2,
  MapPin,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import { Container } from "@/components/layout/container";
import Footer from "@/components/layout/Footer";
import { accountApi, type Tenant, type Branch } from "@/lib/api/account";
import { queueApi } from "@/lib/api/queue";
import { useAuthStore } from "@/store/use-auth-store";

// ── Animation variants ─────────────────────────────────────────────────────

const stepVariants = {
  enter: { opacity: 0, x: 24 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

// ── Step indicator ─────────────────────────────────────────────────────────

const STEPS = [
  { label: "Organisation" },
  { label: "Branch" },
  { label: "Queue name" },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-0" aria-label="Progress">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={step.label} className="flex items-center">
            <span className="flex flex-col items-center">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  done
                    ? "bg-accent text-accent-foreground"
                    : active
                      ? "bg-primary text-white ring-2 ring-primary/30"
                      : "bg-slate-100 text-slate-400"
                }`}
                aria-current={active ? "step" : undefined}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={`mt-1 text-xs font-medium ${active ? "text-primary" : done ? "text-accent" : "text-slate-400"}`}
              >
                {step.label}
              </span>
            </span>
            {i < STEPS.length - 1 && (
              <span
                className={`mb-4 h-px w-10 transition-colors sm:w-16 ${i < current ? "bg-accent" : "bg-slate-200"}`}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ── Selectable card ────────────────────────────────────────────────────────

function SelectCard({
  selected,
  onClick,
  icon: Icon,
  title,
  subtitle,
  badge,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full rounded-xl border text-left transition-all duration-200 ${
        selected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
            selected ? "bg-primary text-white" : "bg-primary/10 text-primary"
          }`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800">
            {title}
          </p>
          {subtitle && (
            <p className="truncate text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        {badge && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
            {badge}
          </span>
        )}
        {selected && (
          <CheckCircle2
            className="h-4 w-4 shrink-0 text-primary"
            aria-hidden="true"
          />
        )}
      </div>
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function CreateQueueClient() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(() =>
    useAuthStore.persist.hasHydrated(),
  );
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  // Wizard state
  const [step, setStep] = useState(0);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [queueName, setQueueName] = useState("");

  // Loading / error states
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  // Fetch tenants once hydrated
  useEffect(() => {
    if (!hydrated || !accessToken) return;
    accountApi
      .getMyTenants(accessToken)
      .then(setTenants)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingTenants(false));
  }, [hydrated, accessToken]);

  // Fetch branches when tenant selected
  const handleSelectTenant = async (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setSelectedBranch(null);
    setBranches([]);
    setLoadingBranches(true);
    try {
      const data = await accountApi.getBranchesByTenant(
        tenant.id,
        accessToken!,
      );
      setBranches(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load branches");
    } finally {
      setLoadingBranches(false);
    }
  };

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => {
    setError(null);
    setStep((s) => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant || !selectedBranch || !queueName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await queueApi.createQueue(
        {
          name: queueName.trim(),
          tenantId: selectedTenant.id,
          branchId: selectedBranch.id,
        },
        accessToken!,
      );
      router.push(`/tenants/${selectedTenant.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create queue");
    } finally {
      setSubmitting(false);
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
              onClick={() => (step === 0 ? router.back() : handleBack())}
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {step === 0 ? "Back" : "Previous step"}
            </button>

            {/* Page header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm">
                <ClipboardList
                  className="h-3.5 w-3.5 text-primary"
                  aria-hidden="true"
                />
                <span className="text-xs font-medium text-slate-600">
                  Create Queue
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-primary">
                New Queue
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Choose an organisation and branch, then name your queue.
              </p>
            </div>

            {/* Step indicator */}
            <div className="mb-8 flex justify-center">
              <StepIndicator current={step} />
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Step panels */}
            <AnimatePresence mode="wait">
              {/* ── Step 0: Select organisation ── */}
              {step === 0 && (
                <motion.div
                  key="step-org"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <h2 className="mb-1 text-base font-semibold text-slate-800">
                      Select an organisation
                    </h2>
                    <p className="mb-4 text-xs text-slate-500">
                      The queue will belong to this organisation.
                    </p>

                    {loadingTenants ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    ) : tenants.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                        <Building2 className="mx-auto h-8 w-8 text-slate-400" />
                        <p className="mt-3 text-sm font-medium text-slate-700">
                          No organisations yet
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Create an organisation first before adding a queue.
                        </p>
                        <button
                          type="button"
                          onClick={() => router.push("/tenants/new")}
                          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90"
                        >
                          Add Organisation
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {tenants.map((t) => (
                          <SelectCard
                            key={t.id}
                            selected={selectedTenant?.id === t.id}
                            onClick={() => handleSelectTenant(t)}
                            icon={Building2}
                            title={t.name}
                            subtitle={t.plan ?? "Free plan"}
                            badge={t.status}
                          />
                        ))}
                      </div>
                    )}

                    {tenants.length > 0 && (
                      <button
                        type="button"
                        disabled={!selectedTenant}
                        onClick={handleNext}
                        className="mt-6 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Continue
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── Step 1: Select branch ── */}
              {step === 1 && (
                <motion.div
                  key="step-branch"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <h2 className="mb-1 text-base font-semibold text-slate-800">
                      Select a branch
                    </h2>
                    <p className="mb-4 text-xs text-slate-500">
                      Branches of{" "}
                      <span className="font-medium text-slate-700">
                        {selectedTenant?.name}
                      </span>
                    </p>

                    {loadingBranches ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    ) : branches.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                        <MapPin className="mx-auto h-8 w-8 text-slate-400" />
                        <p className="mt-3 text-sm font-medium text-slate-700">
                          No branches yet
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Add a branch to this organisation first.
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/tenants/${selectedTenant!.id}/branches/new`,
                            )
                          }
                          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90"
                        >
                          Add Branch
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {branches.map((b) => (
                          <SelectCard
                            key={b.id}
                            selected={selectedBranch?.id === b.id}
                            onClick={() => setSelectedBranch(b)}
                            icon={MapPin}
                            title={b.name}
                            subtitle={[b.city, b.address]
                              .filter(Boolean)
                              .join(", ")}
                            badge={b.status}
                          />
                        ))}
                      </div>
                    )}

                    {branches.length > 0 && (
                      <button
                        type="button"
                        disabled={!selectedBranch}
                        onClick={handleNext}
                        className="mt-6 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Continue
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── Step 2: Name the queue ── */}
              {step === 2 && (
                <motion.div
                  key="step-name"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <h2 className="mb-1 text-base font-semibold text-slate-800">
                      Name your queue
                    </h2>
                    <p className="mb-4 text-xs text-slate-500">
                      Queue at{" "}
                      <span className="font-medium text-slate-700">
                        {selectedBranch?.name}
                      </span>{" "}
                      ·{" "}
                      <span className="font-medium text-slate-700">
                        {selectedTenant?.name}
                      </span>
                    </p>

                    {/* Summary chips */}
                    <div className="mb-5 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                        <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                        {selectedTenant?.name}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        {selectedBranch?.name}
                      </span>
                    </div>

                    <form
                      onSubmit={handleSubmit}
                      className="space-y-5"
                      noValidate
                    >
                      <div className="space-y-1.5">
                        <label
                          htmlFor="queueName"
                          className="text-sm font-medium text-slate-700"
                        >
                          Queue name{" "}
                          <span className="text-destructive" aria-hidden="true">
                            *
                          </span>
                        </label>
                        <input
                          id="queueName"
                          type="text"
                          required
                          autoFocus
                          value={queueName}
                          onChange={(e) => setQueueName(e.target.value)}
                          placeholder="e.g. General Consultation, Token Counter A"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting || !queueName.trim()}
                        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {submitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2
                              className="h-4 w-4 animate-spin"
                              aria-hidden="true"
                            />
                            Creating…
                          </span>
                        ) : (
                          "Create Queue"
                        )}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
