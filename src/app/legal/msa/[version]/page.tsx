/**
 * /legal/msa/v1.0 and every version after it.
 *
 * This is the route that makes an Order Form durable. Order Forms incorporate
 * the version of the MSA in effect on their Effective Date (clause 16.8), so a
 * contract signed today points at v1.0 for its whole term. When v1.1 becomes
 * the version served at /legal#msa, this address must still return v1.0, word
 * for word, or a live contract references a document nobody can produce.
 *
 * There is deliberately no per-version page. `generateStaticParams` reads the
 * content directory, so publishing v1.1 means adding v1.1.md (and its digest)
 * and nothing else: no new route file, no navigation edit, no sitemap edit.
 * The archive is a pattern, not a growing pile of one-off pages.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import MsaDocumentView from "@/components/legal/MsaDocumentView";
import { listMsaVersions, loadMsaVersion } from "@/lib/msa";
import { msaVersionPath, versionFromSegment } from "@/lib/msa-routes";

export const dynamic = "force-static";
/** Only versions that actually exist resolve. Anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return listMsaVersions().map((version) => ({ version: `v${version}` }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ version: string }>;
}): Promise<Metadata> {
  const { version: segment } = await params;
  const version = versionFromSegment(segment);
  const doc = version ? loadMsaVersion(version) : null;
  if (!doc) return { title: "Master Subscription Agreement | Forge" };

  return {
    title: `Master Subscription Agreement v${doc.version} | Forge`,
    description: `Forge Master Subscription Agreement version ${doc.version}, effective ${doc.effectiveDate}.`,
    alternates: { canonical: msaVersionPath(doc.version) },
  };
}

export default async function MsaVersionPage({
  params,
}: {
  params: Promise<{ version: string }>;
}) {
  const { version: segment } = await params;
  const version = versionFromSegment(segment);
  const doc = version ? loadMsaVersion(version) : null;
  if (!doc) notFound();

  const isCurrent = listMsaVersions().at(-1) === doc.version;

  return (
    <>
      {!isCurrent && (
        <div className="border border-forge-cyan/40 bg-forge-cyan/5 p-4 mb-10 flex flex-col gap-2">
          <p className="text-forge-white font-semibold text-sm uppercase tracking-[0.1em]">
            Archived version
          </p>
          <p className="text-forge-smoke text-sm leading-relaxed">
            This is version {doc.version} of the Forge Master Subscription Agreement,
            effective {doc.effectiveDate}. It remains in force for Order Forms that
            incorporate it. A newer version applies to Order Forms signed after its
            effective date.
          </p>
        </div>
      )}

      <MsaDocumentView doc={doc} />
    </>
  );
}
