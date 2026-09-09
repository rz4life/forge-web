"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import { CALENDLY_URL, CASE_STUDY_PATH, trialSignupUrl } from "@/lib/constants";
import { HARRIS_SUMMARY_ROI } from "@/lib/caseStudy";
import {
  MIN_STAFF_SEATS,
  DEFAULT_STAFF_SEATS,
  INCLUDED_SEATS,
  SEAT_MONTHLY,
  SEAT_ANNUAL,
  SUB_SEAT_MONTHLY,
  SUB_SEAT_ANNUAL,
  BASE_ANNUAL,
  billableSubSeats,
  monthlyTotal,
  annualTotal,
  annualAsMonthly,
  annualSubAsMonthly,
  annualHeadlineMonthly,
  formatUsd,
  formatSeatUsd,
  type BillingPlan,
} from "@/lib/pricing";

/* F-075 ruling, 2026-09-08: both classes share the first three included seats.
 * The annual headline sums the displayed rounded monthly equivalents;
 * the exact annual charge is always shown underneath. Signup does not
 * consume these counts; actual billing uses the backend roster.
 * F-076 ruling, 2026-09-07: describe assigned-task access as the Sub benefit.
 * The product has no Sub bid-submission feature, so do not promise one. */
const PLAN_FEATURES = [
  "Unlimited job walks and recordings",
  "AI-generated scope + estimate from every walk",
  "iOS, Web, and Android access",
  "Export to Buildertrend, PDF, and CSV",
  "Team roles: Owner, Admin, PM, and Estimator",
  "Bring subs in with access scoped to their assigned tasks",
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
  const [seats, setSeats] = useState(DEFAULT_STAFF_SEATS);
  const [subSeats, setSubSeats] = useState(0);

  const extraSeats = Math.max(0, seats - INCLUDED_SEATS);
  const includedStaff = Math.min(seats, INCLUDED_SEATS);
  const extraSubSeats = billableSubSeats(seats, subSeats);
  const includedSubs = subSeats - extraSubSeats;
  const annual = annualTotal(seats, subSeats);

  // Every price on this card is quoted per month. On the annual plan that
  // means the annual figure ÷ 12; `annual` itself is still shown, as the
  // amount charged once a year.
  const baseAnnualAsMonthly = annualAsMonthly(BASE_ANNUAL);
  const seatAnnualAsMonthly = annualAsMonthly(SEAT_ANNUAL);
  // The annual headline is built from the same per-part figures printed
  // below it, so the card adds up for a reader who checks. Using
  // `annualAsMonthly(annual)` here is arithmetically closer to the real charge
  // but prints $262 above parts that sum to $261 at five seats, widening to $2
  // by twelve. See `annualHeadlineMonthly` for the full reasoning; the exact
  // annual amount is printed verbatim underneath either way.
  const headlineMonthly =
    plan === "monthly" ? monthlyTotal(seats, subSeats) : annualHeadlineMonthly(seats, subSeats);
  const seatMonthly = plan === "monthly" ? SEAT_MONTHLY : seatAnnualAsMonthly;
  const subMonthly = plan === "monthly" ? SUB_SEAT_MONTHLY : annualSubAsMonthly();

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

        <div className="bg-forge-graphite/50 backdrop-blur-sm border border-forge-cyan/30 shadow-[0_0_80px_rgba(14,165,233,0.05)] rounded-none p-5 sm:p-8 md:p-10 flex flex-col gap-6">
          <span className="bg-forge-white/5 text-forge-ash self-start px-4 py-1.5 text-sm font-bold uppercase tracking-[0.15em] font-[family-name:var(--font-mono)]">
            FORGE
          </span>

          {/* Price - always a monthly figure, on both plans */}
          <div aria-live="polite" aria-atomic="true" aria-label="Plan price">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-4xl sm:text-5xl font-medium text-forge-white tabular-nums tracking-tight">
                {formatUsd(headlineMonthly)}
              </span>
              <span className="text-forge-smoke text-lg">/month</span>
            </div>

            {plan === "annual" && (
              <p className="text-forge-ash text-[11px] uppercase tracking-[0.14em] font-[family-name:var(--font-mono)] mt-2">
                Approximate monthly rate, billed annually
              </p>
            )}

            <p className="text-forge-smoke text-sm mt-2">
              includes 3 seats, staff or Sub · +{formatUsd(seatMonthly)}/month per additional staff seat
            </p>
            <p className="text-forge-smoke text-sm mt-1">
              +{formatSeatUsd(subMonthly)}/month per additional Sub seat
            </p>

            {plan === "monthly" ? (
              <p className="text-forge-smoke text-xs mt-2">
                (Annual: {formatUsd(baseAnnualAsMonthly)}/month · +
                {formatUsd(seatAnnualAsMonthly)}/month per additional staff seat · +
                {formatSeatUsd(annualSubAsMonthly())}/month per additional Sub seat, approximately)
              </p>
            ) : (
              // Smoke, not graphite: this is the amount that actually gets
              // charged, so it stays secondary to the headline but readable.
              <p className="text-forge-ash text-sm mt-2">
                billed as {formatUsd(annual)}/yr · save 20%
              </p>
            )}
          </div>

          {/* One owner is the minimum staff roster; the base still includes three. */}
          <div className="flex items-center justify-between gap-3 border border-white/10 px-4 py-3">
            <div className="min-w-0">
              <p className="text-forge-white text-sm font-medium tabular-nums" aria-live="polite">
                {seats} staff {seats === 1 ? "seat" : "seats"}
              </p>
              <p className="text-forge-smoke text-xs mt-0.5">
                {extraSeats === 0
                  ? `${includedStaff} included`
                  : `${includedStaff} included + ${extraSeats} × ${formatUsd(seatMonthly)}/month`}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setSeats((s) => Math.max(MIN_STAFF_SEATS, s - 1))}
                disabled={seats <= MIN_STAFF_SEATS}
                aria-label="Remove a staff seat"
                className="min-h-11 min-w-11 p-2 border border-forge-graphite text-forge-ash hover:text-forge-white hover:border-forge-smoke disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:outline-2 focus-visible:outline-forge-cyan focus-visible:outline-offset-2"
              >
                <Minus size={16} strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => setSeats((s) => s + 1)}
                aria-label="Add a staff seat"
                className="min-h-11 min-w-11 p-2 border border-forge-graphite text-forge-ash hover:text-forge-white hover:border-forge-smoke transition-colors focus-visible:outline-2 focus-visible:outline-forge-cyan focus-visible:outline-offset-2"
              >
                <Plus size={16} strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border border-white/10 px-4 py-3">
            <div className="min-w-0">
              <p className="text-forge-white text-sm font-medium tabular-nums" aria-live="polite">
                {subSeats} Sub {subSeats === 1 ? "seat" : "seats"}
              </p>
              <p className="text-forge-smoke text-xs mt-0.5">
                {includedSubs} included{extraSubSeats > 0 ? ` + ${extraSubSeats} × ${formatSeatUsd(subMonthly)}/month` : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setSubSeats((s) => Math.max(0, s - 1))}
                disabled={subSeats === 0}
                aria-label="Remove a Sub seat"
                className="min-h-11 min-w-11 p-2 border border-forge-graphite text-forge-ash hover:text-forge-white hover:border-forge-smoke disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:outline-2 focus-visible:outline-forge-cyan focus-visible:outline-offset-2"
              >
                <Minus size={16} strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => setSubSeats((s) => s + 1)}
                aria-label="Add a Sub seat"
                className="min-h-11 min-w-11 p-2 border border-forge-graphite text-forge-ash hover:text-forge-white hover:border-forge-smoke transition-colors focus-visible:outline-2 focus-visible:outline-forge-cyan focus-visible:outline-offset-2"
              >
                <Plus size={16} strokeWidth={2} />
              </button>
            </div>
          </div>

          <p className="text-forge-smoke text-xs">
            Your first {INCLUDED_SEATS} seats can be staff or Sub seats. Staff use
            the included seats first, then Subs use any remaining. Additional Sub
            seats are {plan === "annual"
              ? `${formatSeatUsd(SUB_SEAT_ANNUAL)}/year`
              : `${formatSeatUsd(SUB_SEAT_MONTHLY)}/month`} each.
          </p>

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

          {/* Trial navigation; the calculator does not configure an account. */}
          <div className="flex flex-col gap-3 mt-2">
            <Button href={trialSignupUrl()} variant="primary" size="sm" className="w-full sm:px-10 sm:py-5 sm:text-xl">
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

          <p className="text-forge-smoke text-xs text-center">
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
