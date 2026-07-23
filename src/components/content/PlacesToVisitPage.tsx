import { contentType, type ContentProps } from '@optimizely/cms-sdk';
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server';
import { SectionShell } from '@/components/ui/SectionShell';
import { POICardGrid } from './POICardGrid';
import { SeoMetadataContract } from './SeoMetadata';
import { PointOfInterestContentType } from './PointOfInterest';
import { getChildPois } from '@/lib/pois';

/**
 * PlacesToVisitPage — the "/places-to-visit" listing page. A routable CMS page
 * (so it lives in the content tree and owns its URL segment); Points of Interest
 * are authored as its CHILDREN, giving URLs like /places-to-visit/burj-al-arab.
 * The grid is populated by querying this page's children, so editors manage both
 * the tree and what appears here.
 */
export const PlacesToVisitPageContentType = contentType({
  key: 'PlacesToVisitPage',
  displayName: 'Places to Visit (Listing Page)',
  baseType: '_page',
  extends: SeoMetadataContract,
  // Points of Interest are authored as children of this page → the CMS tree and
  // the /places-to-visit/<slug> URLs stay in lockstep, editor-managed.
  mayContainTypes: [PointOfInterestContentType],
  properties: {
    heading: {
      type: 'string',
      displayName: 'Heading',
      group: 'content',
      sortOrder: 1,
      isRequired: true,
    },
    intro: {
      type: 'string',
      displayName: 'Intro',
      group: 'content',
      sortOrder: 2,
    },
  },
});

export default async function PlacesToVisitPage({
  content,
}: {
  content: ContentProps<typeof PlacesToVisitPageContentType>;
}) {
  const { pa } = getPreviewUtils(content);
  const key = content._metadata?.key;
  const pois = key ? await getChildPois(key) : [];

  return (
    <SectionShell theme="dark" spacing="spacious">
      <div className="mx-auto max-w-page px-6 md:px-10 lg:px-16">
        <header className="mb-12 max-w-2xl">
          <p className="eyebrow">Places to Visit</p>
          <h1 className="mt-5 text-[clamp(2.25rem,5vw,3.75rem)]" {...pa('heading')}>
            {content.heading}
          </h1>
          {content.intro ? (
            <p className="mt-5 text-lg text-muted" {...pa('intro')}>
              {content.intro}
            </p>
          ) : null}
        </header>
        <POICardGrid pois={pois} />
      </div>
    </SectionShell>
  );
}
