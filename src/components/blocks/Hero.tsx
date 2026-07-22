import { contentType, type ContentProps } from '@optimizely/cms-sdk';
import { getPreviewUtils } from '@optimizely/cms-sdk/react/server';
import Image from 'next/image';
import {
  SectionShell,
  type SectionTheme,
  type SectionWidth,
  type SectionSpacing,
} from '@/components/ui/SectionShell';
import { LayoutDisplayTemplate } from './LayoutDisplayTemplate';

/**
 * Hero — cinematic full-bleed banner (key `HeroBanner` to avoid colliding with
 * the scaffold demo's `Hero`). A banner-type block, so it owns its Light/Dark +
 * width settings (defaults: dark, full-bleed) per COMPONENT-STANDARDS §3.
 */
export const HeroBannerContentType = contentType({
  key: 'HeroBanner',
  displayName: 'Hero',
  baseType: '_component',
  compositionBehaviors: ['sectionEnabled', 'elementEnabled'],
  properties: {
    eyebrow: { type: 'string', displayName: 'Eyebrow', group: 'content', sortOrder: 1 },
    heading: { type: 'string', displayName: 'Heading', group: 'content', sortOrder: 2, isRequired: true },
    subheading: { type: 'string', displayName: 'Subheading', group: 'content', sortOrder: 3 },
    backgroundImage: {
      type: 'contentReference',
      allowedTypes: ['_image'],
      displayName: 'Background image',
      group: 'content',
      sortOrder: 4,
    },
    ctaLabel: { type: 'string', displayName: 'CTA label', group: 'content', sortOrder: 5 },
    ctaUrl: { type: 'url', displayName: 'CTA link', group: 'content', sortOrder: 6 },
  },
});

type Props = {
  content: ContentProps<typeof HeroBannerContentType>;
  displaySettings?: ContentProps<typeof LayoutDisplayTemplate>;
};

export default function Hero({ content, displaySettings }: Props) {
  const { pa, src } = getPreviewUtils(content);
  const bg = src(content.backgroundImage);
  return (
    <SectionShell
      theme={(displaySettings?.theme as SectionTheme) ?? 'dark'}
      width={(displaySettings?.width as SectionWidth) ?? 'full'}
      spacing={(displaySettings?.spacing as SectionSpacing) ?? 'spacious'}
      className="relative overflow-hidden"
    >
      {bg ? (
        <div className="absolute inset-0 -z-10">
          <Image src={bg} alt="" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-obsidian/10" />
        </div>
      ) : null}
      <div className="mx-auto max-w-page px-6 md:px-10 lg:px-16">
        {content.eyebrow ? (
          <p className="eyebrow" {...pa('eyebrow')}>
            {content.eyebrow}
          </p>
        ) : null}
        <h1 className="mt-6 max-w-[16ch] text-[clamp(2.75rem,7vw,6rem)]" {...pa('heading')}>
          {content.heading}
        </h1>
        {content.subheading ? (
          <p className="mt-6 max-w-[46ch] text-lg text-muted" {...pa('subheading')}>
            {content.subheading}
          </p>
        ) : null}
        {content.ctaLabel && content.ctaUrl ? (
          <a
            href={content.ctaUrl.default ?? undefined}
            className="mt-10 inline-block rounded-full bg-champagne px-7 py-3 text-sm font-semibold text-obsidian transition hover:bg-champagne-hi"
            {...pa('ctaLabel')}
          >
            {content.ctaLabel}
          </a>
        ) : null}
      </div>
    </SectionShell>
  );
}
