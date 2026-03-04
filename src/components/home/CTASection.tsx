import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section
      className="relative mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8"
      aria-label="Call to action"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-primary/80"
      />
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        Ready to eliminate long queues?
      </h2>
      <div className="mt-6 flex justify-center">
        <Button
          type="button"
          aria-label="Start free trial today"
          className="bg-accent text-accent-foreground shadow-sm transition-transform hover:scale-[1.02] hover:bg-accent/90 hover:shadow-md focus-visible:ring-primary/50"
        >
          Start Free Today
        </Button>
      </div>
    </section>
  );
}
