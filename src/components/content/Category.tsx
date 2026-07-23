import { contentType } from '@optimizely/cms-sdk';

/**
 * Category (LEGACY / dormant) — the original `_component` taxonomy term. Base
 * types are immutable and this type still has stuck items blocking its deletion,
 * so it is left dormant and UNUSED. The live, filterable taxonomy is the `Tag`
 * (`_page`) type — see docs/CONTENT-ARCHITECTURE.md §3. Delete this type later
 * via an interactive `optimizely-cms-cli content delete Category`.
 */
export const CategoryContentType = contentType({
  key: 'Category',
  displayName: 'Category (Taxonomy term)',
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
      isRequired: true,
    },
    dimension: {
      type: 'string',
      format: 'selectOne',
      displayName: 'Taxonomy dimension',
      group: 'content',
      sortOrder: 3,
      isRequired: true,
      enum: [
        { value: 'theme', displayName: 'Theme' },
        { value: 'cuisine', displayName: 'Cuisine' },
        { value: 'audience', displayName: 'Audience' },
        { value: 'amenity', displayName: 'Amenity' },
        { value: 'interest', displayName: 'Interest' },
        { value: 'season', displayName: 'Season' },
        { value: 'accessibility', displayName: 'Accessibility' },
      ],
    },
    description: { type: 'string', displayName: 'Description', group: 'content', sortOrder: 4, indexingType: 'searchable' },
    synonyms: { type: 'array', displayName: 'Synonyms', group: 'content', sortOrder: 5, items: { type: 'string' } },
    featured: { type: 'boolean', displayName: 'Featured', group: 'content', sortOrder: 6 },
    icon: { type: 'string', displayName: 'Icon', group: 'content', sortOrder: 7 },
  },
});
