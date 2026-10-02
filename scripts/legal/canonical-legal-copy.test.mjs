// F-511 (integration T17, ruling 11): this site carries no copy of Forge's
// Privacy Policy or Terms of Service. The one copy is the app's
// (app.forge.equipment/privacy and /terms); /legal and the /terms and
// /privacy redirects link there (F-662).
//
// The defect. /legal carried its own Privacy Policy (effective 16 June) and
// Terms, which drifted from the app's: its Privacy Policy said declining AI
// consent still lets you use Forge, and its Terms printed a free-beta change
// log. F-662 replaced them with links. This keeps them links: it fails when a
// run of the published body text reappears in any file of this repo, or a
// link to the old separate domain does outside the documentation. The files
// are every file git would commit (not a folder list), so next.config.ts,
// where the /privacy and /terms redirects live, is read.
//
// The matcher and the fingerprints are byte-identical twins of Forge_Web's
// (Forge/dashboard/scripts/legal/). Forge_Web's
// tests/canonicalLegalOneCopy.test.ts pins the same two hashes, so an edit to
// one repo's copy alone turns that repo red. To change either, change both
// repos and update both pins.
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  OLD_DOMAIN_LINK,
  STRIDE,
  WINDOW,
  allFingerprints,
  createMatcher,
  fnv1a64,
  isDocumentation,
  readText,
  repoFiles,
  scan,
  spanFingerprints,
  windowHash,
  words,
} from "./canonical-legal-copy.mjs";

const MATCHER_BODY_SHA256 = "82b69ee45c146cd11e33417e040912e6c3b8f62f15c2b94f4252ea208f8e3bc9";
const FINGERPRINTS_SHA256 = "d251414f9ff345e5f800380b7ec69d9c9cbf70ce7ad15e0b1bfdec93f389087e";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (rel) => readFileSync(new URL(rel, import.meta.url), "utf8");
const sha = (text) => createHash("sha256").update(text, "utf8").digest("hex");
const fingerprints = () => JSON.parse(read("./canonical-legal-fingerprints.json"));
const OLD_HOST = ["forgesolutions", "io"].join(".");

// A synthetic body standing in for the published text, so this repo carries
// none of it. The real-text reds are shown by planting a paragraph of the
// app's page here (see the PR).
const POLICY =
  "The quarry keeps a ledger of every stone it cuts, and each ledger line names the mason, " +
  "the block, the face that was dressed and the day the cart left the yard for the river.";

test("the matcher body and the fingerprints are Forge_Web's twins (sha256)", () => {
  const lines = read("./canonical-legal-copy.mjs").split("\n");
  const marker = lines.findIndex((l) => l.startsWith("// ---- BODY"));
  assert.ok(marker >= 0, "canonical-legal-copy.mjs has no '// ---- BODY' line");
  const body = lines.slice(marker + 1).join("\n");
  assert.ok(body.length > 1000, "the matcher body is empty or truncated");
  assert.equal(sha(body), MATCHER_BODY_SHA256, "matcher body changed: reconcile with Forge_Web, update both pins");
  assert.equal(
    sha(read("./canonical-legal-fingerprints.json")),
    FINGERPRINTS_SHA256,
    "fingerprints changed: copy Forge_Web's file here, update both pins",
  );
  const json = fingerprints();
  assert.equal(json.window, WINDOW);
  assert.equal(json.stride, STRIDE);
  assert.ok(json.privacy.length >= 150 && json.terms.length >= 150, "the fingerprints are too few to mean anything");
});

test("no file in this repo carries Privacy or Terms body text or links the old domain (docs exempt from the link check)", () => {
  const files = repoFiles(ROOT);
  assert.ok(files.length >= 60, `git listed ${files.length} files; expected the site`);
  for (const anchor of ["src/app/legal/page.tsx", "next.config.ts", "package.json", "README.md"]) {
    assert.ok(files.includes(anchor), `the scan reads ${anchor}`);
  }
  const findings = scan(ROOT, files, allFingerprints(fingerprints()));
  assert.deepEqual(
    findings,
    [],
    "The Privacy Policy and Terms are published once, by the app (app.forge.equipment/privacy and /terms). " +
      "Link there (termsUrl(), privacyUrl() in src/lib/constants.ts; the redirects in next.config.ts); do not copy them.",
  );
});

test("words and hashes equal Forge_Web's and Forge_IOS's ports (pinned vectors)", () => {
  assert.equal(fnv1a64(""), "cbf29ce484222325");
  assert.equal(fnv1a64("a"), "af63dc4c8601ec8c");
  assert.equal(fnv1a64("foobar"), "85944171f73967e8");
  assert.equal(
    words("Forge&apos;s policy:\\nWe don’t sell data. Line\\tTab \\u{2022} bullet &#39;x&#x27; ok").join(" "),
    "forge s policy we don t sell data line tab bullet x ok",
  );
  assert.equal(windowHash(words("one two three four five six seven eight nine ten eleven twelve"), 0), "1943c916d709c840");
  // A numeric entity that names no Unicode scalar stays literal text; it never throws.
  assert.equal(
    words("a &#x110000; b &#1114112; c &#xD800; d &#x0;e &#99999999999; f").join(" "),
    "a x110000 b 1114112 c xd800 d e 99999999999 f",
  );
});

