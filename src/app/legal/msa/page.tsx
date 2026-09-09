/**
 * /legal/msa
 *
 * The version index. Clause 16.8 says Forge "will archive prior versions and
 * make them available to Customer on request"; this is that archive, standing
 * on its own so the promise does not depend on somebody answering an email.
 *
 * The list is derived from the content directory, so it is complete by
 * construction rather than by remembering to add a row.
 */

import type { Metadata } from "next";
import Link from "next/link";

import SectionLabel from "@/components/ui/SectionLabel";
import { loadAllMsaVersions } from "@/lib/msa";
import { MSA_ANCHOR_PATH, msaVersionPath } from "@/lib/msa-routes";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Master Subscription Agreement versions | Forge",
  description:
    "Every published version of the Forge Master Subscription Agreement, with its effective date and permanent link.",
};

export default function MsaArchiveIndexPage() {
  // Newest first: the version in force is the one most readers want.
  const versions = loadAllMsaVersions().reverse();
  const current = versions[0];

  return (
    <>
      <div className="mb-16 pb-16 border-b border-white/5">
        <SectionLabel>Legal</SectionLabel>
        <h1 className="text-5xl font-bold text-forge-white mt-5 mb-4 tracking-tight leading-tight">
          Master Subscription Agreement
        </h1>
        <p className="text-forge-smoke text-lg leading-relaxed">
          Every published version of the agreement, each at a permanent address.
          Order Forms incorporate the version in effect on their Effective Date, so
          older versions stay available here after the agreement is revised.
        </p>
      </div>

      <ul className="flex flex-col gap-4">
        {versions.map((doc) => (
          <li
            key={doc.version}
            className="border border-white/5 bg-white/[0.02] p-6 flex flex-col gap-2"
          >
            <div className="flex items-center gap-3">
              <span className="text-forge-cyan font-mono text-sm">v{doc.version}</span>
              {doc.version === current.version && (
                <span className="text-forge-white text-xs uppercase tracking-[0.1em] border border-forge-cyan/40 bg-forge-cyan/5 px-2 py-0.5">
                  Current
                </span>
              )}
            </div>
            <p className="text-forge-smoke text-sm">Effective Date: {doc.effectiveDate}</p>
            <Link
              href={msaVersionPath(doc.version)}
              className="text-forge-cyan hover:text-forge-cyan-light transition-colors text-sm"
            >
              Read version {doc.version}
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-forge-graphite text-xs mt-10">
        The version currently in force is also published on the{" "}
        <Link
          href={MSA_ANCHOR_PATH}
          className="text-forge-cyan hover:text-forge-cyan-light transition-colors"
        >
          Forge legal page
        </Link>
        .
      </p>
    </>
  );
}
