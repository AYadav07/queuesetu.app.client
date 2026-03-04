import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/home/HeroSection";
import TrustSection from "@/components/home/TrustSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import CTASection from "@/components/home/CTASection";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="py-12 sm:py-16 lg:py-20">
        <HeroSection />
        <TrustSection />
        <FeaturesSection />
        <CTASection />
      </main>
    </>
  );
}
