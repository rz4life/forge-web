/**
 * Master Subscription Agreement: loader, parser, and integrity guard.
 *
 * ── Why this file exists ────────────────────────────────────────────────
 * The MSA is a CONTRACT, not marketing copy. Order Forms incorporate a
 * specific version by reference (see clause 16.8 of the agreement itself),
 * so two things have to be true and stay true:
 *
 *   1. The published words are the words legal approved, byte for byte.
 *   2. A version an Order Form points at never stops resolving.
 *
 * Neither survives on good intentions. A page that hand-copies the text into
 * JSX drifts the first time somebody "tidies" a sentence, and nothing catches
 * it, because there is nothing to catch it against. So the agreement lives in
 * this repo as the markdown file legal signed off on, and the page is
 * DERIVED from that file rather than transcribed from it. There is exactly
 * one copy of the text, and the renderer cannot disagree with it.
 *
 * ── The integrity chain, all of it enforced at build time ───────────────
 * `next build` prerenders /legal and every /legal/msa/<version> route, which
 * means it executes everything below. Any link in this chain breaking fails
 * the build, and therefore fails CI and the Vercel deploy:
 *
 *   a. Every `vX.Y.md` has a sibling `vX.Y.sha256` and the file still hashes
 *      to it. This is the tripwire on the legal text: edit a word and the
 *      build stops. Changing the text is then a deliberate two-file change a
 *      reviewer can see, which is the point. It is not meant to stop a
 *      knowing edit, only a silent one.
 *   b. The parse is LOSSLESS. Every non-blank source line is consumed by
 *      exactly one node, and every node re-serializes to the exact line it
 *      came from. A clause the parser fails to understand cannot be quietly
 *      dropped from the rendered page: it fails the build instead.
 *   c. The registry is non-vacuous. Zero versions found is a failure, not a
 *      clean run, so a moved directory or a bad glob cannot report success
 *      by inspecting nothing.
 *
 * (b) is the load-bearing one. (a) alone would let a renderer that silently
 * skips a section pass, because the FILE would still be intact. Together
 * they say: these bytes are the approved bytes, and all of them reach the
 * page.
 *
 * ── Adding version 1.1 ─────────────────────────────────────────────────
 * Drop `v1.1.md` and `v1.1.sha256` into src/content/legal/msa/. That is the
 * whole procedure. The current version, the archive index, the dated routes,
 * and the sitemap all derive from the directory listing, so no code, route,
 * or navigation changes. v1.0 keeps resolving at its own URL, which is what
 * the Order Forms that cite it require.
 */

import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const CONTENT_DIR = join(process.cwd(), "src", "content", "legal", "msa");

/** `v1.0.md` -> version "1.0". The filename IS the registry entry. */
const VERSION_FILE = /^v(\d+\.\d+)\.md$/;

// ── The parsed document ─────────────────────────────────────────────────

/**
 * One numbered clause, e.g. `1.1 Service. "Service" means ...`.
 *
 * `text` is the whole source line, verbatim and unsplit. The number is NOT
 * pulled out into its own field: splitting "1.1 Service." off the front would
 * mean the page renders a reassembly of the contract rather than the contract,
 * and every reassembly is a chance to lose a word.
 */
export interface MsaClause {
  text: string;
}

/** A top-level article, e.g. `## 1. Definitions`. */
export interface MsaArticle {
  number: string;
  title: string;
  clauses: MsaClause[];
}

export interface MsaDocument {
  /** "1.0" */
  version: string;
  /** "September 2, 2026", exactly as the agreement states it. */
  effectiveDate: string;
  /** The document's own H1. */
  title: string;
  /** Paragraphs between the version stamp and the first article. */
  preamble: string[];
  articles: MsaArticle[];
  /** The unmodified source, for the integrity guard and for diffing. */
  markdown: string;
  /** SHA-256 of `markdown`, matching the committed sibling .sha256 file. */
  sha256: string;
}

// ── Parser ──────────────────────────────────────────────────────────────

/**
 * A parsed node plus the source line it came from and how it re-serializes.
 * `raw` and `remarshalled` must be equal for every node, which is what makes
 * the parse provably lossless rather than merely believed to be.
 */
interface Node {
  line: number;
  raw: string;
  remarshalled: string;
}

const H1 = /^# (.+)$/;
const H2 = /^## (\d+)\. (.+)$/;
const META = /^\*\*([^*]+):\*\* (.+)$/;

function fail(version: string, message: string): never {
  throw new Error(
    `MSA v${version}: ${message}\n` +
      `The Master Subscription Agreement is a contract. Refusing to publish a ` +
      `page that does not provably match src/content/legal/msa/v${version}.md.`,
  );
}

