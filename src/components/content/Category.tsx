import { contentType } from '@optimizely/cms-sdk';

/**
 * Category — cross-cutting taxonomy tag (beach, culture, dining, luxury, desert…)
 * referenced by Places, Events, Tours, Hotels and Articles for filtering/faceting.
 */
export const CategoryContentType = contentType({
  key: 'Category',
  displayName: 'Category',
  baseType: '_component',
  properties: {
    name: {
      type: 'string',
      displayName: 'Name',
      group: 'content',
      sortOrder: 1,
      isRequired: true,
      indexingType: 'searchable',
    },
    slug: {
      type: 'string',
      displayName: 'Slug',
      group: 'content',
      sortOrder: 2,
    },
  },
});
