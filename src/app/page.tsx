import { cache } from 'react';
import type { Metadata } from 'next';
import { getClient } from '@optimizely/cms-sdk';
import { OptimizelyComponent } from '@optimizely/cms-sdk/react/server';
import { getSiteSettings, buildContentMetadata, type PageSeo } from '@/lib/seo';

// Fetch the published Home experience once per request; `generateMetadata` and the
// page component both need it, and `cache()` dedupes the Graph call.
const getHome = cache(async () => {
  try {
    return await getClient().getContentByPath('/');
  } catch {
    return [];
  }
});

// The root page shares the root layout's route segment, so Next's title template
// doesn't wrap it — build the full title explicitly from the Home experience's own
// SEO `metaTitle` (segment) + global SiteSettings tagline/name. Rebrand = one publish.
// Note: `/` reflects the PUBLISHED title; use /preview to see draft edits live.
export async function generateMetadata(): Promise<Metadata> {
  const [content, settings] = await Promise.all([getHome(), getSiteSettings()]);
  const seo = (content[0] ?? null) as PageSeo | null;
  return buildContentMetadata(seo, settings, 'Home');
}

/**
 * Site root. Renders the published Home experience (visit_dubai app entry point)
 * fetched from Graph by path. Until it is composed + published, shows a friendly
 * placeholder. (Live editing happens via /preview; see docs/PREVIEW-WORKFLOW.md.)
 */
export default async function Home() {
  const content = await getHome();

  if (content.length > 0) {
    return <OptimizelyComponent content={content[0]} />;
  }

  return (
    <main className="under-construction">
      <h1>Visit Dubai — coming together</h1>
      <p>
        The Home experience isn’t published yet. Compose it in Visual Builder and publish, or
        preview it live via <code>/preview</code>.
      </p>
    </main>
  );
}
