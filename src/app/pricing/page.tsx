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
    "One price: $249/month includes your first 3 staff seats, +$39/month per additional staff seat, and $9.99/month per sub seat as an add-on. 20% off billed annually. 14-day free trial.",
  openGraph: {
    title: "Forge Pricing | One Price, First 3 Seats Included",
    description:
      "$249/month covers your first 3 staff seats. Add staff for $39/month each, subs for $9.99/month each. No per-walk fees, no usage caps. 14-day free trial.",
    type: "website",
    url: "https://www.forge.equipment/pricing",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

// Pricing page - PRD 9.10, word-for-word.
export default function PricingPage() {
  return (
    <div className="min-h-screen bg-forge-body text-forge-white">
      <Navbar />

      {/* Page header - clears the fixed Navbar */}
      <header className="max-w-7xl mx-auto px-6 pt-40 pb-8 text-center">
        <SectionLabel>Pricing</SectionLabel>
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-medium tracking-[-0.01em] text-forge-white mt-6">
          One price. Your first three seats included.
        </h1>
        {/* F-075 (RZ ruling 2026-09-07). This paragraph used to quote one
            seat price for "teammates", and the FAQ below it counted a sub
            as one of those teammates, so the page as a whole told a
            contractor a subcontractor costs $39 and eats an included seat.
            Both halves are wrong and the Master Subscription Agreement
            (3.4) has always said so. The two classes are named here, where
            the price is quoted, rather than only in the FAQ, because the
            FAQ is where a reader goes to CHECK a number they already
            read. */}
        <p className="text-forge-smoke text-lg max-w-2xl mx-auto mt-6">
          $249/month covers your first 3 staff seats: owner, PM, and
          estimator, however you split it. Add staff for $39/month each.
          Subcontractors get their own seat at $9.99/month, always an
          add-on, so bringing a sub on never uses one of your 3 included
          seats. No per-walk fees, no usage caps.
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
