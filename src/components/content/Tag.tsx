import { contentType } from '@optimizely/cms-sdk';

/**
 * Tag — the live, faceted, hierarchical taxonomy term (replaces the dormant
 * `_component` Category). Base type is **`_page`** because Optimizely Graph can
 * only resolve + FILTER a reference whose target is *managed* content — this is
 * what lets a POI/Event `tags` reference power the listing facets.
 *
 * `dimension` lets one type drive several independent facets (themes, cuisines,
 * audiences…). `synonyms` + `description` also feed Phase-4 AI/semantic search.
 *
 * Tags are NON-ROUTABLE on the site (excluded in the [...slug] router, see
 * docs/CONTENT-ARCHITECTURE.md §4) — pure taxonomy data, no public URL. They can
 * be promoted to real (noindex) landing pages later without a model change.
 */
export const TagContentType = contentType({
  key: 'Tag',
  displayName: 'Tag (Taxonomy term)',
  baseType: '_page',
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
      description: 'URL-safe identifier, e.g. "fine-dining".',
      group: 'content',
      sortOrder: 2,
      isRequired: true,
    },
    dimension: {
      type: 'string',
      format: 'selectOne',
      displayName: 'Taxonomy dimension',
      description: 'Which facet this term belongs to. Enables multiple independent filters.',
      group: 'content',
      sortOrder: 3,
      isRequired: true,
      enum: [
        { value: 'theme', displayName: 'Theme (beach, culture, adventure, luxury…)' },
        { value: 'cuisine', displayName: 'Cuisine (for dining)' },
        { value: 'audience', displayName: 'Audience (family, couples, solo, business)' },
        { value: 'amenity', displayName: 'Amenity (for hotels)' },
        { value: 'interest', displayName: 'Interest (art, history, sport…)' },
        { value: 'season', displayName: 'Season / best time' },
        { value: 'accessibility', displayName: 'Accessibility' },
        { value: 'eventType', displayName: 'Event type (festival, concert, sport…)' },
      ],
    },
    description: {
      type: 'string',
      displayName: 'Description',
      description: 'Short definition — UI tooltips + grounding context for AI.',
      group: 'content',
      sortOrder: 4,
      indexingType: 'searchable',
    },
    synonyms: {
      type: 'array',
      displayName: 'Synonyms',
      description: 'Alternate terms for semantic search + AI matching (e.g. Michelin → "fine dining").',
      group: 'content',
      sortOrder: 5,
      items: { type: 'string' },
    },
    parent: {
      type: 'contentReference',
      allowedTypes: ['_self'],
      displayName: 'Parent tag',
      description: 'Optional parent for hierarchy (e.g. Dining → Fine dining).',
      group: 'content',
      sortOrder: 6,
    },
    featured: {
      type: 'boolean',
      displayName: 'Featured',
      description: 'Surface this term in primary navigation / filter chips.',
      group: 'content',
      sortOrder: 7,
    },
    icon: {
      type: 'string',
      displayName: 'Icon',
      description: 'Optional icon name or emoji for chips/cards.',
      group: 'content',
      sortOrder: 8,
    },
  },
});
