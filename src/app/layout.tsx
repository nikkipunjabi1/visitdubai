import React from 'react';

import { Fraunces, Hanken_Grotesk } from 'next/font/google';
import './globals.css';
import {
  BlankExperienceContentType,
  BlankSectionContentType,
  config,
  initContentTypeRegistry,
  initDisplayTemplateRegistry,
} from '@optimizely/cms-sdk';
import { initReactComponentRegistry } from '@optimizely/cms-sdk/react/server';

// System Visual Builder types (provided by the SDK / present in every SaaS instance).
import BlankExperience from '@/components/BlankExperience';
import BlankSection from '@/components/BlankSection';

// Visit Dubai Visual Builder blocks (S2.3).
import SectionHeading, { SectionHeadingContentType } from '@/components/blocks/SectionHeading';
import RichTextBlock, { RichTextBlockContentType } from '@/components/blocks/RichTextBlock';
import Hero, { HeroBannerContentType } from '@/components/blocks/Hero';
import { LayoutDisplayTemplate } from '@/components/blocks/LayoutDisplayTemplate';

// Visit Dubai experiences + media.
import HomePage, { HomePageContentType } from '@/components/content/HomePage';
import ImageMedia, { ImageMediaContentType } from '@/components/media/ImageMedia';

import type { Metadata } from 'next';
import { getSiteSettings, buildTitleTemplate, buildTitleDefault } from '@/lib/seo';

config({
  apiKey: process.env.OPTIMIZELY_GRAPH_SINGLE_KEY || "your api key here",
  graphUrl: process.env.OPTIMIZELY_GRAPH_GATEWAY,
});

// The registry must mirror the CMS content model: types registered here but
// absent from Graph make the delivery/preview query fail ("errors in the
// GraphQL query"); types in Graph but missing here throw
// GraphMissingContentTypeError when resolved. The scaffold's Mosey Bank demo
// types were deleted from the CMS, so they are intentionally NOT registered.
initContentTypeRegistry([
  BlankExperienceContentType,
  BlankSectionContentType,
  SectionHeadingContentType,
  RichTextBlockContentType,
  HeroBannerContentType,
  HomePageContentType,
  ImageMediaContentType,
]);

initReactComponentRegistry({
  resolver: {
    BlankExperience,
    BlankSection,
    SectionHeading,
    RichTextBlock,
    HeroBanner: Hero,
    HomePage,
    ImageMedia,
  },
});

initDisplayTemplateRegistry([LayoutDisplayTemplate]);

// Display: Fraunces — a characterful, high-contrast serif for luxe editorial headlines.
const displayFont = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
});

// Body: Hanken Grotesk — a clean, modern grotesk for comfortable reading.
const bodyFont = Hanken_Grotesk({
  variable: '--font-hanken',
  subsets: ['latin'],
});

/**
 * Root metadata. The title TEMPLATE comes from global CMS SiteSettings, so every
 * page's title becomes "<page> | <tagline> | <site name>" and the site name is
 * changeable in one publish (no per-page edits). Pages set only their own `title`.
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: {
      template: buildTitleTemplate(settings),
      default: buildTitleDefault(settings),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={[displayFont.variable, bodyFont.variable].join(' ')}>
      <body>{children}</body>
    </html>
  );
}
