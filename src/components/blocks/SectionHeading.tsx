import { contentType, type ContentProps } from '@optimizely/cms-sdk';
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server';
import {
  SectionShell,
  type SectionTheme,
  type SectionWidth,
  type SectionSpacing,
} from '@/components/ui/SectionShell';
import { LayoutDisplayTemplate } from './LayoutDisplayTemplate';

/** SectionHeading — an eyebrow + heading + intro band. Usable as a section or element in VB. */
export const SectionHeadingContentType = contentType({
  key: 'SectionHeading',
  displayName: 'Section Heading',
  baseType: '_component',
  compositionBehaviors: ['sectionEnabled', 'elementEnabled'],
  properties: {
    eyebrow: { type: 'string', displayName: 'Eyebrow', group: 'content', sortOrder: 1 },
    heading: { type: 'string', displayName: 'Heading', group: 'content', sortOrder: 2, isRequired: true },
    intro: { type: 'string', displayName: 'Intro', group: 'content', sortOrder: 3 },
  },
});

type Props = {
  content: ContentProps<typeof SectionHeadingContentType>;
  displaySettings?: ContentProps<typeof LayoutDisplayTemplate>;
};

export default function SectionHeading({ content, displaySettings }: Props) {
  const { pa } = getPreviewUtils(content);
  return (
    <SectionShell
      theme={(displaySettings?.theme as SectionTheme) ?? 'inherit'}
      width={(displaySettings?.width as SectionWidth) ?? 'contained'}
      spacing={(displaySettings?.spacing as SectionSpacing) ?? 'normal'}
    >
      {content.eyebrow ? (
        <p className="eyebrow" {...pa('eyebrow')}>
          {content.eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 text-4xl md:text-5xl" {...pa('heading')}>
        {content.heading}
      </h2>
      {content.intro ? (
        <p className="mt-4 max-w-[60ch] text-lg text-muted" {...pa('intro')}>
          {content.intro}
        </p>
      ) : null}
    </SectionShell>
  );
}
