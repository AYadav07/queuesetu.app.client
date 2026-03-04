"use client";

import Link from "next/link";
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
import { useAuthUIStore } from "@/store/use-auth-ui-store";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const isLoading = useAuthUIStore((state) => state.isLoading);
  const setLoading = useAuthUIStore((state) => state.setLoading);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (isLoading) {
        return;
      }

      setLoading(true);
      window.setTimeout(() => setLoading(false), 900);
    },
    [isLoading, setLoading],
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
            Welcome Back
          </CardTitle>
          <CardDescription className="text-sm leading-6 text-slate-700">
            Login to manage your queues
          </CardDescription>
        </CardHeader>

        <CardContent className="px-5 pb-6 sm:px-6 sm:pb-7">
          <form
            className="space-y-5"
            aria-label="Login form"
            onSubmit={handleSubmit}
          >
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
                  autoComplete="current-password"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus-visible:border-primary/70 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30"
                  placeholder="Enter your password"
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

            <div className="flex items-center justify-between gap-4">
              <label
                htmlFor="remember"
                className="inline-flex items-center gap-2 text-sm text-slate-700"
              >
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-accent focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                />
                Remember me
              </label>

              <Link
                href="#"
                className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent text-accent-foreground transition-all hover:bg-accent/90 hover:shadow-md disabled:cursor-not-allowed disabled:bg-accent/60 disabled:text-accent-foreground/80"
              aria-label="Login to QueueSetu"
            >
              {isLoading ? (
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
            >
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
