import type { Metadata } from 'next';
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

/** The SEO fields authored on a page (from the `SeoMetadata` contract). */
export type PageSeo = {
  metaTitle?: string | null;
  metaDescription?: string | null;
  noindex?: boolean | null;
  nofollow?: boolean | null;
};

/**
 * Build Next.js `Metadata` for a page from its authored SEO fields + global
 * settings. `metaTitle` is the page-specific SEGMENT only (e.g. "Home"); the
 * global tagline + site name are always appended, so a rebrand stays a single
 * publish. If `metaTitle` is blank we fall back to `fallbackSegment`.
 *
 * We emit `title.absolute` (the fully composed string) rather than relying on
 * Next's title template, so it's correct on the root page too (the template
 * doesn't wrap same-route-segment routes).
 */
export function buildContentMetadata(
  seo: PageSeo | null | undefined,
  settings: SiteSettings,
  fallbackSegment: string,
): Metadata {
  const segment = (seo?.metaTitle ?? '').trim() || fallbackSegment;
  const meta: Metadata = {
    title: { absolute: buildPageTitle(settings, segment) },
  };
  if (seo?.metaDescription) meta.description = seo.metaDescription;
  if (seo?.noindex || seo?.nofollow) {
    meta.robots = { index: !seo?.noindex, follow: !seo?.nofollow };
  }
  return meta;
}
