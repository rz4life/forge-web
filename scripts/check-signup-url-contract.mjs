#!/usr/bin/env node
/**
 * The signup URL is a contract with a separately deployed app. Pin it.
 *
 * ── Why (F-121, 2026-09-07) ─────────────────────────────────────────────
 * The pricing page's CTA carries the visitor's answers into the product:
 *
 *     ${DASHBOARD_URL}/login?mode=signup&plan=${plan}&seats=${seats}
 *
 * For four months the dashboard read `mode` and threw `plan` and `seats`
 * away, so a visitor who picked annual and five seats was asked for the
 * billing period a second time inside the app. Nobody noticed, because a
 * dropped query parameter has no symptom: nothing throws, nothing logs, the
 * page renders perfectly, and the only tell is a customer answering the
 * same question twice.
 *
 * That half is fixed in Forge_Web. This guard covers the half that lives
 * HERE: the producer can silently stop producing. A rename in
 * `trialSignupUrl`, or a CTA that quietly reverts to `trialSignupUrl()`
 * with no arguments, would break the handoff exactly as invisibly, and
 * `tsc --noEmit` and `next build` would both stay green, because both
 * versions are perfectly valid TypeScript.
 *
 * ── What it checks, and what it deliberately cannot ─────────────────────
 * 1. `trialSignupUrl` still emits the exact parameter names, in order, with
 *    the exact substitutions. Renaming `plan` to `billingPeriod` here is a
 *    cross-repo breaking change and has to look like one.
 * 2. The plan configurator still PASSES the visitor's choice. A CTA that
 *    calls `trialSignupUrl()` bare is the same bug one step earlier: the
 *    parameters would be correct and always carry the defaults.
 *
 * What it cannot do is see the other repository. Neither repo's CI checks
 * the other one out, so this pin and the app-side pin
 * (`Forge_Web/Forge/dashboard/tests/signupIntent.test.ts`) are independent.
 * A rename that updates both pins in one window is correct; a rename that
 * updates only this one still breaks the handoff silently. Closing that
 * needs a cross-repo checkout in one of the two lanes, which is a
 * follow-up, not this script. Say so rather than implying more coverage
 * than exists.
 *
 * Usage:  node scripts/check-signup-url-contract.mjs
 * Exit 0 clean, 1 on a contract break, 2 on its own failure (never a
 * silent pass).
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");

const CONSTANTS = "src/lib/constants.ts";
const CONFIGURATOR = "src/components/pricing/PlanConfigurator.tsx";

/**
 * THE CONTRACT. Both halves of the template, spelled out.
 *
 * `texts` are the literal pieces between substitutions; `exprs` are the
 * substitutions themselves, in order. Written out rather than compared to a
 * reassembled string so that a swap of two parameters, which would leave a
 * naive string comparison intact if the names also swapped, still fails.
 */
const EXPECTED = {
  texts: ["", "/login?mode=signup&plan=", "&seats=", ""],
  exprs: ["DASHBOARD_URL", "plan", "seats"],
};