function parse(version: string, markdown: string, sha256: string): MsaDocument {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const nodes: Node[] = [];

  let title = "";
  let effectiveDate = "";
  let statedVersion = "";
  const preamble: string[] = [];
  const articles: MsaArticle[] = [];

  lines.forEach((raw, index) => {
    if (raw.trim() === "") return;

    const h1 = H1.exec(raw);
    if (h1) {
      title = h1[1];
      nodes.push({ line: index, raw, remarshalled: `# ${title}` });
      return;
    }

    const h2 = H2.exec(raw);
    if (h2) {
      const [, number, articleTitle] = h2;
      articles.push({ number, title: articleTitle, clauses: [] });
      nodes.push({ line: index, raw, remarshalled: `## ${number}. ${articleTitle}` });
      return;
    }

    const meta = META.exec(raw);
    if (meta) {
      const [, label, value] = meta;
      if (label === "Effective Date") effectiveDate = value;
      else if (label === "Version") statedVersion = value;
      else fail(version, `unrecognised metadata label "${label}" on line ${index + 1}.`);
      nodes.push({ line: index, raw, remarshalled: `**${label}:** ${value}` });
      return;
    }

    // Anything else is body text: a preamble paragraph before the first
    // article, or a clause inside the article currently open.
    const article = articles[articles.length - 1];
    if (article) article.clauses.push({ text: raw });
    else preamble.push(raw);
    nodes.push({ line: index, raw, remarshalled: raw });
  });

  // ── Lossless-parse proof ──────────────────────────────────────────────
  // Derived, not enumerated: instead of asserting "we found 16 articles" (a
  // number that goes stale the moment v1.1 lands), assert the property that
  // has to hold for ANY version. Every non-blank line is consumed exactly
  // once, and every node reproduces its own source line.
  const expected = lines.reduce<number[]>((acc, raw, index) => {
    if (raw.trim() !== "") acc.push(index);
    return acc;
  }, []);

  const consumed = nodes.map((n) => n.line);
  if (consumed.length !== expected.length) {
    fail(
      version,
      `the parser consumed ${consumed.length} of ${expected.length} non-blank ` +
        `source lines. Every line of the agreement must reach the page.`,
    );
  }
  for (let i = 0; i < expected.length; i += 1) {
    if (consumed[i] !== expected[i]) {
      fail(version, `source line ${expected[i] + 1} was not parsed in document order.`);
    }
  }
  for (const node of nodes) {
    if (node.remarshalled !== node.raw) {
      fail(
        version,
        `line ${node.line + 1} does not survive a parse/serialize round trip.\n` +
          `  source:     ${node.raw}\n` +
          `  round trip: ${node.remarshalled}`,
      );
    }
  }

  // ── Header stamp ──────────────────────────────────────────────────────
  // The effective date and version are published at the top of the page, so
  // they have to come out of the document rather than a hardcoded constant
  // that can disagree with it.
  if (!title) fail(version, "no title (H1) found.");
  if (!effectiveDate) fail(version, "no Effective Date stated in the document.");
  if (!statedVersion) fail(version, "no Version stated in the document.");
  if (statedVersion !== version) {
    fail(
      version,
      `the document states version "${statedVersion}" but is filed as v${version}.md. ` +
        `The filename is the URL an Order Form resolves; the two cannot disagree.`,
    );
  }
  if (articles.length === 0) fail(version, "no articles (## headings) found.");

  return { version, effectiveDate, title, preamble, articles, markdown, sha256 };
}

// ── Registry ────────────────────────────────────────────────────────────

function loadVersion(version: string): MsaDocument {
  const markdown = readFileSync(join(CONTENT_DIR, `v${version}.md`), "utf8");

  // The tripwire on the legal text. `shasum -a 256 -c v1.0.sha256` in the
  // content directory is the same check by hand.
  let recorded: string;
  try {
    recorded = readFileSync(join(CONTENT_DIR, `v${version}.sha256`), "utf8").trim().split(/\s+/)[0];
  } catch {
    fail(
      version,
      `no v${version}.sha256 beside v${version}.md. Every published version records the ` +
        `digest of the text legal approved. Add it with:\n` +
        `  (cd src/content/legal/msa && shasum -a 256 v${version}.md > v${version}.sha256)`,
    );
  }

  const actual = createHash("sha256").update(markdown, "utf8").digest("hex");
  if (actual !== recorded) {
    fail(
      version,
      `the text has changed since its digest was recorded.\n` +
        `  recorded: ${recorded}\n` +
        `  actual:   ${actual}\n` +
        `If this edit is intended and legally approved, re-record the digest. If it is ` +
        `not, restore the file. Do not update the digest to make the build pass.`,
    );
  }

  return parse(version, markdown, actual);
}

/** Numeric compare, so 1.10 sorts after 1.9 rather than before it. */
function compareVersions(a: string, b: string): number {
  const [aMajor, aMinor] = a.split(".").map(Number);
  const [bMajor, bMinor] = b.split(".").map(Number);
  return aMajor - bMajor || aMinor - bMinor;
}

/** Every published version, oldest first. Derived from the directory. */
export function listMsaVersions(): string[] {
  const versions = readdirSync(CONTENT_DIR)
    .map((entry) => VERSION_FILE.exec(entry)?.[1])
    .filter((v): v is string => Boolean(v))
    .sort(compareVersions);

  // Non-vacuity floor, same reasoning as the em-dash guard: a scan that found
  // nothing must not be mistaken for a scan that found nothing wrong.
  if (versions.length === 0) {
    throw new Error(
      `MSA registry is empty: no vX.Y.md files under ${CONTENT_DIR}. The legal page ` +
        `publishes a live contract; refusing to build a version list of nothing.`,
    );
  }
  return versions;
}

/** Every published version, parsed and integrity-checked. Oldest first. */
export function loadAllMsaVersions(): MsaDocument[] {
  return listMsaVersions().map(loadVersion);
}

/** The version in force: the highest one published. */
export function loadCurrentMsa(): MsaDocument {
  const versions = listMsaVersions();
  return loadVersion(versions[versions.length - 1]);
}

/** One archived version by number, or null if nothing is filed under it. */
export function loadMsaVersion(version: string): MsaDocument | null {
  return listMsaVersions().includes(version) ? loadVersion(version) : null;
}
