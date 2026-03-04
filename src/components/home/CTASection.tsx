import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section
      className="mt-8 rounded-xl bg-primary p-6 text-center text-white shadow-sm sm:p-8"
      aria-label="Call to action"
    >
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Ready to eliminate long queues?
      </h2>
      <div className="mt-6 flex justify-center">
        <Button
          type="button"
          className="bg-accent text-accent-foreground shadow-sm transition-transform hover:scale-[1.02] hover:bg-accent/90 focus-visible:ring-white/60"
        >
          Start Free Today
        </Button>
      </div>
    </section>
  );
}
