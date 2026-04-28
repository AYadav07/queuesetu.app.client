"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useCallback, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/store/use-auth-store";

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (isLoading) return;

      const form = event.currentTarget;
      const name = (form.elements.namedItem("fullName") as HTMLInputElement).value.trim();
      const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
      const password = (form.elements.namedItem("password") as HTMLInputElement).value;
      const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;
      const terms = (form.elements.namedItem("terms") as HTMLInputElement).checked;

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (!terms) {
        setError("You must accept the terms & conditions.");
        return;
      }

      setError(null);
      setLoading(true);

      try {
        await authApi.signUp({ name, email, password });
        // Auto-login after registration
        const loginRes = await authApi.login({ email, password });
        const userRes = await authApi.me(loginRes.accessToken);
        setAuth(
          {
            id: userRes.id,
            name: userRes.name,
            email: userRes.email,
            phone: userRes.phone,
            active: userRes.active,
          },
          loginRes.accessToken,
          loginRes.refreshToken,
        );
        router.push("/dashboard");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Registration failed. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [isLoading, router, setAuth],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
    >
      <Card className="w-full rounded-xl border-slate-200/80 bg-white/95 shadow-sm">
        <CardHeader className="space-y-2.5 px-5 pt-6 sm:px-6 sm:pt-7">
          <CardTitle className="text-3xl font-semibold tracking-tight text-slate-900">
            Create Account
          </CardTitle>
          <CardDescription className="text-sm leading-6 text-slate-700">
            Start managing queues smarter
          </CardDescription>
        </CardHeader>

        <CardContent className="px-5 pb-6 sm:px-6 sm:pb-7">
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <form
            className="space-y-5"
            aria-label="Register form"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <label
                htmlFor="fullName"
                className="text-sm font-medium text-slate-800"
              >
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus-visible:border-primary/70 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30"
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-800"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus-visible:border-primary/70 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-800"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus-visible:border-primary/70 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-slate-500 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-slate-800"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus-visible:border-primary/70 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-slate-500 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <label
              htmlFor="terms"
              className="inline-flex items-start gap-2 text-sm text-slate-700"
            >
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-accent focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              />
              <span>
                I agree to the{" "}
                <Link
                  href="#"
                  className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
                >
                  terms &amp; conditions
                </Link>
              </span>
            </label>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent text-accent-foreground transition-all hover:bg-accent/90 hover:shadow-md disabled:cursor-not-allowed disabled:bg-accent/60 disabled:text-accent-foreground/80"
              aria-label="Create QueueSetu account"
            >
              {isLoading ? (
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
            >
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
