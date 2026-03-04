import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterForm() {
  return (
    <Card className="w-full rounded-xl shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-bold text-slate-900">
          Create Account
        </CardTitle>
        <CardDescription className="text-sm text-slate-600">
          Start managing queues smarter
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" aria-label="Register form">
          <div className="space-y-2">
            <label
              htmlFor="fullName"
              className="text-sm font-medium text-slate-700"
            >
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-primary/40"
              placeholder="Enter your full name"
            />
          </div>

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
              autoComplete="new-password"
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-primary/40"
              placeholder="Create a password"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-slate-700"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-primary/40"
              placeholder="Confirm your password"
            />
          </div>

          <label
            htmlFor="terms"
            className="inline-flex items-start gap-2 text-sm text-slate-600"
          >
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-accent focus-visible:ring-2 focus-visible:ring-primary/40"
            />
            <span>
              I agree to the{" "}
              <Link
                href="#"
                className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                terms &amp; conditions
              </Link>
            </span>
          </label>

          <Button
            type="submit"
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            aria-label="Create QueueSetu account"
          >
            Create Account
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
