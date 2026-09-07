"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import { CALENDLY_URL, CASE_STUDY_PATH, trialSignupUrl } from "@/lib/constants";
import { HARRIS_SUMMARY_ROI } from "@/lib/caseStudy";
import {
  MIN_SEATS,
  INCLUDED_SEATS,
  SEAT_MONTHLY,
  SEAT_ANNUAL,
  BASE_ANNUAL,
  monthlyTotal,
  annualTotal,
  annualAsMonthly,
  annualHeadlineMonthly,
  formatUsd,
  type BillingPlan,
} from "@/lib/pricing";

/* Plan card + monthly/annual toggle + seat stepper - PRD 9.10 / Section 8.
 * Price math is client-side display only (249 + 39×(seats−3) monthly;
 * 2390 + 374×(seats−3) annual). The CTA carries plan+seats to the dashboard
 * signup; live Stripe Checkout (PRD Section 13) is a later backend project.
 *
 * The headline is always a monthly figure, on both plans (Ethan Rife,
 * 2026-08-13, matching how Apollo and CompanyCam quote annual plans). Seats
 * follow the same rule, and the annual total that actually gets charged is
 * printed in the small line underneath. The prices themselves did not change.
 *
 * The annual headline is the sum of the two per-part monthly figures the card
 * prints, not the annual total divided by twelve. Those two readings diverge
 * once a seat is added (at five seats: $261 vs $262, reaching $2 apart at
 * twelve), and the version a customer can add up wins over the version that is
 * a few cents closer. `annualHeadlineMonthly` in lib/pricing.ts carries the
 * full reasoning and the table. */

/* The roles bullets, and why there are two of them (F-076, RZ 2026-09-07).
 *
 * This list used to sell "Full team roles: Owner, Admin, PM, Estimator,
 * Sub" in one line. The Master Subscription Agreement (section 1.6, in
 * src/content/msa/v1.0.md) defines a Sub Seat as the opposite of a full
 * team role: "access limited to the tasks assigned to it and its own
 * submitted pricing, without visibility into the job's full scope,
 * estimates, or other users' pricing." A sub is defined by what it cannot
 * see. Selling it as an equal seat promised access the product refuses,
 * and the agreement is the half that is right.
 *
 * The fix is NOT to quietly drop "Sub" from the list. Scoped subcontractor
 * access is a selling point to a general contractor, who does not want the
 * framer reading the homeowner's budget conversation or another trade's
 * bid. A silent deletion would also read as a feature removal to anyone
 * diffing the old copy against the new. So the restriction moves to its
 * own bullet and is stated as the benefit it is.
 *
 * Staff roles are named by the four that genuinely see the whole job. */
const PLAN_FEATURES = [
  "Unlimited job walks and recordings",
  "AI-generated scope + estimate from every walk",
  "iOS, Web, and Android access",
  "Export to Buildertrend, PDF, and CSV",
  "Team roles: Owner, Admin, PM, and Estimator",
  "Bring subs in with access scoped to their own tasks and pricing",
  "Email support",
];

const BILLING_OPTIONS = [
  { id: "monthly", label: "Monthly" },
  { id: "annual", label: "Annual" },
] as const;

