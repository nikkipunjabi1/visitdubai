import { contentType } from '@optimizely/cms-sdk';
import { SeoMetadataContract } from './SeoMetadata';
import { CategoryContentType } from './Category';
import { PointOfInterestContentType } from './PointOfInterest';

/** Article — editorial guide / news story. */
export const ArticleContentType = contentType({
  key: 'Article',
  displayName: 'Article',
  baseType: '_page',
  extends: SeoMetadataContract,
  properties: {
    title: { type: 'string', displayName: 'Title', group: 'content', sortOrder: 1, isRequired: true, indexingType: 'searchable' },
    excerpt: { type: 'string', displayName: 'Excerpt', group: 'content', sortOrder: 2, indexingType: 'searchable' },
    body: { type: 'richText', displayName: 'Body', group: 'content', sortOrder: 3 },
    heroImage: { type: 'contentReference', allowedTypes: ['_image'], displayName: 'Hero image', group: 'content', sortOrder: 4 },
    author: { type: 'string', displayName: 'Author', group: 'content', sortOrder: 5 },
    publishDate: { type: 'dateTime', displayName: 'Publish date', group: 'content', sortOrder: 6 },
    categories: { type: 'array', displayName: 'Categories', group: 'content', sortOrder: 7, items: { type: 'content', allowedTypes: [CategoryContentType] } },
    relatedPlaces: { type: 'array', displayName: 'Related places', group: 'content', sortOrder: 8, items: { type: 'content', allowedTypes: [PointOfInterestContentType] } },
  },
});
