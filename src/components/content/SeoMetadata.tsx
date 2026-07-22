import { contract } from '@optimizely/cms-sdk';

/**
 * SeoMetadata — reusable SEO property set (a contract). Routable content types
 * `extends` this so every page carries SEO fields. See docs/SEO.md.
 */
export const SeoMetadataContract = contract({
  key: 'SeoMetadata',
  displayName: 'SEO',
  properties: {
    metaTitle: {
      type: 'string',
      displayName: 'Meta title',
      description: 'Overrides the browser/search title. Aim for ~60–70 characters.',
      group: 'seo',
      sortOrder: 1,
      maxLength: 70,
    },
    metaDescription: {
      type: 'string',
      displayName: 'Meta description',
      group: 'seo',
      sortOrder: 2,
      maxLength: 180,
    },
    canonicalUrl: {
      type: 'url',
      displayName: 'Canonical URL',
      group: 'seo',
      sortOrder: 3,
    },
    ogImage: {
      type: 'contentReference',
      allowedTypes: ['_image'],
      displayName: 'Social share image',
      group: 'seo',
      sortOrder: 4,
    },
    noindex: {
      type: 'boolean',
      displayName: 'Hide from search engines (noindex)',
      group: 'seo',
      sortOrder: 5,
    },
  },
});