export default function PlanConfigurator() {
  // Annual is the default on the MARKETING pricing page (PRD Part 3). The
  // in-app trial-to-paid upgrade flow in Forge_Web keeps monthly as its
  // default and is deliberately untouched.
  const [plan, setPlan] = useState<BillingPlan>("annual");
  const [seats, setSeats] = useState(MIN_SEATS);

  const extraSeats = seats - INCLUDED_SEATS;
  const annual = annualTotal(seats);

  // Every price on this card is quoted per month. On the annual plan that
  // means the annual figure ÷ 12; `annual` itself is still shown, as the
  // amount charged once a year.
  const baseAnnualAsMonthly = annualAsMonthly(BASE_ANNUAL);
  const seatAnnualAsMonthly = annualAsMonthly(SEAT_ANNUAL);
  // The annual headline is built from the same two per-part figures printed
  // below it, so the card adds up for a reader who checks. Using
  // `annualAsMonthly(annual)` here is arithmetically closer to the real charge
  // but prints $262 above parts that sum to $261 at five seats, widening to $2
  // by twelve. See `annualHeadlineMonthly` for the full reasoning; the exact
  // annual amount is printed verbatim underneath either way.
  const headlineMonthly =
    plan === "monthly" ? monthlyTotal(seats) : annualHeadlineMonthly(seats);
  const seatMonthly = plan === "monthly" ? SEAT_MONTHLY : seatAnnualAsMonthly;

  return (
    <div className="max-w-lg mx-auto">
      {/* Monthly / Annual segmented control. Square, hard-edged, filled active
          state to match Button's primary variant. The savings badge is attached
          to the annual segment itself, not floated beside the control. */}
      <div className="flex justify-center">
        <div
          className="inline-flex divide-x divide-forge-graphite/60 border border-forge-graphite/60 rounded-none"
          role="group"
          aria-label="Billing period"
        >
          {BILLING_OPTIONS.map(({ id, label }) => {
            const active = plan === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setPlan(id)}
                aria-pressed={active}
                className={`flex items-center gap-2.5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.1em] font-[family-name:var(--font-mono)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-forge-cyan ${
                  active
                    ? "bg-forge-white text-forge-iron"
                    : "text-forge-smoke hover:text-forge-white hover:bg-forge-white/5"
                }`}
              >
                {label}
                {id === "annual" && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] leading-none font-bold tracking-[0.08em] rounded-none ${
                      active
                        ? "bg-forge-iron text-forge-white"
                        : "bg-forge-cyan/15 text-forge-cyan border border-forge-cyan/40"
                    }`}
                  >
                    SAVE 20%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Plan card */}
      <div className="relative mt-12">
        {/* Outer corner brackets */}
        <div className="absolute -inset-4 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-forge-graphite/50" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-forge-graphite/50" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-forge-graphite/50" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-forge-graphite/50" />
        </div>

        <div className="bg-forge-graphite/50 backdrop-blur-sm border border-forge-cyan/30 shadow-[0_0_80px_rgba(14,165,233,0.05)] rounded-none p-8 md:p-10 flex flex-col gap-6">
          <span className="bg-forge-white/5 text-forge-ash self-start px-4 py-1.5 text-sm font-bold uppercase tracking-[0.15em] font-[family-name:var(--font-mono)]">
            FORGE
          </span>

          {/* Price - always a monthly figure, on both plans */}
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-medium text-forge-white tabular-nums tracking-tight">
                {formatUsd(headlineMonthly)}
              </span>
              <span className="text-forge-smoke text-lg">/month</span>
            </div>

            {plan === "annual" && (
              <p className="text-forge-ash text-[11px] uppercase tracking-[0.14em] font-[family-name:var(--font-mono)] mt-2">
                USD, billed annually
              </p>
            )}

            <p className="text-forge-smoke text-sm mt-2">
              includes 3 seats · +{formatUsd(seatMonthly)}/month per additional seat
            </p>

            {plan === "monthly" ? (
              <p className="text-forge-graphite text-xs mt-1">
                (Annual: {formatUsd(baseAnnualAsMonthly)}/month · +
                {formatUsd(seatAnnualAsMonthly)}/month per additional seat · save 20%)
              </p>
            ) : (
              // Smoke, not graphite: this is the amount that actually gets
              // charged, so it stays secondary to the headline but readable.
              <p className="text-forge-smoke text-xs mt-1">
                billed as {formatUsd(annual)}/yr · save 20%
              </p>
            )}
          </div>

          {/* Seat stepper - starts at 3, min 3 */}
          <div className="flex items-center justify-between border border-white/10 px-4 py-3">
            <div>
              <p className="text-forge-white text-sm font-medium tabular-nums">
                {seats} seats
              </p>
              <p className="text-forge-graphite text-xs mt-0.5">
                {extraSeats === 0
                  ? "your first 3 seats are included"
                  : `3 included + ${extraSeats} × ${formatUsd(seatMonthly)}/month`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSeats((s) => Math.max(MIN_SEATS, s - 1))}
                disabled={seats <= MIN_SEATS}
                aria-label="Remove a seat"
                className="p-2 border border-forge-graphite text-forge-ash hover:text-forge-white hover:border-forge-smoke disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Minus size={16} strokeWidth={2} />
              </button>
              <button
                onClick={() => setSeats((s) => s + 1)}
                aria-label="Add a seat"
                className="p-2 border border-forge-graphite text-forge-ash hover:text-forge-white hover:border-forge-smoke transition-colors"
              >
                <Plus size={16} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Feature list */}
          <div>
            <p className="text-forge-white text-sm font-medium">
              Everything you need to scope and estimate from the field:
            </p>
            <ul className="flex flex-col gap-2.5 mt-4">
              {PLAN_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-left">
                  <span className="text-forge-cyan font-mono text-sm shrink-0 mt-0.5" aria-hidden="true">
                    ＋
                  </span>
                  <span className="text-forge-ash text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTAs - plan + seats ride along to the dashboard signup */}
          <div className="flex flex-col gap-3 mt-2">
            <Button href={trialSignupUrl(plan, seats)} variant="primary" size="lg" className="w-full">
              Start Free Trial
            </Button>
            <p className="text-forge-smoke text-sm text-center">
              Prefer a walkthrough first?{" "}
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-forge-white hover:text-forge-cyan transition-colors underline underline-offset-4 decoration-forge-graphite"
              >
                Talk to Sales
              </a>
            </p>
          </div>

          <p className="text-forge-graphite text-xs text-center">
            14-day free trial on both plans. No credit card required to start.
          </p>
        </div>
      </div>

      {/* ROI line - PRD 9.10 / 10.6 */}
      <p className="text-forge-smoke text-sm text-center leading-relaxed mt-10 max-w-md mx-auto">
        {HARRIS_SUMMARY_ROI}{" "}
        <a
          href={CASE_STUDY_PATH}
          className="text-forge-white hover:text-forge-cyan transition-colors underline underline-offset-4 decoration-forge-graphite whitespace-nowrap"
        >
          See the full story →
        </a>
      </p>
    </div>
  );
}
