import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

// F-515: the landing's data claims, pinned to the approved words.
//
// The sentences below are copied from the integration legal draft, section 6.3
// (FORGE_BACKEND docs/sessions/2026-09/integration-prd-2026-09-23/
// legal-amendments-draft.md). A copy edit that changes one of these lines
// fails here, so a claim about where customer data goes cannot drift without
// someone changing the approved words too. Executes the real constants module
// with the compiler this repo already has, like scripts/pricing.test.mjs.

const DRAFT_6_3 = {
  security:
    "Your data is encrypted in transit and at rest. We never sell it, and the AI providers Forge uses do not train on it. You decide whether any other app can read it.",
  band:
    "Forge has an MCP server and a public API. Use them from any MCP or agentic tool, not just Claude, or from your own software, to read your jobs, scopes, estimates and walk transcripts. Data access is on by default; an owner or admin can turn it off any time in Settings.",
};

const compile = (rel) =>
  ts.transpileModule(readFileSync(new URL(`../src/lib/${rel}`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
const compiled = compile("constants.ts");
// constants.ts imports only "@/lib/caseStudy", which imports nothing.
const LIBS = { "@/lib/caseStudy": compile("caseStudy.ts") };

function load(env = {}) {
  const run = (code) => {
    const mod = { exports: {} };
    const require = (id) => {
      if (!(id in LIBS)) throw new Error(`copy-claims test: unexpected import ${id}`);
      return run(LIBS[id]);
    };
    runInNewContext(code, { module: mod, exports: mod.exports, require, process: { env } });
    return mod.exports;
  };
  return run(compiled);
}

test("the security FAQ says the approved words", () => {
  const { SUPPORT_FAQ } = load();
  const item = SUPPORT_FAQ.find((q) => q.question === "Is my job walk data secure?");
  assert.ok(item, "the security question is still on the support page");
  assert.equal(item.answer, DRAFT_6_3.security);
});

test("How it works step 3 promises only what a connected tool cannot break", () => {
  // A connected tool reads drafts once data access is on, so the step may
  // promise nothing about Forge as a whole. What stays true is that nothing
  // reaches the client until the contractor sends it.
  const { STEPS } = load();
  const step3 = STEPS.find((s) => s.number === "03");
  assert.match(step3.description, /reach your client only when you send them\.$/);
  assert.doesNotMatch(step3.description, /leaves Forge/i);
});

test("the integrations band carries the approved version 1 line", () => {
  const { INTEGRATIONS_BAND } = load();
  assert.equal(INTEGRATIONS_BAND.body, DRAFT_6_3.band);
});

test("the band is off unless the build sets NEXT_PUBLIC_INTEGRATIONS_GA=on", () => {
  // An allowlist: unset, empty, "true", "1" or anything else stays off, so a
  // build that forgets the variable publishes nothing early.
  for (const value of [undefined, "", "true", "1", "ON", "yes"]) {
    const env = value === undefined ? {} : { NEXT_PUBLIC_INTEGRATIONS_GA: value };
    assert.equal(load(env).INTEGRATIONS_GA, false, `value ${JSON.stringify(value)}`);
  }
  assert.equal(load({ NEXT_PUBLIC_INTEGRATIONS_GA: "on" }).INTEGRATIONS_GA, true);
});

test("the manual link is the app's /docs", () => {
  assert.equal(load().docsUrl(), "https://app.forge.equipment/docs");
});

test("the band's cards and footer links point at the manual's own pages", () => {
  // The paths are the public manual's routes (Forge_Web F-514, app/docs/<slug>).
  const { INTEGRATION_CARDS, INTEGRATIONS_TRUST, docsPageUrl } = load();
  const slugs = [...INTEGRATION_CARDS.map((c) => c.link.slug), ...INTEGRATIONS_TRUST.links.map((l) => l.slug)];
  assert.deepEqual(slugs.sort(), ["api", "connect", "revoke", "what-is-shared"]);
  for (const slug of slugs) assert.equal(docsPageUrl(slug), `https://app.forge.equipment/docs/${slug}`);
});

test("the band names no AI product beyond the approved 'not just Claude'", () => {
  // The site names only tools that have been connected once (F-515 REFUSED),
  // and the manual has no recorded connection yet. Claude appears only inside
  // the approved draft line, as the example of a tool that is not required.
  const { INTEGRATION_CARDS, INTEGRATIONS_TRUST, INTEGRATIONS_BAND } = load();
  const words = JSON.stringify([INTEGRATION_CARDS, INTEGRATIONS_TRUST, { ...INTEGRATIONS_BAND, body: "" }]);
  for (const name of ["Claude", "ChatGPT", "OpenAI", "Cursor", "Codex", "Gemini", "Copilot", "Anthropic"]) {
    assert.doesNotMatch(words, new RegExp(`\\b${name}\\b`, "i"), name);
  }
});

test("the MCP card does not say the server cannot change anything (it has edit tools an owner or admin may allow)", () => {
  const { INTEGRATION_CARDS } = load();
  const mcp = INTEGRATION_CARDS.find((c) => c.kind === "mcp");
  const api = INTEGRATION_CARDS.find((c) => c.kind === "api");
  assert.doesNotMatch(mcp.points.join(" "), /read only|cannot change anything/i);
  assert.match(mcp.points.join(" "), /Reads and edits \(only with your permission\)/);
  // The public API really is GET only (forge-backend docs/public-openapi.json), so its card may say so.
  assert.match(api.points.join(" "), /Read only/);
});

// F-524 (T30): version 2 is live, so JobTread joins the Buildertrend lines.
// Text only: no logo, no giveaway or beta wording, and no claim about what
// leaves Forge that is false (sends are by an owner or admin tap; Forge never
// deletes in JobTread). Same words as Forge_Web lib/jobtreadExportCopy.ts.
const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), "utf8");

test("F-524: JobTread sits beside Buildertrend in the Export feature, the FAQ and the band", () => {
  const { FEATURES, PRICING_FAQ, INTEGRATIONS_TRUST } = load();
  const exp = FEATURES.find((f) => f.label === "EXPORT");
  assert.match(exp.description, /Buildertrend import file \(CSV\)/);
  assert.match(JSON.stringify(exp), /JobTread/);
  const faq = PRICING_FAQ.find((q) => /JobTread/.test(q.question));
  assert.ok(faq, "the pricing FAQ answers the JobTread question");
  assert.match(faq.answer, /Buildertrend/);
  assert.match(faq.answer, /owner or admin/i);
  assert.match(faq.answer, /never deletes anything in JobTread/);
  assert.match(INTEGRATIONS_TRUST.partner, /JobTread/);
  assert.match(INTEGRATIONS_TRUST.partner, /owner or admin/i);
});

test("F-524: keywords and the plan export line name JobTread; web words match", () => {
  assert.match(read("src/app/layout.tsx"), /'Buildertrend', 'JobTread'/);
  assert.match(read("src/components/pricing/PlanConfigurator.tsx"), /"Export to Buildertrend, JobTread, PDF, and CSV"/);
});

test("F-524: the JobTread copy has no giveaway or beta wording and no logo asset", () => {
  const { FEATURES, PRICING_FAQ, INTEGRATIONS_TRUST } = load();
  const words = JSON.stringify([FEATURES, PRICING_FAQ, INTEGRATIONS_TRUST]);
  assert.doesNotMatch(words, /\b(beta|giveaway|free for|early access)\b/i);
  assert.doesNotMatch(read("src/lib/constants.ts"), /jobtread[^"\n]*\.(svg|png|webp)/i);
  assert.ok(!/jobtread/i.test(JSON.stringify(readdirSync(new URL("../public", import.meta.url)))), "no JobTread logo in public/");
});

test("F-524: the T21 guard is flipped in the workflow, in all three places", () => {
  const ci = read(".github/workflows/ci.yml");
  assert.doesNotMatch(ci, /ALLOW_JOBTREAD: "false"/);
  assert.equal((ci.match(/ALLOW_JOBTREAD: "true"/g) ?? []).length, 3);
});
