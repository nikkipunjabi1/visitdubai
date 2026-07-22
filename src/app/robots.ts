import type { MetadataRoute } from 'next';
import { config, getClient } from '@optimizely/cms-sdk';

/*
  Demo-safe robots.txt — blocks ALL crawlers BY DEFAULT so the Vercel demo is
  not indexed. The global switch is CMS-controlled (SiteSettings.allowSearchIndexing),
  with an env fallback, and fails closed:

    CMS SiteSettings.allowSearchIndexing === true → allow
    env  SITE_INDEXABLE === 'true'               → allow
    anything else / any error                    → block all (safe default)

  See docs/SEO.md. Per-page noindex/nofollow is handled in page metadata (S2.7).
*/
export const dynamic = 'force-dynamic';

config({
  apiKey: process.env.OPTIMIZELY_GRAPH_SINGLE_KEY ?? '',
  graphUrl: process.env.OPTIMIZELY_GRAPH_GATEWAY,
});

async function indexingAllowed(): Promise<boolean> {
  if (process.env.SITE_INDEXABLE === 'true') return true;
  try {
    const client = getClient();
    const data = (await client.request(
      `query { SiteSettings(limit: 1) { items { allowSearchIndexing } } }`,
      {},
    )) as { SiteSettings?: { items?: Array<{ allowSearchIndexing?: boolean }> } };
    return Boolean(data?.SiteSettings?.items?.[0]?.allowSearchIndexing);
  } catch {
    return false; // fail closed — never accidentally allow crawling
  }
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  if (!(await indexingAllowed())) {
    // Block everything.
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  const host = process.env.APPLICATION_HOST?.replace(/\/$/, '');
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: host ? `${host}/sitemap.xml` : undefined,
  };
}
