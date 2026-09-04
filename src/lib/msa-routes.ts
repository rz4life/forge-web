/**
 * The URL shape of the MSA archive, in one place.
 *
 * Split out of src/lib/msa.ts because that module reads the filesystem and so
 * can only run on the server, while these paths are needed in rendered links,
 * the sitemap, and the archive pages alike. Keeping the shape here means the
 * route, the links pointing at it, and the sitemap entry cannot drift apart:
 * change the pattern once and every caller follows.
 *
 * The shape is the one the ticket and the Order Forms use: /legal/msa/v1.0.
 * It is a PATTERN, not a page. A new version is a new file in
 * src/content/legal/msa/, and its URL exists without anything here changing.
 */

/** Index of every published version. */
export const MSA_ARCHIVE_PATH = "/legal/msa";

/** The anchor on the main legal page that serves the version in force. */
export const MSA_ANCHOR_PATH = "/legal#msa";

/** "1.0" -> "/legal/msa/v1.0". The permanent address of one version. */
export function msaVersionPath(version: string): string {
  return `${MSA_ARCHIVE_PATH}/v${version}`;
}

/** "v1.0" -> "1.0"; anything else -> null, so the route can 404 it. */
export function versionFromSegment(segment: string): string | null {
  const match = /^v(\d+\.\d+)$/.exec(segment);
  return match ? match[1] : null;
}
