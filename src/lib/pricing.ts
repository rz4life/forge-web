// Production pricing - PRD Section 8 (Ethan Rife, Michael-audited, 2026-07).
// These are the ONLY approved numbers. Client-side math here is a display
// convenience; the future Stripe Checkout flow (PRD Section 13 - blocked on
// backend work) recomputes entitlements server-side from subscription line
// items and never trusts these values.

export const INCLUDED_SEATS = 3;
export const MIN_SEATS = 3;

/** $/month, includes the first 3 seats. */
export const BASE_MONTHLY = 249;
/** $/month per seat above the included 3. */
export const SEAT_MONTHLY = 39;
/** $/year (20% off), includes the first 3 seats. Reads as $199/month. */
export const BASE_ANNUAL = 2390;
/** $/year per seat above the included 3 (20% off). Reads as $31/month. */
export const SEAT_ANNUAL = 374;

/*
 * SUB SEATS - the second seat class (F-001, RZ 2026-08-28; annual ratified
 * 2026-08-31; marketing copy corrected under F-075, RZ 2026-09-07).
 *
 * A sub seat is NOT a discounted staff seat, and the difference is not
 * only the price:
 *
 *   - every sub seat is billed, from the first one. There is no included
 *     allowance for subs, and the base price does not cover any;
 *   - a sub seat never consumes one of the INCLUDED_SEATS and never counts
 *     toward a seat limit. It is always an add-on.
 *
 * So sub seats are deliberately NOT part of `monthlyTotal` / `annualTotal`
 * above. Those two answer "what does a crew of N staff cost", which is what
 * the stepper on the pricing card asks. Folding subs into the same
 * arithmetic would put them back inside the included three, which is
 * exactly the error this correction removes.
 *
 * These mirror `SUB_SEAT_MONTHLY_USD` / `SUB_SEAT_ANNUAL_USD` in
 * forge-backend/src/billing/seat-pricing.ts, which is the SSOT for what
 * Stripe actually charges. 9.99 x 12 x 0.8 = 95.904, rounded to $95.90,
 * the same ~20% annual ratio as $249 -> $2,390 and $39 -> $374.
 */
/** $/month per sub seat. Always an add-on; no included allowance. */
export const SUB_SEAT_MONTHLY = 9.99;
/** $/year per sub seat (20% off), same ratio as the rest of the catalog. */
export const SUB_SEAT_ANNUAL = 95.9;

export type BillingPlan = "monthly" | "annual";

/** Monthly total in dollars: 249 + 39 × (seats − 3). */
export function monthlyTotal(seats: number): number {
  return BASE_MONTHLY + SEAT_MONTHLY * Math.max(0, seats - INCLUDED_SEATS);
}

/** Annual total in dollars: 2390 + 374 × (seats − 3). */
export function annualTotal(seats: number): number {
  return BASE_ANNUAL + SEAT_ANNUAL * Math.max(0, seats - INCLUDED_SEATS);
}

/**
 * An annual price expressed as the monthly rate we show on the card: the
 * annual amount divided by 12, rounded to whole dollars. $2,390/yr reads as
 * $199/month, $374/yr per seat reads as $31/month.
 *
 * Display only. Nobody is charged this number; the annual plan charges the
 * annual total once, and the card prints that total in full underneath.
 *
 * Whole dollars is deliberate. There are two ways to arrive at the discounted
 * monthly rate and they disagree in the cents: annual total ÷ 12 gives
 * $199.17 base and $31.17 per seat, while monthly rate × 0.8 gives $199.20 and
 * $31.20. Rounding to dollars makes both routes land on the same figure, and
 * it matches how the plans are quoted in copy ($199/month, not $199.17).
 */
export function annualAsMonthly(annualAmount: number): number {
  return Math.round(annualAmount / 12);
}

/**
 * The headline monthly figure for the annual plan, built from the SAME two
 * per-part numbers the card prints underneath it.
 *
 * ── Why this is not `annualAsMonthly(annualTotal(seats))` ────────────────
 *
 * Both are defensible readings of "the annual total divided by twelve", and
 * they diverge once a seat is added, because rounding the whole and rounding
 * the parts are different operations:
 *
 *   seats   annual total   total ÷ 12 (rounded)   199 + 31 × extra
 *   3       $2,390         199                    199
 *   5       $3,138         262                    261
 *   12      $5,756         480                    478
 *
 * The first column is arithmetically closer to the true annual charge. The
 * second is the one a customer can VERIFY, because the card shows them
 * "$199/month" and "+$31/month per additional seat" and they can add it up.
 * At five seats the first reading prints a headline of $262 above parts that
 * sum to $261, and there is no way for a reader to work out where the extra
 * dollar came from. Two seats later the gap is $2.
 *
 * A price a customer cannot reconcile reads as a mistake even when it is
 * closer to correct, so the card is made internally consistent and the exact
 * annual figure it will actually charge is printed in full right beneath it
 * ("billed as $3,138/yr"). The truth is on the card either way; this decides
 * which number carries it.
 *
 * Display only. Pricing logic is untouched: `annualTotal()` is still what a
 * customer is charged, and it is exact.
 */
export function annualHeadlineMonthly(seats: number): number {
  const extra = Math.max(0, seats - INCLUDED_SEATS);
  return annualAsMonthly(BASE_ANNUAL) + annualAsMonthly(SEAT_ANNUAL) * extra;
}

export function formatUsd(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

/**
 * A price that has cents, rendered with both of them, always.
 *
 * `formatUsd` is right for the whole-dollar catalog prices and wrong for
 * $9.99: `(9.99).toLocaleString("en-US")` happens to give "9.99" today,
 * but nothing in that call pins the decimals, and a price that renders as
 * "$9.9" or rounds to "$10" is a different price. The sub-seat figure is
 * the only one on this site with cents, so it gets a formatter that says
 * two decimals out loud. Mirrors `formatSeatUsd` in the web dashboard.
 */
export function formatSeatUsd(amount: number): string {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
