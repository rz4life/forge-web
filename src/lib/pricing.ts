// F-075, RZ ruling2026-09-08: first three seats include either staff or Sub.
// Prices mirror the backend's src/billing/seat-pricing.ts. This calculator
// displays a quote; the backend derives billable counts from the real roster.

export const INCLUDED_SEATS = 3;
export const MIN_STAFF_SEATS = 1;
export const DEFAULT_STAFF_SEATS = 3;

/** $/month, includes the first 3 seats. */
export const BASE_MONTHLY = 249;
/** $/month per seat above the included 3. */
export const SEAT_MONTHLY = 39;
/** $/year (20% off), includes the first 3 seats. Reads as $199/month. */
export const BASE_ANNUAL = 2390;
/** $/year per seat above the included 3 (20% off). Reads as $31/month. */
export const SEAT_ANNUAL = 374;

// Staff use the three included seats first; Subs use any allowance left.
// Additional seats retain their own class rate. These amounts match the
// backend catalog; the backend derives actual counts from the company roster.
/** $/month per additional Sub seat. */
export const SUB_SEAT_MONTHLY = 9.99;
/** $/year per sub seat (20% off), same ratio as the rest of the catalog. */
export const SUB_SEAT_ANNUAL = 95.9;

export type BillingPlan = "monthly" | "annual";

/** Subs beyond the shared allowance, after staff consume it first. */
export function billableSubSeats(staffSeats: number, subSeats: number): number {
  return Math.max(0, subSeats - Math.max(0, INCLUDED_SEATS - staffSeats));
}

/** Exact monthly quote; calculate in cents so Sub totals retain cents. */
export function monthlyTotal(staffSeats: number, subSeats = 0): number {
  return (
    Math.round(BASE_MONTHLY * 100) +
    Math.round(SEAT_MONTHLY * 100) * Math.max(0, staffSeats - INCLUDED_SEATS) +
    Math.round(SUB_SEAT_MONTHLY * 100) * billableSubSeats(staffSeats, subSeats)
  ) / 100;
}

/** Exact annual quote for the base and additional seats by class. */
export function annualTotal(staffSeats: number, subSeats = 0): number {
  return (
    Math.round(BASE_ANNUAL * 100) +
    Math.round(SEAT_ANNUAL * 100) * Math.max(0, staffSeats - INCLUDED_SEATS) +
    Math.round(SUB_SEAT_ANNUAL * 100) * billableSubSeats(staffSeats, subSeats)
  ) / 100;
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

/** Sub rates retain cents; $95.90/year displays as approximately $7.99/month. */
export function annualSubAsMonthly(): number {
  return Math.round((SUB_SEAT_ANNUAL * 100) / 12) / 100;
}

/**
 * The headline monthly figure for the annual plan, built from the SAME
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
 * Additional Sub seats add the displayed $7.99 monthly equivalent, retaining the
 * same sum-of-rounded-parts convention. The exact annual quote remains
 * visible underneath; the rounded headline is not an installment amount.
 */
export function annualHeadlineMonthly(staffSeats: number, subSeats = 0): number {
  const extra = Math.max(0, staffSeats - INCLUDED_SEATS);
  return (
    annualAsMonthly(BASE_ANNUAL) * 100 +
    annualAsMonthly(SEAT_ANNUAL) * 100 * extra +
    Math.round(annualSubAsMonthly() * 100) * billableSubSeats(staffSeats, subSeats)
  ) / 100;
}

export function formatUsd(amount: number): string {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * A price that has cents, rendered with both of them, always.
 *
 * Unlike whole-dollar staff rates, Sub rates always show two decimals.
 * Mirrors `formatSeatUsd` in the web dashboard.
 */
export function formatSeatUsd(amount: number): string {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
