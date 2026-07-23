import { contentType, type ContentProps } from '@optimizely/cms-sdk';
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server';
import { SectionShell } from '@/components/ui/SectionShell';

/**
 * Category — a faceted, hierarchical taxonomy term. This is the backbone of
 * filtering/faceting AND the AI card components (docs/AI-SEARCH.md): `synonyms`
 * + `description` give the AI/semantic search the vocabulary to match user
 * intent ("Michelin star" → fine dining), while `dimension` lets one type power
 * several distinct taxonomies (themes, cuisines, audiences, amenities…).
 *
 * Base type is `_page` (managed content): Graph can only resolve + FILTER a
 * reference when the target is managed content, so this is what lets a POI's
 * `categories` power the listing facets. It also gives us category landing pages
 * later. (A `_component` cannot be a referenced/filterable taxonomy.)
 */
export const CategoryContentType = contentType({
  key: 'Category',
  displayName: 'Category (Taxonomy term)',
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
      description: 'Which taxonomy this term belongs to. Enables multiple independent facets.',
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
      ],
    },
    description: {
      type: 'string',
      displayName: 'Description',
      description: 'Short definition — used in UI tooltips and as grounding context for the AI.',
      group: 'content',
      sortOrder: 4,
      indexingType: 'searchable',
    },
    synonyms: {
      type: 'array',
      displayName: 'Synonyms',
      description:
        'Alternate terms for semantic search + AI matching, e.g. Michelin → "fine dining", "haute cuisine", "starred".',
      group: 'content',
      sortOrder: 5,
      items: { type: 'string' },
    },
    parent: {
      type: 'contentReference',
      allowedTypes: ['_self'],
      displayName: 'Parent category',
      description: 'Optional parent for hierarchy (e.g. Dining → Fine dining → Michelin).',
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

export default function Category({
  content,
}: {
  content: ContentProps<typeof CategoryContentType>;
}) {
  const { pa } = getPreviewUtils(content);
  return (
    <SectionShell theme="dark" spacing="spacious">
      <div className="mx-auto max-w-page px-6 md:px-10 lg:px-16">
        <p className="eyebrow">{content.dimension}</p>
        <h1 className="mt-5 text-[clamp(2.25rem,5vw,3.75rem)]" {...pa('name')}>
          {content.icon ? `${content.icon} ` : ''}
          {content.name}
        </h1>
        {content.description ? (
          <p className="mt-5 max-w-2xl text-lg text-muted" {...pa('description')}>
            {content.description}
          </p>
        ) : null}
      </div>
    </SectionShell>
  );
}
