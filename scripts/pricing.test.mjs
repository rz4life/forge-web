import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

// Execute the real TypeScript module using the compiler already installed
// for this site. No copied pricing implementation and no new test dependency.
const source = readFileSync(
  process.env.PRICING_SOURCE_PATH ?? new URL("../src/lib/pricing.ts", import.meta.url),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const compiledModule = { exports: {} };
runInNewContext(compiled, { module: compiledModule, exports: compiledModule.exports });
const pricing = compiledModule.exports;

test("catalog and controls match the approved two-class pricing", () => {
  assert.equal(pricing.BASE_MONTHLY, 249);
  assert.equal(pricing.BASE_ANNUAL, 2390);
  assert.equal(pricing.SEAT_MONTHLY, 39);
  assert.equal(pricing.SEAT_ANNUAL, 374);
  assert.equal(pricing.SUB_SEAT_MONTHLY, 9.99);
  assert.equal(pricing.SUB_SEAT_ANNUAL, 95.90);
  assert.equal(pricing.INCLUDED_SEATS, 3);
  assert.equal(pricing.MIN_STAFF_SEATS, 1);
  assert.equal(pricing.DEFAULT_STAFF_SEATS, 3);
});

// Fixed expected quotes use the backend F-075 catalog and billable seat
// contract, verified by executing seat-pricing.ts + plan-catalog.ts at
// backend 7b9041a29848d136bc1145fc802d5150dbc51a34. In particular, 2 staff
// and 1 Sub produce base ×1, staff ×0, Sub ×1: $258.99/mo, $2,485.90/yr.
for (const [staff, subs, monthly, annual] of [
  [1, 0, 249, 2390],
  [2, 0, 249, 2390],
  [3, 0, 249, 2390],
  [4, 0, 288, 2764],
  [5, 0, 327, 3138],
  [12, 0, 600, 5756],
  [2, 1, 258.99, 2485.90],
  [3, 2, 268.98, 2581.80],
  [4, 1, 297.99, 2859.90],
  [5, 10, 426.90, 4097],
  [100, 100, 5031, 48258],
]) {
  test(`${staff} staff + ${subs} Subs uses independent allowances and exact cents`, () => {
    assert.equal(pricing.monthlyTotal(staff, subs), monthly);
    assert.equal(pricing.annualTotal(staff, subs), annual);
  });
}

test("every Sub is billed even when staff use fewer than three included seats", () => {
  assert.equal(pricing.monthlyTotal(1, 2), 268.98);
  assert.equal(pricing.monthlyTotal(3, 2), 268.98);
  assert.equal(pricing.annualTotal(1, 2), 2581.80);
  assert.equal(pricing.annualTotal(3, 2), 2581.80);
});

test("annual headline retains the established sum of displayed rounded parts", () => {
  assert.equal(pricing.annualHeadlineMonthly(3), 199);
  assert.equal(pricing.annualHeadlineMonthly(5), 261);
  assert.equal(pricing.annualHeadlineMonthly(12), 478);
  assert.equal(pricing.annualSubAsMonthly(), 7.99);
  assert.equal(pricing.annualHeadlineMonthly(2, 1), 206.99);
  assert.equal(pricing.annualHeadlineMonthly(5, 10), 340.90);
  // The visible annual charge must not be reconstructed from that headline.
  assert.equal(pricing.annualTotal(5, 10), 4097);
  assert.notEqual(pricing.annualHeadlineMonthly(5, 10) * 12, 4097);
});

test("quote formatting keeps meaningful cents and explicit Sub rate precision", () => {
  assert.equal(pricing.formatUsd(249), "$249");
  assert.equal(pricing.formatUsd(258.99), "$258.99");
  assert.equal(pricing.formatUsd(2485.90), "$2,485.90");
  assert.equal(pricing.formatUsd(2581.80), "$2,581.80");
  assert.equal(pricing.formatSeatUsd(9.99), "$9.99");
  assert.equal(pricing.formatSeatUsd(95.90), "$95.90");
  assert.equal(pricing.formatSeatUsd(7.99), "$7.99");
});
