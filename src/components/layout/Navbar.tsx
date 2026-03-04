"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { useUIStore } from "@/store/use-ui-store";

export default function Navbar() {
  const { isMobileMenuOpen, toggleMenu, closeMenu } = useUIStore();

  return (
    <header className="sticky top-0 z-50 bg-background shadow-sm">
      <Container>
        <nav
          className="flex items-center justify-between px-4 py-3"
          aria-label="Primary navigation"
        >
          <Link
            href="/"
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
              <Button
                type="button"
                variant="outline"
                aria-label="Login to QueueSetu"
                onClick={closeMenu}
              >
                Login
              </Button>
              <Button
                type="button"
                aria-label="Get started with QueueSetu"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={closeMenu}
              >
                Get Started
              </Button>
            </div>
          </div>
        </nav>
      </Container>
    </header>
  );
}
