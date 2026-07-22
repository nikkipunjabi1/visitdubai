import { contentType } from '@optimizely/cms-sdk';
import { SeoMetadataContract } from './SeoMetadata';

/**
 * Area — a Dubai neighbourhood / region (e.g. Downtown, Marina, Deira).
 * Routable page; Points of Interest, Hotels and Events reference it.
 */
export const AreaContentType = contentType({
  key: 'Area',
  displayName: 'Area / Neighbourhood',
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
    description: {
      type: 'richText',
      displayName: 'Description',
      group: 'content',
      sortOrder: 3,
    },
    heroImage: {
      type: 'contentReference',
      allowedTypes: ['_image'],
      displayName: 'Hero image',
      group: 'content',
      sortOrder: 4,
    },
    latitude: {
      type: 'float',
      displayName: 'Latitude',
      group: 'content',
      sortOrder: 5,
      minimum: -90,
      maximum: 90,
    },
    longitude: {
      type: 'float',
      displayName: 'Longitude',
      group: 'content',
      sortOrder: 6,
      minimum: -180,
      maximum: 180,
    },
  },
});
