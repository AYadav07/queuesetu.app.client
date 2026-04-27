"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, ChevronRight, Loader2, Plus } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import { Container } from "@/components/layout/container";
import Footer from "@/components/layout/Footer";
import QuickActionCards from "@/components/dashboard/QuickActionCards";
import { accountApi, type Tenant } from "@/lib/api/account";
import { useAuthStore } from "@/store/use-auth-store";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomeClient() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(
    () => useAuthStore.persist.hasHydrated(),
  );

  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(true);

  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (hydrated && (!user || !accessToken)) {
      router.replace("/login");
    }
  }, [hydrated, user, accessToken, router]);

  useEffect(() => {
    if (!hydrated || !accessToken) return;
    accountApi
      .getMyTenants(accessToken)
      .then(setTenants)
      .catch(() => {})
      .finally(() => setLoadingTenants(false));
  }, [hydrated, accessToken]);

  if (!hydrated || !user || !accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2
          className="h-8 w-8 animate-spin text-teal-700"
          aria-label="Loading"
        />
      </div>
    );
  }

  const firstName = user.name.split(" ")[0];

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
            {/* Page header */}
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
                <span className="text-xs font-medium text-slate-600">
                  QueueSetu
                </span>
              </div>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                {getGreeting()}, {firstName}.
              </h1>
              <p className="mt-2 text-base leading-7 text-slate-600">
                What would you like to do today?
              </p>
            </div>

            {/* Action cards */}
            <QuickActionCards />

            {/* Your Organisations */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.25, ease: "easeOut" }}
              className="mt-10"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-slate-800">
                    Your Organisations
                  </h2>
                  {!loadingTenants && tenants.length > 0 && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {tenants.length}
                    </span>
                  )}
                </div>
                {tenants.length > 0 && (
                  <Link
                    href="/tenants"
                    className="text-xs font-medium text-accent hover:underline"
                  >
                    View all →
                  </Link>
                )}
              </div>

              {loadingTenants ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : tenants.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-8 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-700">
                    No organisations yet
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Create your first organisation to start managing queues.
                  </p>
                  <Link
                    href="/tenants/new"
                    className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    Add Organisation
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {tenants.slice(0, 3).map((tenant) => (
                    <Link
                      key={tenant.id}
                      href={`/tenants/${tenant.id}`}
                      className="block group"
                    >
                      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Building2 className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {tenant.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {tenant.plan ?? "Free plan"}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              tenant.status === "ACTIVE"
                                ? "bg-accent/10 text-accent"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {tenant.status}
                          </span>
                          <ChevronRight
                            className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                  {tenants.length > 3 && (
                    <Link
                      href="/tenants"
                      className="block py-2 text-center text-sm font-medium text-accent hover:underline"
                    >
                      + {tenants.length - 3} more organisation
                      {tenants.length - 3 !== 1 ? "s" : ""}
                    </Link>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
