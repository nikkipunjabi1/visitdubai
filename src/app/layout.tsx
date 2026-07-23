import React from 'react';

import { Fraunces, Hanken_Grotesk } from 'next/font/google';
import './globals.css';
import { BlankExperienceContentType, config, initContentTypeRegistry, initDisplayTemplateRegistry } from '@optimizely/cms-sdk';
import { initReactComponentRegistry } from '@optimizely/cms-sdk/react/server';

import Landing, { LandingPageContentType } from '@/components/Landing';
import LandingSection, { LandingSectionContentType, LandingSectionDisplayTemplate } from '@/components/LandingSection';
import SmallFeatureGrid, { SmallFeatureGridContentType } from '@/components/SmallFeatureGrid';
import SmallFeature, { SmallFeatureContentType } from '@/components/SmallFeature';
import VideoFeature, { VideoFeatureContentType } from '@/components/VideoFeature';
import { HeroContentType } from '@/components/Hero';
import Article, { ArticleContentType } from '@/components/Article';
import LandingExperience, { LandingExperienceContentType } from '@/components/LandingExperience';
import CallToAction, { CallToActionContentType } from '@/components/CallToAction';
import BlankSection from '@/components/BlankSection';
import BlogExperience, { BlogExperienceContentType } from '@/components/BlogExperience';
import BlogCard, { BlogCardContentType } from '@/components/BlogCard';
import Banner, { BannerContentType } from '@/components/Banner';
import Tile, {
  SquareTile,
  SquareDisplayTemplate,
  TileColumnDisplayTemplate,
  TileContentType,
  TileRowDisplayTemplate,
} from '@/components/Tile';
import AboutExperience, { AboutExperienceContentType } from '@/components/AboutExperience';
import AboutUs, { AboutUsContentType } from '@/components/AboutUs';
import MonthlySpecial, { MonthlySpecialContentType } from '@/components/MonthlySpecial';
import OfficeLocations, { OfficeContentType } from '@/components/OfficeLocations';
import Location, { LocationContentType } from '@/components/Location';
import BlankExperience from '@/components/BlankExperience';
import FAQ, { FAQContentType } from '@/components/FAQ';

// Visit Dubai Visual Builder blocks (S2.3)
import SectionHeading, { SectionHeadingContentType } from '@/components/blocks/SectionHeading';
import RichTextBlock, { RichTextBlockContentType } from '@/components/blocks/RichTextBlock';
import Hero, { HeroBannerContentType } from '@/components/blocks/Hero';
import { LayoutDisplayTemplate } from '@/components/blocks/LayoutDisplayTemplate';
import HomePage, { HomePageContentType } from '@/components/content/HomePage';
import type { Metadata } from 'next';
import { getSiteSettings, buildTitleTemplate, buildTitleDefault } from '@/lib/seo';

config({
  apiKey: process.env.OPTIMIZELY_GRAPH_SINGLE_KEY || "your api key here",
  graphUrl: process.env.OPTIMIZELY_GRAPH_GATEWAY,
});

initContentTypeRegistry([
  BlankExperienceContentType,
  LandingSectionContentType,
  LandingPageContentType,
  SmallFeatureGridContentType,
  SmallFeatureContentType,
  VideoFeatureContentType,
  HeroContentType,
  ArticleContentType,
  LandingExperienceContentType,
  CallToActionContentType,
  BlogExperienceContentType,
  BlogCardContentType,
  BannerContentType,
  TileContentType,
  AboutExperienceContentType,
  AboutUsContentType,
  MonthlySpecialContentType,
  OfficeContentType,
  LocationContentType,
  BlankExperienceContentType,
  FAQContentType,
  SectionHeadingContentType,
  RichTextBlockContentType,
  HeroBannerContentType,
  HomePageContentType,
]);

initReactComponentRegistry({
  resolver: {
    Landing,
    LandingSection,
    VideoFeature,
    SmallFeatureGrid,
    SmallFeature,
    Article,
    LandingExperience,
    CallToAction,
    BlankSection,
    BlogCard,
    BlogExperience,
    Banner,
    Tile: {
      default: Tile,
      tags: {
        Square: SquareTile,
      },
    },
    AboutExperience,
    AboutUs,
    MonthlySpecial,
    OfficeLocations,
    Location,
    BlankExperience,
    FAQ,
    SectionHeading,
    RichTextBlock,
    HeroBanner: Hero,
    HomePage,
  },
});

initDisplayTemplateRegistry([
  TileRowDisplayTemplate,
  TileColumnDisplayTemplate,
  LandingSectionDisplayTemplate,
  SquareDisplayTemplate,
  LayoutDisplayTemplate,
]);

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
