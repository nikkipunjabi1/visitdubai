import { contentType, type ContentProps } from '@optimizely/cms-sdk';
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server';
import { SectionShell } from '@/components/ui/SectionShell';
import { SectionCardGrid } from './SectionCard';
import { SeoMetadataContract } from './SeoMetadata';
import { AreaContentType } from './Area';
import { getChildAreas } from '@/lib/sections';

/**
 * NeighbourhoodsPage — the "/neighbourhoods" listing. A routable section page
 * whose child Areas (Downtown, Marina, Old Dubai…) render as cards. Same listing
 * pattern as PlacesToVisitPage. See docs/LISTING-PATTERN.md + CONTENT-ARCHITECTURE.md.
 */
export const NeighbourhoodsPageContentType = contentType({
  key: 'NeighbourhoodsPage',
  displayName: 'Neighbourhoods (Listing Page)',
  baseType: '_page',
  extends: SeoMetadataContract,
  mayContainTypes: [AreaContentType],
  properties: {
    heading: { type: 'string', displayName: 'Heading', group: 'content', sortOrder: 1, isRequired: true },
    intro: { type: 'string', displayName: 'Intro', group: 'content', sortOrder: 2 },
  },
});

export default async function NeighbourhoodsPage({
  content,
}: {
  content: ContentProps<typeof NeighbourhoodsPageContentType>;
}) {
  const { pa } = getPreviewUtils(content);
  const key = content._metadata?.key;
  const areas = key ? await getChildAreas(key) : [];

  return (
    <SectionShell theme="dark" spacing="spacious">
      <div className="mx-auto max-w-page px-6 md:px-10 lg:px-16">
        <header className="mb-12 max-w-2xl">
          <p className="eyebrow">Neighbourhoods</p>
          <h1 className="mt-5 text-[clamp(2.25rem,5vw,3.75rem)]" {...pa('heading')}>
            {content.heading}
          </h1>
          {content.intro ? (
            <p className="mt-5 text-lg text-muted" {...pa('intro')}>
              {content.intro}
            </p>
          ) : null}
        </header>
        <SectionCardGrid items={areas} />
      </div>
    </SectionShell>
  );
}
