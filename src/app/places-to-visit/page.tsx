import type { Metadata } from 'next';
import { SectionShell } from '@/components/ui/SectionShell';
import { POICardGrid } from '@/components/content/POICardGrid';
import { getAllPois } from '@/lib/pois';
import { getSiteSettings, buildContentMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildContentMetadata(
    { metaDescription: 'Explore the best places to visit in Dubai — landmarks, beaches, dining and hidden gems.' },
    settings,
    'Places to Visit',
  );
}

export default async function PlacesToVisitPage() {
  const pois = await getAllPois();

  return (
    <SectionShell theme="dark" spacing="spacious">
      <div className="mx-auto max-w-page px-6 md:px-10 lg:px-16">
        <header className="mb-12 max-w-2xl">
          <p className="eyebrow">Places to Visit</p>
          <h1 className="mt-5 text-[clamp(2.25rem,5vw,3.75rem)]">
            Where Dubai comes to life
          </h1>
          <p className="mt-5 text-lg text-muted">
            From record-breaking landmarks to quiet heritage lanes — a curated guide to the
            city&rsquo;s most memorable places.
          </p>
        </header>
        <POICardGrid pois={pois} />
      </div>
    </SectionShell>
  );
}
