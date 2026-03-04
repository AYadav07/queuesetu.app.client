import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center lg:max-w-6xl">
        <div className="grid w-full overflow-hidden rounded-xl shadow-sm lg:min-h-160 lg:grid-cols-2">
          <aside className="hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-center">
            <div>
              <p className="text-3xl font-bold tracking-tight">QueueSetu</p>
              <p className="mt-3 text-base text-primary-foreground/85">
                Smart Queue Management
              </p>
            </div>
          </aside>

          <section
            className="flex items-center justify-center bg-white p-6 sm:p-8 lg:p-10"
            aria-label="Authentication form section"
          >
            <div className="w-full max-w-md">{children}</div>
          </section>
        </div>
      </div>
    </div>
  );
}
