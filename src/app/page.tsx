import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/home/HeroSection";
import TrustSection from "@/components/home/TrustSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="py-12 sm:py-16 lg:py-20">
        <HeroSection />
        <TrustSection />

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md">
            <h2 className="text-lg font-semibold text-slate-900">
              Live Queue Status
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Give customers accurate queue visibility and reduce uncertainty.
            </p>
          </article>
          <article className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md">
            <h2 className="text-lg font-semibold text-slate-900">
              Smart Token Flow
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Organize peak hours with efficient token assignment and
              prioritization.
            </p>
          </article>
          <article className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md sm:col-span-2 lg:col-span-1">
            <h2 className="text-lg font-semibold text-slate-900">
              Actionable Insights
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Track service performance and identify bottlenecks with clarity.
            </p>
          </article>
        </section>

        <section className="mt-8 rounded-xl bg-primary p-6 text-white shadow-md sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Ready to modernize your queue operations?
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-100 sm:text-base">
            Launch QueueSetu quickly with a setup tailored for clinics, retail,
            and service centers.
          </p>
          <button className="mt-6 rounded-xl bg-accent px-5 py-3 text-sm font-medium text-slate-900 shadow-sm transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
            Book a Consultation
          </button>
        </section>
      </main>
    </>
  );
}
