import { contentType } from '@optimizely/cms-sdk';

/**
 * SiteSettings — a singleton global config item (create one instance in the CMS).
 * Drives site-wide SEO/crawl behaviour. `allowSearchIndexing` is the master
 * crawl switch: it is treated as OFF by default (see src/app/robots.ts), so the
 * Vercel demo is NOT indexed until someone explicitly turns it on for a launch.
 */
export const SiteSettingsContentType = contentType({
  key: 'SiteSettings',
  displayName: 'Site Settings',
  baseType: '_page',
  properties: {
    // --- Global branding used in every page's <title> ---
    siteName: {
      type: 'string',
      displayName: 'Site name',
      description:
        'Appended to every page title, e.g. "…| Visit Dubai". Change here to rebrand the whole site in one publish.',
      group: 'content',
      sortOrder: 1,
    },
    titleTagline: {
      type: 'string',
      displayName: 'Title tagline',
      description: 'Optional middle segment of the title, e.g. "Unofficial Travel & Tourism Guide".',
      group: 'content',
      sortOrder: 2,
    },
    titleSeparator: {
      type: 'string',
      displayName: 'Title separator',
      description: 'Separator between title segments (default "|").',
      group: 'content',
      sortOrder: 3,
    },
    // --- Crawl control ---
    allowSearchIndexing: {
      type: 'boolean',
      displayName: 'Allow search-engine indexing (global)',
      description:
        'OFF for the demo so crawlers do not index it. Turn ON only for a real launch. ' +
        'When OFF, robots.txt disallows all crawlers and every page is served noindex.',
      group: 'seo',
      sortOrder: 1,
    },
    robotsTxtCustom: {
      type: 'string',
      displayName: 'Custom robots.txt additions',
      description: 'Optional extra lines appended to the generated robots.txt (when indexing is allowed).',
      group: 'seo',
      sortOrder: 2,
    },
  },
});
