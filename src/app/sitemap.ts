import type { MetadataRoute } from "next";

import { listMsaVersions } from "@/lib/msa";
import { MSA_ARCHIVE_PATH, msaVersionPath } from "@/lib/msa-routes";

const BASE_URL = "https://www.forge.equipment";

export default function sitemap(): MetadataRoute.Sitemap {
  // Derived from the content directory, so publishing a new version of the
  // agreement lists it here without anyone editing this file.
  const msaArchive: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}${MSA_ARCHIVE_PATH}`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...listMsaVersions().map((version) => ({
      url: `${BASE_URL}${msaVersionPath(version)}`,
      // A published version's text never changes. That is the whole point of
      // the dated URL: an Order Form cites it and it has to stay put.
      changeFrequency: "never" as const,
      priority: 0.2,
    })),
  ];

  return [
    {
      url: `${BASE_URL}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/pricing`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/customers/harris-and-sons`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/support`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/legal`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...msaArchive,
  ];
}
