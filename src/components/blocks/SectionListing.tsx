import { contentType, type ContentProps } from '@optimizely/cms-sdk';
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server';
import {
  SectionShell,
  type SectionTheme,
  type SectionWidth,
  type SectionSpacing,
} from '@/components/ui/SectionShell';
import { LayoutDisplayTemplate } from './LayoutDisplayTemplate';
import { SectionCardGrid } from '@/components/content/SectionCard';
import { getSectionChildren } from '@/lib/sections';

/**
 * SectionListing — the reusable "list this section's items" block that authors drop
 * onto a section page's Visual Builder canvas. It's the listing engine (Listing-Pattern
 * §8): put content above it (Hero, heading) and below it (RichText) on the canvas.
 *
 * `source` points at the section page whose CHILDREN to list (usually the page the
 * block sits on). The children query is generic (POIs, Areas, Events) so one block
 * serves every section. Pagination/sort/filters layer on here in later phases.
 */
export const SectionListingContentType = contentType({
  key: 'SectionListing',
  displayName: 'Section Listing',
  baseType: '_component',
  compositionBehaviors: ['sectionEnabled', 'elementEnabled'],
  properties: {
    source: {
      type: 'contentReference',
      displayName: 'Section (whose items to list)',
      description: 'The section page whose child items are listed. Usually the page this block sits on.',
      group: 'content',
      sortOrder: 1,
      allowedTypes: ['PlacesToVisit', 'Neighbourhoods', 'Events'],
    },
    heading: {
      type: 'string',
      displayName: 'Heading (optional)',
      description: 'Optional heading shown above the grid.',
      group: 'content',
      sortOrder: 2,
    },
  },
});

type Props = {
  content: ContentProps<typeof SectionListingContentType>;
  displaySettings?: ContentProps<typeof LayoutDisplayTemplate>;
};

export default async function SectionListing({ content, displaySettings }: Props) {
  const { pa } = getPreviewUtils(content);
  const sourceKey = content.source?.key;
  const items = sourceKey ? await getSectionChildren(sourceKey) : [];

  return (
    <SectionShell
      theme={(displaySettings?.theme as SectionTheme) ?? 'inherit'}
      width={(displaySettings?.width as SectionWidth) ?? 'contained'}
      spacing={(displaySettings?.spacing as SectionSpacing) ?? 'normal'}
    >
      {content.heading ? (
        <h2 className="mb-10 text-3xl md:text-4xl" {...pa('heading')}>
          {content.heading}
        </h2>
      ) : null}
      <SectionCardGrid items={items} />
    </SectionShell>
  );
}
