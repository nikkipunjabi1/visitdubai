import { contentType, type ContentProps } from '@optimizely/cms-sdk';
import {
  OptimizelyComposition,
  type ComponentContainerProps,
  getPreviewUtils,
} from '@optimizely/cms-sdk/react/server';
import { SeoMetadataContract } from './SeoMetadata';

/**
 * HomePage — the site's Visual Builder experience (the `this_is_dubai` app's entry
 * point). Authors compose it from the blocks in src/components/blocks/ (Hero,
 * SectionHeading, RichText…). Rendered by walking the composition node tree.
 */
export const HomePageContentType = contentType({
  key: 'HomePage',
  displayName: 'Home Page',
  baseType: '_experience',
  extends: SeoMetadataContract,
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
