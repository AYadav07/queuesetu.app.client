import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/home/HeroSection";
import TrustSection from "@/components/home/TrustSection";
import FeaturesSection from "@/components/home/FeaturesSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="py-12 sm:py-16 lg:py-20">
        <HeroSection />
        <TrustSection />
        <FeaturesSection />

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