test("a file is read whatever its encoding (pinned byte vectors)", () => {
  const dir = mkdtempSync(join(tmpdir(), "f511-enc-"));
  try {
    const vectors = [
      ["utf-16le with a mark", Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from("Privacy’s policy\n", "utf16le")])],
      ["utf-16be with a mark", Buffer.concat([Buffer.from([0xfe, 0xff]), Buffer.from("Privacy’s policy\n", "utf16le").swap16()])],
      ["utf-16le, no mark", Buffer.from("Privacy’s policy\n", "utf16le")],
      ["utf-8 with a mark", Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from("Privacy’s policy\n", "utf8")])],
      ["latin-1", Buffer.from([0x50, 0x72, 0x69, 0x76, 0x61, 0x63, 0x79, 0x92, 0x73, 0x20, 0x70, 0x6f, 0x6c, 0x69, 0x63, 0x79, 0x0a])],
    ];
    for (const [name, bytes] of vectors) {
      const file = join(dir, name.replace(/\W+/g, "-"));
      writeFileSync(file, bytes);
      assert.equal(words(readText(file)).join(" "), "privacy s policy", name);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a planted run or old link is found wherever git sees it; docs, README, the package id and ignored files are admitted", () => {
  const root = mkdtempSync(join(tmpdir(), "f511-repo-"));
  try {
    const run = words(POLICY).slice(6, 6 + WINDOW + STRIDE - 1).join(" ");
    const link = `https://${OLD_HOST}/privacy`;
    const files = {
      // lens B L-J1: the /privacy redirect pointed at the old domain
      "next.config.ts": `export default { redirects: async () => [{ source: "/privacy", destination: "${link}", permanent: false }] };\n`,
      "src/Planted.tsx": `<p>\n  ${run}\n</p>\n`,
      "scripts/planted.mjs": `export const P = "${run}";\n`,
      "public/judge-legal.txt": Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(`${run}\n`, "utf16le")]),
      "public/README.md": `See ${link}\n`,
      "Workbook.md": `See ${link}\n`,
      "docs/quoted.md": `${run}\n`,
      // admitted
      "docs/history.md": `Android once linked ${link}.\n`,
      "README.md": `History: Android once linked ${link}.\n`,
      "src/Other.tsx": "<p>Read the Terms of Service and the Privacy Policy in the app.</p>\n",
      "src/Store.tsx": 'const id = "com.forgesolutions.forge";\n',
      ".gitignore": "ignored/\n",
      "ignored/planted.tsx": `<p>${run}</p>\n`,
      // F-835 (Forge_Web lens B L2): symlink targets in docs/
      "docs/linked-links.md": `Read ${link}\n`,
      "docs/legal/old.md": `Old: ${link}\n`,
    };
    for (const [rel, content] of Object.entries(files)) {
      mkdirSync(dirname(join(root, rel)), { recursive: true });
      writeFileSync(join(root, rel), content);
    }
    // A link is read as what it points at, under the link's path; a dangling one ships nothing.
    symlinkSync("../docs/linked-links.md", join(root, "public/linked.md"));
    symlinkSync("../docs/legal", join(root, "public/legal-docs"));
    symlinkSync("../build/nothing.md", join(root, "public/dangling.md"));
    execFileSync("git", ["init", "-q", root]);
    const found = scan(root, repoFiles(root), spanFingerprints(POLICY)).map(
      (f) => `${f.file}${f.copyAt.length ? " copy" : ""}${f.oldDomain.length ? " link" : ""}`,
    );
    assert.deepEqual(found, [
      "Workbook.md link",
      "docs/quoted.md copy",
      "next.config.ts link",
      "public/README.md link",
      "public/judge-legal.txt copy",
      "public/legal-docs/old.md link",
      "public/linked.md link",
      "scripts/planted.mjs copy",
      "src/Planted.tsx copy",
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
  assert.equal(createMatcher(spanFingerprints(POLICY)).find("Forge links the one published policy.").length, 0);
  assert.equal(OLD_DOMAIN_LINK.test("https://app.forge.equipment/privacy"), false);
  assert.equal(isDocumentation("docs/reviews/x.md"), true);
  assert.equal(isDocumentation("next.config.ts"), false);
  assert.throws(() => repoFiles(join(tmpdir(), "f511-no-such-checkout")), /cannot list the files/);
});

test("a submodule or a nested repository is refused loudly, never skipped (F-835)", () => {
  const root = mkdtempSync(join(tmpdir(), "f835-nested-"));
  const git = (cwd, ...args) =>
    execFileSync("git", ["-C", cwd, "-c", "user.name=f835", "-c", "user.email=f835@example.test", ...args], { stdio: "pipe" });
  try {
    mkdirSync(join(root, "public/vendor-legal"), { recursive: true });
    writeFileSync(join(root, "public/page.html"), "<p>ok</p>\n");
    git(root, "init", "-q");
    assert.deepEqual(repoFiles(root), ["public/page.html"]);
    const vendor = join(root, "public/vendor-legal");
    writeFileSync(join(vendor, "privacy.html"), "<p>planted</p>\n");
    git(vendor, "init", "-q");
    git(vendor, "add", "privacy.html");
    git(vendor, "commit", "-q", "-m", "plant");
    assert.throws(() => repoFiles(root), /another repository inside .*: public\/vendor-legal\./);
    git(root, "update-index", "--add", "--cacheinfo", `160000,${git(vendor, "rev-parse", "HEAD").toString().trim()},public/vendor-legal`);
    assert.throws(() => repoFiles(root), /another repository inside .*: public\/vendor-legal\./);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
