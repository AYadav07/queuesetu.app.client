"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import { Container } from "@/components/layout/container";
import Footer from "@/components/layout/Footer";
import UserProfileCard from "@/components/dashboard/UserProfileCard";
import { useAuthStore } from "@/store/use-auth-store";

/**
 * DashboardClient handles hydration-safe access to the persisted auth store
 * and redirects unauthenticated users to /login.
 */
export default function DashboardClient() {
  const router = useRouter();
  // Initialise with current hydration status; update via onFinishHydration callback
  const [hydrated, setHydrated] = useState(
    () => useAuthStore.persist.hasHydrated(),
  );

  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    // Subscribe to hydration completion (fires the setter inside a callback,
    // not directly in the effect body — satisfies the React Compiler rule)
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

  return (
    <>
      <Navbar />
      <main className="py-10 sm:py-16 lg:py-20">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mx-auto max-w-2xl"
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                Dashboard
              </h1>
              <p className="mt-2 text-base leading-7 text-slate-600">
                Welcome back, {user.name.split(" ")[0]}. Manage your account
                below.
              </p>
            </div>

            <UserProfileCard user={user} accessToken={accessToken} />
          </motion.div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
