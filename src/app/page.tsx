import type { Metadata } from 'next';
import { getClient } from '@optimizely/cms-sdk';
import { OptimizelyComponent } from '@optimizely/cms-sdk/react/server';
import { getSiteSettings, buildPageTitle } from '@/lib/seo';

// The root page shares the root layout's route segment, so Next's title template
// doesn't wrap it — build the full title explicitly (still from global SiteSettings,
// so a rebrand is one publish). → "Homepage | Unofficial Travel & Tourism Guide | Visit Dubai".
// (S2.7 will source the page title from the experience's own SEO metaTitle.)
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return { title: { absolute: buildPageTitle(settings, 'Homepage') } };
}

/**
 * Site root. Renders the published Home experience (visit_dubai app entry point)
 * fetched from Graph by path. Until it is composed + published, shows a friendly
 * placeholder. (Live editing happens via /preview; see docs/PREVIEW-WORKFLOW.md.)
 */
export default async function Home() {
  let content: Awaited<ReturnType<ReturnType<typeof getClient>['getContentByPath']>> = [];
  try {
    content = await getClient().getContentByPath('/');
  } catch {
    content = [];
  }

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
