export default function Home() {
  return (
    <main className="py-12 sm:py-16 lg:py-20">
      <section className="rounded-xl bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <span className="inline-flex rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
          QueueSetu
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-primary sm:text-4xl lg:text-5xl">
          Reduce waiting time. Improve customer flow.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          QueueSetu helps businesses manage queues with real-time updates, clear
          visibility, and a smoother check-in experience.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button className="rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
            Start Free Trial
          </button>
          <button className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300">
            View Demo
          </button>
        </div>
      </section>

      <section className="mt-8 rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Trusted by modern service teams
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-600 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-100 px-4 py-3">
            CarePlus
          </div>
          <div className="rounded-xl border border-slate-100 px-4 py-3">
            UrbanMed
          </div>
          <div className="rounded-xl border border-slate-100 px-4 py-3">
            CityServe
          </div>
          <div className="rounded-xl border border-slate-100 px-4 py-3">
            QueueWorks
          </div>
        </div>
      </section>

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
  );
}
