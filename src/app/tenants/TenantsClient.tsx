"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, ChevronRight, Loader2, Plus } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import { Container } from "@/components/layout/container";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { accountApi, type Tenant } from "@/lib/api/account";
import { useAuthStore } from "@/store/use-auth-store";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: "easeOut" as const } },
};

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "ACTIVE"
      ? "bg-accent/10 text-accent"
      : status === "SUSPENDED"
        ? "bg-red-100 text-red-600"
        : "bg-slate-100 text-slate-500";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

export default function TenantsClient() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  useEffect(() => {
    if (hydrated && (!user || !accessToken)) router.replace("/login");
  }, [hydrated, user, accessToken, router]);

  useEffect(() => {
    if (!hydrated || !accessToken) return;
    accountApi
      .getMyTenants(accessToken)
      .then(setTenants)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [hydrated, accessToken]);

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
            {/* Header */}
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm">
                  <Building2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  <span className="text-xs font-medium text-slate-600">Organisations</span>
                </div>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                  My Organisations
                </h1>
                <p className="mt-2 text-base text-slate-600">
                  Manage your organisations and their branches.
                </p>
              </div>
              <Button
                onClick={() => router.push("/tenants/new")}
                className="mt-2 shrink-0 bg-accent text-accent-foreground hover:bg-accent/90"
                aria-label="Create a new organisation"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add Organisation
              </Button>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600">
                {error}
              </div>
            ) : tenants.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <p className="mt-4 text-base font-semibold text-slate-800">No organisations yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  Create your first organisation to start managing queues.
                </p>
                <Button
                  onClick={() => router.push("/tenants/new")}
                  className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  Add Organisation
                </Button>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {tenants.map((tenant) => (
                  <motion.div key={tenant.id} variants={cardVariants}>
                    <Link href={`/tenants/${tenant.id}`} className="block group">
                      <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Building2 className="h-5 w-5" aria-hidden="true" />
                              </div>
                              <div>
                                <CardTitle className="text-base">{tenant.name}</CardTitle>
                                <CardDescription className="text-xs">
                                  {tenant.plan ?? "No plan"}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <StatusBadge status={tenant.status} />
                              <ChevronRight
                                className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5"
                                aria-hidden="true"
                              />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-slate-500">
                            Created{" "}
                            {new Intl.DateTimeFormat("en-IN", {
                              dateStyle: "medium",
                            }).format(new Date(tenant.createdAt))}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
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
