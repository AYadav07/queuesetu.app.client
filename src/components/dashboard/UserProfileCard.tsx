"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, Mail, Phone, User } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authApi } from "@/lib/api/auth";
import { useAuthStore, type AuthUser } from "@/store/use-auth-store";

type Props = {
  user: AuthUser;
  accessToken: string;
};

export default function UserProfileCard({ user, accessToken }: Props) {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [isLoggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setLoggingOut(true);
    try {
      await authApi.logout(accessToken);
    } catch {
      // Proceed with local logout even if the server call fails
    } finally {
      clearAuth();
      router.push("/login");
    }
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
    >
      <Card className="w-full rounded-xl border-slate-200/80 bg-white/95 shadow-sm">
        <CardHeader className="px-5 pt-6 sm:px-6 sm:pt-7">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal-700 text-lg font-semibold text-white">
              {initials}
            </div>
            <div>
              <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
                {user.name}
              </CardTitle>
              <CardDescription className="text-sm leading-6 text-slate-600">
                Your QueueSetu account
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-5 pb-6 sm:px-6 sm:pb-7">
          <ul className="space-y-3">
            <li className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
              <User className="h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />
              <div>
                <p className="text-xs font-medium text-slate-500">Name</p>
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
              </div>
            </li>

            <li className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
              <Mail className="h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />
              <div>
                <p className="text-xs font-medium text-slate-500">Email</p>
                <p className="text-sm font-medium text-slate-900">{user.email}</p>
              </div>
            </li>

            {user.phone && (
              <li className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <Phone className="h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />
                <div>
                  <p className="text-xs font-medium text-slate-500">Phone</p>
                  <p className="text-sm font-medium text-slate-900">{user.phone}</p>
                </div>
              </li>
            )}

            <li className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
              <div className="h-4 w-4 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs font-medium text-slate-500">Account status</p>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    user.active
                      ? "bg-accent/10 text-accent"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {user.active ? "Active" : "Inactive"}
                </span>
              </div>
            </li>
          </ul>

          <div className="mt-6">
            <Button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant="outline"
              className="w-full border-destructive/40 text-destructive transition-all hover:bg-destructive/5 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Logout from QueueSetu"
            >
              {isLoggingOut ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-destructive/30 border-t-destructive"
                    aria-hidden="true"
                  />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Logout
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
