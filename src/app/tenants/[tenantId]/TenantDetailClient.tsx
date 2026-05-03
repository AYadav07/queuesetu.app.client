"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  GitBranch,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Trash2,
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
import { accountApi, type Tenant, type Branch } from "@/lib/api/account";
import { queueApi, type Queue } from "@/lib/api/queue";
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

type Props = { tenantId: string };

export default function TenantDetailClient({ tenantId }: Props) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(() =>
    useAuthStore.persist.hasHydrated(),
  );
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchQueues, setBranchQueues] = useState<Record<string, Queue[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<string | null>(null);

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
      const [t, b] = await Promise.all([
        accountApi.getTenant(tenantId, accessToken),
        accountApi.getBranchesByTenant(tenantId, accessToken),
//         queueApi
//           .getQueuesByTenant(tenantId, accessToken)
//           .catch(() => [] as Queue[]),
      ]);
      setTenant(t);
      setBranches(b);
      // Group queues by branchId
//       const grouped: Record<string, Queue[]> = {};
//       for (const q of allQueues) {
//         (grouped[q.branchId] ??= []).push(q);
//       }
//       setBranchQueues(grouped);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load data";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [tenantId, accessToken]);

  useEffect(() => {
    if (hydrated && accessToken) loadData();
  }, [hydrated, accessToken, loadData]);

  const handleDeleteBranch = async (branchId: string) => {
    if (!accessToken || !confirm("Delete this branch? This cannot be undone."))
      return;
    setDeletingBranch(branchId);
    try {
      await accountApi.deleteBranch(branchId, accessToken);
      setBranches((prev) => prev.filter((b) => b.id !== branchId));
      toast.success("Branch deleted successfully");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Delete failed";
      toast.error(message);
    } finally {
      setDeletingBranch(null);
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
            className="mx-auto max-w-3xl"
          >
            {/* Back */}
            <button
              type="button"
              onClick={() => router.push("/tenants")}
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              All Tenants
            </button>

            {loading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600">
                {error}
              </div>
            ) : tenant ? (
              <>
                {/* Tenant Card */}
                <Card className="mb-8 overflow-hidden rounded-2xl border-slate-200/80 shadow-sm">
                  <div className="h-1 w-full bg-primary" />
                  <CardHeader className="flex flex-row items-start justify-between gap-4 pt-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Building2 className="h-7 w-7" aria-hidden="true" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">
                          {tenant.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span>{tenant.plan ?? "No plan"}</span>
                          <span aria-hidden="true">·</span>
                          <StatusBadge status={tenant.status} />
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/tenants/${tenantId}/edit`)}
                      aria-label="Edit tenant"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      Edit
                    </Button>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <p className="text-xs text-slate-500">
                      Created{" "}
                      {new Intl.DateTimeFormat("en-IN", {
                        dateStyle: "long",
                      }).format(new Date(tenant.createdAt))}
                    </p>
                  </CardContent>
                </Card>

                {/* Branches section */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">
                      Branches
                    </h2>
                    <p className="text-sm text-slate-500">
                      {branches.length} branch
                      {branches.length !== 1 ? "es" : ""}
                    </p>
                  </div>
                  <Button
                    onClick={() =>
                      router.push(`/tenants/${tenantId}/branches/new`)
                    }
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                    aria-label="Add a new branch"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add Branch
                  </Button>
                </div>

                {branches.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                      <GitBranch
                        className="h-6 w-6 text-accent"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-slate-800">
                      No branches yet
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Add a branch to start creating queues and counters.
                    </p>
                    <Button
                      onClick={() =>
                        router.push(`/tenants/${tenantId}/branches/new`)
                      }
                      className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      Add Branch
                    </Button>
                  </div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-3"
                  >
                    {branches.map((branch) => (
                      <motion.div key={branch.id} variants={itemVariants}>
                        <Card className="transition-all duration-200 hover:shadow-md">
                          <CardContent className="flex items-start justify-between gap-4 pt-5 pb-5">
                            <Link
                              href={`/tenants/${tenantId}/branches/${branch.id}`}
                              className="flex items-start gap-3 flex-1 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-lg"
                            >
                              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                                <GitBranch
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-slate-900 truncate">
                                    {branch.name}
                                  </p>
                                  <StatusBadge status={branch.status} />
                                </div>
                                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                  {branch.address && (
                                    <span className="flex items-center gap-1">
                                      <MapPin
                                        className="h-3 w-3"
                                        aria-hidden="true"
                                      />
                                      {branch.address}, {branch.city}{" "}
                                      {branch.pinCode}
                                    </span>
                                  )}
                                  {branch.phoneCode && (
                                    <span className="flex items-center gap-1">
                                      <Phone
                                        className="h-3 w-3"
                                        aria-hidden="true"
                                      />
                                      {branch.phoneCode}
                                    </span>
                                  )}
                                </div>

                                {/* Queues for this branch */}
                                <div className="mt-3">
                                  {(branchQueues[branch.id] ?? []).length >
                                  0 ? (
                                    <div className="space-y-1.5">
                                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                        Queues ({branchQueues[branch.id].length}
                                        )
                                      </p>
                                      {branchQueues[branch.id].map((q) => (
                                        <div
                                          key={q.id}
                                          className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5"
                                        >
                                          <span
                                            className="h-1.5 w-1.5 rounded-full bg-primary"
                                            aria-hidden="true"
                                          />
                                          <span className="text-xs font-medium text-slate-700">
                                            {q.name}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-slate-400">
                                      No queues yet
                                    </p>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => router.push(`/create-queue`)}
                                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                                  >
                                    <Plus
                                      className="h-3 w-3"
                                      aria-hidden="true"
                                    />
                                    Add queue
                                  </button>
                                </div>
                              </div>
                            </Link>
                            <div className="flex shrink-0 items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  router.push(
                                    `/tenants/${tenantId}/branches/${branch.id}/edit`,
                                  )
                                }
                                aria-label={`Edit branch ${branch.name}`}
                              >
                                <Pencil
                                  className="h-4 w-4 text-slate-500"
                                  aria-hidden="true"
                                />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={deletingBranch === branch.id}
                                onClick={() => handleDeleteBranch(branch.id)}
                                aria-label={`Delete branch ${branch.name}`}
                              >
                                {deletingBranch === branch.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                                ) : (
                                  <Trash2
                                    className="h-4 w-4 text-destructive"
                                    aria-hidden="true"
                                  />
                                )}
                              </Button>
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
