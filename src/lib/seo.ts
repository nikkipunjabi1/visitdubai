import { getClient } from '@optimizely/cms-sdk';

/**
 * Global SEO/branding settings, sourced from the CMS `SiteSettings` singleton.
 * The site name + tagline drive EVERY page's <title> via a Next.js title template,
 * so rebranding is a single CMS publish — no per-page edits. Falls back to sensible
 * defaults if the SiteSettings item isn't published yet (so titles always work).
 */
export type SiteSettings = {
  siteName: string;
  titleTagline: string;
  titleSeparator: string;
};

const DEFAULTS: SiteSettings = {
  siteName: 'Visit Dubai',
  titleTagline: 'Unofficial Travel & Tourism Guide',
  titleSeparator: '|',
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const data = (await getClient().request(
      `query { SiteSettings(limit: 1) { items { siteName titleTagline titleSeparator } } }`,
      {},
    )) as { SiteSettings?: { items?: Array<Partial<SiteSettings>> } };
    const s = data?.SiteSettings?.items?.[0] ?? {};
    return {
      siteName: s.siteName || DEFAULTS.siteName,
      titleTagline: s.titleTagline || DEFAULTS.titleTagline,
      titleSeparator: s.titleSeparator || DEFAULTS.titleSeparator,
    };
  } catch {
    return DEFAULTS;
  }
}

/** Next.js title template — the page title fills `%s`, e.g. "Homepage | Unofficial Travel & Tourism Guide | Visit Dubai". */
export function buildTitleTemplate(s: SiteSettings): string {
  const sep = ` ${s.titleSeparator} `;
  return ['%s', s.titleTagline, s.siteName].filter(Boolean).join(sep);
}

/** Default title for pages that don't set their own (e.g. the site root). */
export function buildTitleDefault(s: SiteSettings): string {
  const sep = ` ${s.titleSeparator} `;
  return [s.siteName, s.titleTagline].filter(Boolean).join(sep);
}

/**
 * Full, explicit title for a specific page. Used by the ROOT/home page — which,
 * being the same route segment as the root layout, does NOT inherit Next's title
 * template — so we build the same "<page> | <tagline> | <site name>" string here.
 * Nested pages don't need this; they set a plain `title` and inherit the template.
 */
export function buildPageTitle(s: SiteSettings, pageTitle: string): string {
  return buildTitleTemplate(s).replace('%s', pageTitle);
}
