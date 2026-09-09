import type { Metadata } from "next";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import FinalCTA from "@/components/sections/FinalCTA";
import FAQ from "@/components/sections/FAQ";
import AndroidWaitlist from "@/components/sections/AndroidWaitlist";
import SectionLabel from "@/components/ui/SectionLabel";
import PlanConfigurator from "@/components/pricing/PlanConfigurator";
import { PRICING_FAQ } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Pricing | Forge",
  description:
    "One price: $249/month includes your first 3 seats, staff or Sub. Additional seats are $39/month for staff and $9.99/month for Subs. 20% off billed annually. 14-day free trial.",
  openGraph: {
    title: "Forge Pricing | First 3 Seats Included",
    description:
      "$249/month covers your first 3 seats, staff or Sub. Additional seats are $39/month for staff and $9.99/month for Subs. No per-walk fees, no usage caps. 14-day free trial.",
    type: "website",
    url: "https://www.forge.equipment/pricing",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

// F075 Sep8 shared included seats; F076 assigned-task access.
export default function PricingPage() {
  return (
    <div className="min-h-screen bg-forge-body text-forge-white">
      <Navbar />

      {/* Page header - clears the fixed Navbar */}
      <header className="max-w-7xl mx-auto px-6 pt-40 pb-8 text-center">
        <SectionLabel>Pricing</SectionLabel>
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-medium tracking-[-0.01em] text-forge-white mt-6">
          Your first three seats included.
        </h1>
        {/* Name both classes where the price is first quoted, per F-075. */}
        <p className="text-forge-smoke text-lg max-w-2xl mx-auto mt-6">
          $249/month covers your first 3 seats, whether staff or Sub seats.
          Beyond those 3, add staff for $39/month each or Subs for $9.99/month
          each. Sub access stays limited to assigned tasks. No per-walk fees,
          no usage caps.
        </p>
      </header>

      {/* Plan card + toggle + seat stepper */}
      <section className="relative py-16 md:py-20 bg-transparent section-depth-b">
        <div className="max-w-7xl mx-auto px-6">
          <PlanConfigurator />
        </div>
      </section>

      {/* FAQ - the 7 Q&As from PRD 9.10 */}
      <FAQ items={PRICING_FAQ} />

      {/* Android waitlist - renders ONLY behind NEXT_PUBLIC_ANDROID_WAITLIST=true */}
      <AndroidWaitlist />

      <FinalCTA />

      <Footer />
    </div>
  );
}
