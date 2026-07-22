import { contentType } from '@optimizely/cms-sdk';
import { SeoMetadataContract } from './SeoMetadata';
import { AreaContentType } from './Area';
import { CategoryContentType } from './Category';

/**
 * PointOfInterest — a place to visit / thing to do (the "Places to visit" type).
 * Geo-aware (lat/lng) so we can rank "nearest" in AI search (see docs/AI-SEARCH.md).
 */
export const PointOfInterestContentType = contentType({
  key: 'PointOfInterest',
  displayName: 'Point of Interest',
  baseType: '_page',
  extends: SeoMetadataContract,
  properties: {
    name: {
      type: 'string',
      displayName: 'Name',
      group: 'content',
      sortOrder: 1,
      isRequired: true,
      indexingType: 'searchable',
    },
    summary: {
      type: 'string',
      displayName: 'Summary',
      group: 'content',
      sortOrder: 2,
      indexingType: 'searchable',
    },
    body: {
      type: 'richText',
      displayName: 'Body',
      group: 'content',
      sortOrder: 3,
    },
    images: {
      type: 'array',
      displayName: 'Images',
      group: 'content',
      sortOrder: 4,
      items: { type: 'contentReference', allowedTypes: ['_image'] },
    },
    area: {
      type: 'contentReference',
      allowedTypes: [AreaContentType],
      displayName: 'Area',
      group: 'content',
      sortOrder: 5,
    },
    categories: {
      type: 'array',
      displayName: 'Categories',
      group: 'content',
      sortOrder: 6,
      items: { type: 'content', allowedTypes: [CategoryContentType] },
    },
    latitude: {
      type: 'float',
      displayName: 'Latitude',
      group: 'content',
      sortOrder: 7,
      minimum: -90,
      maximum: 90,
    },
    longitude: {
      type: 'float',
      displayName: 'Longitude',
      group: 'content',
      sortOrder: 8,
      minimum: -180,
      maximum: 180,
    },
    priceBand: {
      type: 'string',
      format: 'selectOne',
      displayName: 'Price band',
      group: 'content',
      sortOrder: 9,
      enum: [
        { value: 'free', displayName: 'Free' },
        { value: '$', displayName: '$' },
        { value: '$$', displayName: '$$' },
        { value: '$$$', displayName: '$$$' },
        { value: '$$$$', displayName: '$$$$' },
      ],
    },
    accolades: {
      type: 'array',
      displayName: 'Accolades',
      description: 'e.g. "Michelin Star", "UNESCO World Heritage"',
      group: 'content',
      sortOrder: 10,
      items: { type: 'string' },
    },
    openingHours: {
      type: 'string',
      displayName: 'Opening hours',
      group: 'content',
      sortOrder: 11,
    },
  },
});
