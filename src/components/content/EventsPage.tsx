import { contentType, type ContentProps } from '@optimizely/cms-sdk';
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server';
import { SectionShell } from '@/components/ui/SectionShell';
import { SectionCardGrid } from './SectionCard';
import { SeoMetadataContract } from './SeoMetadata';
import { EventContentType } from './Event';
import { getChildEvents } from '@/lib/sections';

/**
 * EventsPage — the "/events" listing. A routable section page whose child Events
 * (festivals, races…) render as cards ordered by date. Same listing pattern as
 * PlacesToVisitPage. See docs/LISTING-PATTERN.md + CONTENT-ARCHITECTURE.md.
 */
export const EventsPageContentType = contentType({
  key: 'EventsPage',
  displayName: 'Events (Listing Page)',
  baseType: '_page',
  extends: SeoMetadataContract,
  mayContainTypes: [EventContentType],
  properties: {
    heading: { type: 'string', displayName: 'Heading', group: 'content', sortOrder: 1, isRequired: true },
    intro: { type: 'string', displayName: 'Intro', group: 'content', sortOrder: 2 },
  },
});

export default async function EventsPage({
  content,
}: {
  content: ContentProps<typeof EventsPageContentType>;
}) {
  const { pa } = getPreviewUtils(content);
  const key = content._metadata?.key;
  const events = key ? await getChildEvents(key) : [];

  return (
    <SectionShell theme="dark" spacing="spacious">
      <div className="mx-auto max-w-page px-6 md:px-10 lg:px-16">
        <header className="mb-12 max-w-2xl">
          <p className="eyebrow">What&rsquo;s On</p>
          <h1 className="mt-5 text-[clamp(2.25rem,5vw,3.75rem)]" {...pa('heading')}>
            {content.heading}
          </h1>
          {content.intro ? (
            <p className="mt-5 text-lg text-muted" {...pa('intro')}>
              {content.intro}
            </p>
          ) : null}
        </header>
        <SectionCardGrid items={events} />
      </div>
    </SectionShell>
  );
}