function parse(relPath) {
  const full = join(ROOT, relPath);
  if (!existsSync(full)) {
    fail2(`${relPath} does not exist. The guard cannot check a file that moved.`);
  }
  return ts.createSourceFile(
    full,
    readFileSync(full, "utf8"),
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    relPath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

/** Flatten a template literal into its literal texts and substitutions. */
function readTemplate(node, sf) {
  if (ts.isNoSubstitutionTemplateLiteral(node)) {
    return { texts: [node.text], exprs: [] };
  }
  if (!ts.isTemplateExpression(node)) return null;
  const texts = [node.head.text];
  const exprs = [];
  for (const span of node.templateSpans) {
    exprs.push(span.expression.getText(sf));
    texts.push(span.literal.text);
  }
  return { texts, exprs };
}

/** The template literal that `trialSignupUrl` returns, or null. */
function returnedTemplate(sf) {
  let found = null;
  const visit = (node) => {
    if (
      ts.isFunctionDeclaration(node) &&
      node.name?.text === "trialSignupUrl" &&
      node.body
    ) {
      for (const stmt of node.body.statements) {
        if (ts.isReturnStatement(stmt) && stmt.expression) {
          found = readTemplate(stmt.expression, sf);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return found;
}

/** Every `trialSignupUrl(...)` call in a file, as argument-text arrays. */
function callSites(sf) {
  const calls = [];
  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "trialSignupUrl"
    ) {
      calls.push(node.arguments.map((a) => a.getText(sf)));
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return calls;
}

function sameShape(actual) {
  if (!actual) return false;
  return (
    JSON.stringify(actual.texts) === JSON.stringify(EXPECTED.texts) &&
    JSON.stringify(actual.exprs) === JSON.stringify(EXPECTED.exprs)
  );
}

function fail2(message) {
  console.error(`signup-url guard FAILED TO RUN: ${message}`);
  process.exit(2);
}

/**
 * Prove the detector still discriminates before trusting a clean verdict.
 *
 * A guard built on the TypeScript AST can be defeated by a renamed
 * SyntaxKind or a broken walk, and the failure mode is a confident "clean"
 * over a file it never really read. So run it over two synthetic sources
 * whose answers are known: one that must pass and one that must fail.
 */
function selfTest() {
  const good = ts.createSourceFile(
    "good.ts",
    "export function trialSignupUrl(plan, seats) {\n" +
      "  return `${DASHBOARD_URL}/login?mode=signup&plan=${plan}&seats=${seats}`;\n" +
      "}\n",
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  if (!sameShape(returnedTemplate(good))) {
    fail2("the detector rejects its own known-good example.");
  }

  const dropped = ts.createSourceFile(
    "dropped.ts",
    "export function trialSignupUrl(plan, seats) {\n" +
      "  return `${DASHBOARD_URL}/login?mode=signup&plan=${plan}`;\n" +
      "}\n",
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  if (sameShape(returnedTemplate(dropped))) {
    fail2("the detector accepts an example with `seats` dropped. It checks nothing.");
  }

  const renamed = ts.createSourceFile(
    "renamed.ts",
    "export function trialSignupUrl(plan, seats) {\n" +
      "  return `${DASHBOARD_URL}/login?mode=signup&billingPeriod=${plan}&seats=${seats}`;\n" +
      "}\n",
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  if (sameShape(returnedTemplate(renamed))) {
    fail2("the detector accepts a renamed parameter. It checks nothing.");
  }

  const bare = ts.createSourceFile(
    "bare.tsx",
    "const x = <a href={trialSignupUrl()} />;\n",
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const bareCalls = callSites(bare);
  if (bareCalls.length !== 1 || bareCalls[0].length !== 0) {
    fail2("the call-site walk does not see a bare trialSignupUrl() call.");
  }
}

function main() {
  selfTest();

  // ── 1. The emitted URL ──────────────────────────────────────────────
  const constants = parse(CONSTANTS);
  const actual = returnedTemplate(constants);
  if (!actual) {
    fail2(
      `no \`return\` with a template literal found in trialSignupUrl in ${CONSTANTS}. ` +
        `The function moved, was renamed, or stopped building the URL inline. ` +
        `Point this guard at wherever it lives now.`,
    );
  }
  if (!sameShape(actual)) {
    console.error(`\nsignup-url guard: ${CONSTANTS} no longer emits the agreed URL.\n`);
    console.error("  expected literal parts : " + JSON.stringify(EXPECTED.texts));
    console.error("  actual literal parts   : " + JSON.stringify(actual.texts));
    console.error("  expected substitutions : " + JSON.stringify(EXPECTED.exprs));
    console.error("  actual substitutions   : " + JSON.stringify(actual.exprs));
    console.error(
      "\nThe dashboard reads `mode`, `plan` and `seats` off this URL by those exact\n" +
        "names (Forge_Web: Forge/dashboard/lib/signupIntent.ts, pinned by\n" +
        "tests/signupIntent.test.ts). Changing a name here without changing it there\n" +
        "drops the visitor's choice on arrival, silently, with both repos green.\n" +
        "If the change is intended, land both sides in the same window.\n",
    );
    process.exit(1);
  }

  // ── 2. The configurator still passes the visitor's choice ───────────
  const configurator = parse(CONFIGURATOR);
  const calls = callSites(configurator);
  if (calls.length === 0) {
    fail2(
      `no trialSignupUrl call found in ${CONFIGURATOR}. Either the CTA moved or this ` +
        `guard is checking a file that no longer builds the pricing CTA.`,
    );
  }
  const withChoice = calls.filter((args) => args.length === 2);
  if (withChoice.length === 0) {
    console.error(
      `\nsignup-url guard: ${CONFIGURATOR} calls trialSignupUrl with no arguments.\n`,
    );
    console.error(
      "  calls found: " + calls.map((a) => `trialSignupUrl(${a.join(", ")})`).join(", "),
    );
    console.error(
      "\nThe seat stepper and the monthly/annual toggle on that card exist to be\n" +
        "carried into the app. A bare call sends the defaults and throws away what\n" +
        "the visitor actually chose, which is the F-121 bug one step earlier.\n",
    );
    process.exit(1);
  }

  console.log(
    "signup-url guard: clean. " +
      `${CONSTANTS} emits mode+plan+seats, and ${CONFIGURATOR} passes the ` +
      `visitor's choice (${withChoice.length} call site${withChoice.length === 1 ? "" : "s"}).`,
  );
}

try {
  main();
} catch (err) {
  console.error("signup-url guard CRASHED (not a pass):", err);
  process.exit(2);
}
