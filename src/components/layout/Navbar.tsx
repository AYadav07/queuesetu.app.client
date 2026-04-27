"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { useUIStore } from "@/store/use-ui-store";
import { useAuthStore } from "@/store/use-auth-store";
import { authApi } from "@/lib/api/auth";

export default function Navbar() {
  const router = useRouter();
  const { isMobileMenuOpen, toggleMenu, closeMenu } = useUIStore();

  // Hydration-safe auth state
  const [hydrated, setHydrated] = useState(() =>
    useAuthStore.persist.hasHydrated(),
  );
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    return unsub;
  }, []);

  const isLoggedIn = hydrated && !!user && !!accessToken;

  const handleLogout = async () => {
    closeMenu();
    try {
      if (accessToken) await authApi.logout(accessToken);
    } catch {
      // Proceed regardless
    }
    clearAuth();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-background shadow-sm">
      <Container>
        <nav
          className="flex items-center justify-between px-4 py-3"
          aria-label="Primary navigation"
        >
          <Link
            href={isLoggedIn ? "/dashboard" : "/"}
            onClick={closeMenu}
            className="text-lg font-semibold tracking-tight text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            QueueSetu
          </Link>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={
                isMobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav"
              onClick={toggleMenu}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>

            <div className="hidden items-center gap-2 md:flex">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/tenants"
                    onClick={closeMenu}
                    className="text-sm font-medium text-slate-700 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
                  >
                    Organisations
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={closeMenu}
                    className="text-sm font-medium text-slate-700 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
                  >
                    {user.name.split(" ")[0]}
                  </Link>
                  <Button
                    type="button"
                    variant="outline"
                    aria-label="Logout from QueueSetu"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    aria-label="Login to QueueSetu"
                    onClick={() => {
                      closeMenu();
                      router.push("/login");
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    type="button"
                    aria-label="Get started with QueueSetu"
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={() => {
                      closeMenu();
                      router.push("/register");
                    }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div
            id="mobile-nav"
            className="border-t border-slate-100 px-4 pb-4 md:hidden"
          >
            <div className="mt-3 flex flex-col gap-2">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/tenants"
                    onClick={closeMenu}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    Organisations
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={closeMenu}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    Dashboard
                  </Link>
                  <Button
                    type="button"
                    variant="outline"
                    className="justify-start"
                    aria-label="Logout from QueueSetu"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="justify-start"
                    aria-label="Login to QueueSetu"
                    onClick={() => {
                      closeMenu();
                      router.push("/login");
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    type="button"
                    className="justify-start bg-accent text-accent-foreground hover:bg-accent/90"
                    aria-label="Get started with QueueSetu"
                    onClick={() => {
                      closeMenu();
                      router.push("/register");
                    }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
