import { contentType, type ContentProps } from '@optimizely/cms-sdk';
import {
  OptimizelyComposition,
  type ComponentContainerProps,
  getPreviewUtils,
} from '@optimizely/cms-sdk/react/server';
import { SeoMetadataContract } from './SeoMetadata';
import { PlacesToVisitPageContentType } from './PlacesToVisitPage';
import { NeighbourhoodsPageContentType } from './NeighbourhoodsPage';
import { EventsPageContentType } from './EventsPage';
import { AreaContentType } from './Area';
import { EventContentType } from './Event';
import { TagContentType } from './Tag';
import { SiteSettingsContentType } from './SiteSettings';
import { FolderContentType } from './Folder';

/**
 * HomePage — the site's home experience AND its site root (one node, e.g.
 * "This is Dubai"). It's the Start Page (`/`) an Application binds its host to,
 * and it also PARENTS the section pages, so the content tree is
 * `Root → This is Dubai → {sections}` and URLs resolve relative to here.
 * Multisite = one HomePage site-root + Application per destination.
 * Authors compose the home canvas from the blocks in src/components/blocks/.
 */
export const HomePageContentType = contentType({
  key: 'HomePage',
  displayName: 'Home / Site Root',
  baseType: '_experience',
  extends: SeoMetadataContract,
  // The site root contains the section pages + organizational folders
  // (Taxonomy → Tags, Settings → Site Settings). Tag/SiteSettings stay listed so
  // existing direct children still validate during/after the move into folders.
  mayContainTypes: [
    PlacesToVisitPageContentType,
    NeighbourhoodsPageContentType,
    EventsPageContentType,
    AreaContentType,
    EventContentType,
    FolderContentType,
    TagContentType,
    SiteSettingsContentType,
  ],
  properties: {
    internalTitle: {
      type: 'string',
      displayName: 'Internal title',
      description: 'Editor-only label; not shown on the page.',
      group: 'content',
      sortOrder: 1,
    },
  },
});

function ComponentWrapper({ children, node }: ComponentContainerProps) {
  const { pa } = getPreviewUtils(node);
  return <div {...pa(node)}>{children}</div>;
}

export default function HomePage({
  content,
}: {
  content: ContentProps<typeof HomePageContentType>;
}) {
  return (
    <OptimizelyComposition
      nodes={content.composition.nodes ?? []}
      ComponentWrapper={ComponentWrapper}
    />
  );
}
