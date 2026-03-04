import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginForm() {
  return (
    <Card className="w-full rounded-xl shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-bold text-slate-900">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-sm text-slate-600">
          Login to manage your queues
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" aria-label="Login form">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-primary/40"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-primary/40"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="remember"
              className="inline-flex items-center gap-2 text-sm text-slate-600"
            >
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-accent focus-visible:ring-2 focus-visible:ring-primary/40"
              />
              Remember me
            </label>

            <Link
              href="#"
              className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            aria-label="Login to QueueSetu"
          >
            Login
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            href="#"
            className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Register
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
