"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Hexagon, Menu, X } from "lucide-react";
import Navbar from "@/components/sections/Navbar";
import SectionLabel from "@/components/ui/SectionLabel";
import Footer from "@/components/sections/Footer";
import { Section, Clause } from "@/components/legal/LegalPrimitives";

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  { id: "terms", label: "Terms of Service" },
  { id: "privacy", label: "Privacy Policy" },
  { id: "refund", label: "Refund Policy" },
  { id: "disclaimer", label: "Disclaimer" },
  // Last on purpose. The MSA applies to annual and contracted deals rather
  // than to self-serve signups, so it sits below the documents every visitor
  // needs. Readers who need it arrive by the /legal#msa anchor or the dated
  // /legal/msa/vX.Y URL their Order Form cites, not by scrolling.
  { id: "msa", label: "Master Subscription Agreement" },
];

// ─── Main page ───────────────────────────────────────────────────────────────

export default function LegalPageClient({
  /**
   * The MSA section, rendered on the server and passed in as a slot.
   *
   * The agreement is read from disk and integrity-checked at build time (see
   * src/lib/msa.ts), which this client component cannot do. Taking it as a
   * ReactNode rather than as parsed data also keeps 13KB of contract text out
   * of the client payload: it ships as HTML once instead of as HTML plus a
   * serialized copy of itself.
   */
  msaSection,
}: {
  msaSection: React.ReactNode;
}) {
  const [activeSection, setActiveSection] = useState("terms");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const sectionEls = NAV_SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );

    sectionEls.forEach((el) => el && observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-forge-body text-forge-white">
      <Navbar />

      {/* ── Top nav bar ─────────────────────────────────────────────────── */}
      <header className="fixed top-16 left-0 right-0 z-40 bg-forge-iron/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-forge-smoke hover:text-forge-white transition-colors"
              aria-label="Back to Forge home"
            >
              <Hexagon size={18} strokeWidth={2} className="text-forge-cyan" aria-hidden="true" />
              <span className="font-bold text-forge-white tracking-tight">FORGE</span>
            </Link>
            <span className="text-forge-graphite select-none">/</span>
            <span className="text-forge-smoke text-sm font-medium">Legal</span>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-forge-smoke hover:text-forge-white transition-colors"
            onClick={() => setMobileSidebarOpen((o) => !o)}
            aria-label="Toggle section navigation"
          >
            {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* ── Mobile section nav overlay ──────────────────────────────────── */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden pt-16">
          <div
            className="absolute inset-0 bg-forge-iron/95 backdrop-blur-md"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <nav className="relative px-6 py-6 flex flex-col gap-1">
            {NAV_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollTo(section.id)}
                className={`text-left px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  activeSection === section.id
                    ? "bg-forge-cyan/10 text-forge-cyan"
                    : "text-forge-smoke hover:text-forge-white hover:bg-white/5"
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 pt-40 pb-24 flex gap-16">
        {/* ── Sticky sidebar ──────────────────────────────────────────────── */}
        <aside className="hidden md:block w-52 flex-shrink-0">
          <div className="sticky top-40">
            <p className="text-xs font-medium text-forge-smoke uppercase tracking-widest mb-4 px-4">
              Sections
            </p>
            <nav className="flex flex-col gap-0.5" aria-label="Legal page sections">
              {NAV_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollTo(section.id)}
                  className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    activeSection === section.id
                      ? "bg-forge-cyan/10 text-forge-cyan border-l-2 border-forge-cyan"
                      : "text-forge-smoke hover:text-forge-white hover:bg-white/5 border-l-2 border-transparent"
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* ── Main content ────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0">
          {/* Page header */}
          <div className="mb-16 pb-16 border-b border-white/5">
            <SectionLabel>Forge</SectionLabel>
            <h1 className="text-5xl font-bold text-forge-white mt-5 mb-4 tracking-tight leading-tight">
              Legal
            </h1>
            <p className="text-forge-smoke text-lg leading-relaxed max-w-2xl">
              Terms of Service, Privacy Policy, Refund Policy, Disclaimer, and
              Master Subscription Agreement for Forge Solutions, Corp. Please read
              these documents carefully before using our platform.
            </p>
          </div>

          {/* ── 1. Terms of Service ──────────────────────────────────────── */}
          <Section id="terms" tag="Legal" title="Terms of Service">
            <p className="text-forge-smoke text-sm leading-relaxed">
              Welcome to Forge Solutions, Corp (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). By accessing or using our platform, you agree to these Terms of Service.
            </p>

            <Clause number="1" title="Description of Service">
              <p>
                Forge Solutions, Corp provides an AI-powered tool that generates construction
                estimates based on user-provided inputs (&ldquo;Service&rdquo;). The Service is intended
                for informational and productivity purposes only.
              </p>
            </Clause>

            <Clause number="2" title="No Professional Advice">
              <p>
                The estimates and outputs generated by the Service are not guaranteed to be
                accurate and do not constitute professional, engineering, or financial advice.
                Users are solely responsible for reviewing, validating, and approving all
                outputs before relying on them.
              </p>
            </Clause>

            <Clause number="3" title="User Responsibility">
              <p>You agree:</p>
              <ul className="list-disc list-inside ml-2 flex flex-col gap-1">
                <li>To provide accurate input data</li>
                <li>To independently verify all estimates</li>
                <li>Not to rely solely on the Service for financial or construction decisions</li>
              </ul>
            </Clause>

            <Clause number="4" title="Payments and Billing">
              <p>If you purchase a subscription or paid features:</p>
              <ul className="list-disc list-inside ml-2 flex flex-col gap-1">
                <li>Fees are billed as described at checkout</li>
                <li>All payments are processed securely via Stripe. We do not store your credit card number, CVV, or full card details on our servers</li>
                <li>You agree to provide accurate billing information</li>
              </ul>
            </Clause>

            <Clause number="5" title="Subscriptions and Auto-Renewal">
              <p>
                Paid subscriptions automatically renew at the end of each billing cycle
                (monthly or annual) unless you cancel before the renewal date. You may
                cancel your subscription at any time through your account settings or by
                contacting us. Cancellation takes effect at the end of the current billing
                period. You will retain access until then.
              </p>
            </Clause>

            <Clause number="6" title="Free Trials">
              {/* Trial clarifier - updated for production pricing (supersedes the
                  July 2, 2026 free-beta clarification). Keep consistent with the
                  dashboard's trial notice. */}
              <div className="border border-forge-cyan/40 bg-forge-cyan/5 p-4 flex flex-col gap-2">
                <p className="text-forge-white font-semibold text-sm uppercase tracking-[0.1em]">
                  Trial Terms: Updated July 9, 2026
                </p>
                <p>
                  This section was updated on July 9, 2026 as Forge moved from its
                  free beta to production pricing. It replaces the July 2, 2026
                  &ldquo;free beta&rdquo; clarification.
                </p>
                <p>
                  Every Forge plan starts with a{" "}
                  <strong className="text-forge-white">14-day free trial</strong>. No
                  payment method is required to start the trial.{" "}
                  <strong className="text-forge-white">
                    Nothing converts to a paid subscription automatically.
                  </strong>{" "}
                  We cannot charge a card we never collected. We will remind you
                  before the trial ends. If you do not add a payment method by the
                  end of the trial, your account is{" "}
                  <strong className="text-forge-white">paused, not deleted</strong>:
                  your data stays intact and access resumes once a payment method is
                  added. Paid subscriptions (base plan $249/month including 3 seats,
                  as described on our Pricing page) begin only when you expressly add
                  a payment method, and then renew per Section 5.
                </p>
              </div>
              <p>
                We may offer free trials at our discretion. A free trial never converts
                to a paid subscription on its own. Billing begins only after you add a
                payment method. If a trial ends without one, the account is paused and
                no data is deleted.
              </p>
            </Clause>

            <Clause number="7" title="Price Changes">
              <p>
                We reserve the right to change subscription pricing. We will notify you at
                least 30 days before any price increase takes effect. Continued use of the
                Service after a price change constitutes acceptance of the new pricing.
              </p>
              <p className="text-forge-graphite text-xs">
                Updated July 9, 2026: removed a reference to beta-era founding-rate
                enrollment, which no longer exists.
              </p>
            </Clause>

            <Clause number="8" title="Failed Payments">
              <p>
                If a payment fails, we will attempt to process the charge again and notify
                you via email. If payment remains unsuccessful after reasonable attempts, we
                may suspend or downgrade your account until the balance is resolved.
              </p>
            </Clause>

            <Clause number="9" title="Refund Policy">
              <p>
                All payments are final unless otherwise stated. We do not pro-rate unused
                portions of a billing cycle upon cancellation. We may offer refunds at our
                sole discretion.
              </p>
            </Clause>

            <Clause number="10" title="Acceptable Use">
              <p>You agree not to:</p>
              <ul className="list-disc list-inside ml-2 flex flex-col gap-1">
                <li>Use the Service for unlawful purposes</li>
                <li>Reverse engineer or exploit the platform</li>
                <li>Input malicious or harmful data</li>
              </ul>
            </Clause>

            <Clause number="11" title="Intellectual Property">
              <p>
                All rights, title, and interest in the Service, including its software, design,
                and AI models, are owned by Forge Solutions, Corp. You retain ownership of
                the data you input into the Service. By using the Service, you grant us a
                limited license to process your inputs solely for the purpose of generating
                outputs and improving the Service. AI-generated outputs are provided for your
                use but carry no guarantee of originality or accuracy.
              </p>
            </Clause>

            <Clause number="12" title="Indemnification">
              <p>
                You agree to indemnify and hold harmless Forge Solutions, Corp, its officers,
                directors, employees, and agents from any claims, damages, losses, or expenses
                (including reasonable attorney&rsquo;s fees) arising from your use of the Service,
                your violation of these Terms, or your reliance on any outputs generated by
                the Service.
              </p>
            </Clause>

            <Clause number="13" title="Limitation of Liability">
              <p>
                To the fullest extent permitted by law, Forge Solutions, Corp shall not be
                liable for any indirect, incidental, or consequential damages arising from
                use of the Service, including inaccuracies in estimates. Our total liability
                for any claim arising from these Terms shall not exceed the amount you paid
                us in the twelve (12) months preceding the claim.
              </p>
            </Clause>

            <Clause number="14" title="Disclaimer of Warranties">
              <p>
                The Service is provided &ldquo;as is&rdquo; without warranties of any kind. We do not
                guarantee accuracy, reliability, or availability.
              </p>
            </Clause>

            <Clause number="15" title="Termination">
              <p>
                We may suspend or terminate access at any time for violations of these Terms.
                Upon termination, your right to use the Service ceases immediately. Any
                provisions that by their nature should survive termination (including
                limitation of liability, indemnification, and intellectual property) will
                remain in effect.
              </p>
            </Clause>

            <Clause number="16" title="Governing Law">
              <p>
                These Terms are governed by and construed in accordance with the laws of the
                State of Delaware, without regard to conflict of law principles. Any disputes
                arising under these Terms shall be resolved exclusively in the state or federal
                courts located in Delaware.
              </p>
            </Clause>

            <Clause number="17" title="Changes to Terms">
              <p>
                We may update these Terms at any time. For material changes, we will notify
                you via email or through the platform at least 14 days in advance. Continued
                use of the Service after changes take effect constitutes acceptance of the
                updated Terms.
              </p>
            </Clause>

            <Clause number="18" title="Contact">
              <p>Forge Solutions, Corp</p>
              <p>
                Email:{" "}
                <a
                  href="mailto:team@forge.equipment"
                  className="text-forge-cyan hover:text-forge-cyan-light transition-colors"
                >
                  team@forge.equipment
                </a>
              </p>
            </Clause>
          </Section>

          {/* ── 2. Privacy Policy ────────────────────────────────────────── */}
          <Section id="privacy" tag="Legal" title="Privacy Policy" effectiveDate="June 16, 2026">
            <p className="text-forge-smoke text-sm leading-relaxed">
              Forge Solutions, Corp (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) respects your privacy.
            </p>

            <Clause number="1" title="Information We Collect">
              <p>
                We collect the following directly from you through your use of the app, for
                example when you record a job-walk, capture or upload photos and plan sets, or
                enter project details:
              </p>
              <ul className="list-disc list-inside ml-2 flex flex-col gap-1">
                <li>Contact information (name, email)</li>
                <li>User inputs (project details, measurements, descriptions, audio recordings, and photos)</li>
                <li>Usage data (interactions with the platform)</li>
                <li>Device and log data</li>
                <li>Billing information (processed and stored by Stripe; we do not store your full card details)</li>
              </ul>
            </Clause>

            <Clause number="2" title="How We Use Information">
              <p>We use data to:</p>
              <ul className="list-disc list-inside ml-2 flex flex-col gap-1">
                <li>Provide and improve the Service</li>
                <li>Generate estimates and structured scope outputs</li>
                <li>Process payments via Stripe</li>
                <li>Communicate with users</li>
                <li>Monitor performance and security</li>
              </ul>
            </Clause>

            <Clause number="3" title="Data Sharing">
              <p>
                We do not sell your personal data. To operate the Service we share data with the
                third parties below, each bound by a data-processing agreement and permitted to use
                your data only to provide their service to us:
              </p>
              <ul className="list-disc list-inside ml-2 flex flex-col gap-1">
                <li>
                  <strong className="text-forge-white">Anthropic (Claude)</strong> receives your
                  job-walk transcript and related project details (which may include client and
                  site names, addresses, and pricing), job-site photos, and uploaded plan sets, to
                  generate scope and estimate documents.
                </li>
                <li>
                  <strong className="text-forge-white">OpenAI (Whisper)</strong> receives your
                  job-walk audio recordings to transcribe them to text.
                </li>
                <li>
                  <strong className="text-forge-white">Tavily</strong> receives a building-code
                  search query (task description and project city, state, and ZIP) to retrieve code
                  references.
                </li>
                <li>
                  <strong className="text-forge-white">Stripe</strong> handles payment processing
                  (subject to Stripe&rsquo;s Privacy Policy).
                </li>
                <li>Hosting, infrastructure, and analytics providers help us run and monitor the Service.</li>
                <li>Legal authorities receive data where required by law.</li>
              </ul>
              <p>
                Each AI provider above processes your data solely to perform the requested task on
                our behalf. Under our agreements with them, your inputs are not used to train their
                AI models, and they are contractually required to protect your data to a standard
                at least equivalent to this Policy.
              </p>
            </Clause>

            <Clause number="4" title="AI Processing">
              <p>
                Forge uses third-party AI to turn your job-walk into documents. When you record,
                transcribe, or generate a scope or estimate: (1) your audio is sent to OpenAI
                (Whisper) for transcription, and (2) the resulting transcript, related project
                details, job-site photos, and any uploaded plan sets are sent to Anthropic (Claude)
                to generate your documents. We send only what is needed to produce your document.
                We ask for your consent before AI processing occurs, and you can withdraw consent
                at any time in Settings; declining still lets you use the non-AI parts of Forge.
              </p>
            </Clause>

            <Clause number="5" title="Payment Data">
              <p>
                All payment processing is handled by Stripe. When you provide payment
                information, it is transmitted directly to Stripe via their secure,
                PCI-compliant infrastructure. We receive only a tokenized reference, your
                billing email, and transaction status. We never have access to your full
                card number or CVV.
              </p>
            </Clause>

            <Clause number="6" title="Data Storage and Retention">
              <p>
                We take reasonable measures to protect your data, including encryption in
                transit and at rest. We retain your account data for as long as your account
                is active. If you delete your account, we will remove your personal data
                within 30 days, except where retention is required by law or for legitimate
                business purposes (e.g., billing records).
              </p>
            </Clause>

            <Clause number="7" title="Your Rights">
              <p>
                You may request access, correction, or deletion of your data at any time by
                contacting us. We will respond to requests within 30 days.
              </p>
              <p>
                Where we rely on your consent (including for AI processing), you may withdraw it at
                any time in the app&rsquo;s Settings or by contacting us. Withdrawing consent stops
                future AI processing but does not affect processing already completed.
              </p>
            </Clause>

            <Clause number="8" title="Cookies">
              <p>
                We may use cookies and similar technologies to improve user experience and
                analyze usage patterns.
              </p>
            </Clause>

            <Clause number="9" title="Changes to Policy">
              <p>
                We may update this Privacy Policy at any time. For material changes, we will
                notify you via email or through the platform.
              </p>
            </Clause>

            <Clause number="10" title="Contact">
              <p>Forge Solutions, Corp</p>
              <p>
                Email:{" "}
                <a
                  href="mailto:team@forge.equipment"
                  className="text-forge-cyan hover:text-forge-cyan-light transition-colors"
                >
                  team@forge.equipment
                </a>
              </p>
            </Clause>
          </Section>

          {/* ── 3. Refund Policy ─────────────────────────────────────────── */}
          <Section id="refund" tag="Legal" title="Refund Policy">
            <p className="text-forge-smoke text-sm leading-relaxed">
              All payments for Forge Solutions, Corp are final.
            </p>
            <p className="text-forge-smoke text-sm leading-relaxed">
              Due to the nature of digital services and immediate access to the platform,
              we do not offer refunds for:
            </p>
            <ul className="list-disc list-inside ml-2 text-forge-smoke text-sm flex flex-col gap-1">
              <li>Subscription fees</li>
              <li>Usage-based charges</li>
            </ul>
            <p className="text-forge-smoke text-sm leading-relaxed">
              Canceling your subscription stops future charges but does not refund the
              current billing period. We do not pro-rate unused time remaining in a
              billing cycle.
            </p>
            <p className="text-forge-smoke text-sm leading-relaxed">
              However, we may review refund requests on a case-by-case basis at our sole
              discretion.
            </p>
            <p className="text-forge-smoke text-sm leading-relaxed">
              To request consideration, contact:{" "}
              <a
                href="mailto:team@forge.equipment"
                className="text-forge-cyan hover:text-forge-cyan-light transition-colors"
              >
                team@forge.equipment
              </a>
            </p>
          </Section>

          {/* ── 4. Disclaimer ────────────────────────────────────────────── */}
          <Section id="disclaimer" tag="Legal" title="Disclaimer">
            <p className="text-forge-smoke text-sm leading-relaxed">
              AI-generated estimates are provided for informational purposes only and may
              not reflect actual project costs. Users are responsible for verifying all
              outputs before making decisions.
            </p>
          </Section>

          {/* ── 5. Master Subscription Agreement ─────────────────────────── */}
          {/* Rendered on the server from src/content/legal/msa/. Lands at
              /legal#msa, which is the anchor Order Forms and Ethan's short
              form reference. */}
          {msaSection}

          {/* Footer note */}
          <div className="pt-16 text-center">
            <p className="text-forge-smoke text-sm">
              Forge Solutions, Corp · Updated July 2026
            </p>
            <p className="text-forge-graphite text-xs mt-1">
              For questions, contact{" "}
              <a
                href="mailto:team@forge.equipment"
                className="text-forge-cyan hover:text-forge-cyan-light transition-colors"
              >
                team@forge.equipment
              </a>
            </p>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}