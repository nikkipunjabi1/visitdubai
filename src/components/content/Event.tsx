import { contentType } from '@optimizely/cms-sdk';
import { SeoMetadataContract } from './SeoMetadata';
import { AreaContentType } from './Area';
import { TagContentType } from './Tag';

/** Event — a dated "what's on" happening (festival, exhibition, concert, dining event). */
export const EventContentType = contentType({
  key: 'Event',
  displayName: 'Event',
  baseType: '_page',
  extends: SeoMetadataContract,
  properties: {
    name: { type: 'string', displayName: 'Name', group: 'content', sortOrder: 1, isRequired: true, indexingType: 'searchable' },
    summary: { type: 'string', displayName: 'Summary', group: 'content', sortOrder: 2, indexingType: 'searchable' },
    body: { type: 'richText', displayName: 'Body', group: 'content', sortOrder: 3 },
    images: { type: 'array', displayName: 'Images', group: 'content', sortOrder: 4, items: { type: 'contentReference', allowedTypes: ['_image'] } },
    startDate: { type: 'dateTime', displayName: 'Start date', group: 'content', sortOrder: 5, isRequired: true },
    endDate: { type: 'dateTime', displayName: 'End date', group: 'content', sortOrder: 6 },
    area: { type: 'contentReference', allowedTypes: [AreaContentType], displayName: 'Area / venue', group: 'content', sortOrder: 7 },
    tags: { type: 'array', displayName: 'Tags', description: 'Taxonomy terms (event type, audience…) — power filtering/facets + AI search.', group: 'content', sortOrder: 8, items: { type: 'contentReference', allowedTypes: [TagContentType] } },
    ticketUrl: { type: 'url', displayName: 'Ticket URL', group: 'content', sortOrder: 9 },
  },
});
