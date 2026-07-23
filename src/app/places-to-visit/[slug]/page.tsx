import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SectionShell } from '@/components/ui/SectionShell';
import { JsonLd } from '@/components/ui/JsonLd';
import { getPoiBySlug, getPoiSlugs, priceLabel } from '@/lib/pois';
import { getSiteSettings, buildContentMetadata } from '@/lib/seo';

type Props = { params: Promise<{ slug: string }> };

// Pre-render a static page per POI (SSG). New POIs are picked up on redeploy /
// on-demand revalidation.
export async function generateStaticParams() {
  const slugs = await getPoiSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [poi, settings] = await Promise.all([getPoiBySlug(slug), getSiteSettings()]);
  if (!poi) return { title: 'Not found' };
  return buildContentMetadata(poi, settings, poi.name);
}

export default async function PoiDetailPage({ params }: Props) {
  const { slug } = await params;
  const poi = await getPoiBySlug(slug);
  if (!poi) notFound();

  const price = priceLabel(poi.priceBand);
  const hasGeo = poi.latitude != null && poi.longitude != null;
  const mapUrl = hasGeo
    ? `https://www.google.com/maps/search/?api=1&query=${poi.latitude},${poi.longitude}`
    : null;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: poi.name,
    ...(poi.summary ? { description: poi.summary } : {}),
    ...(hasGeo
      ? { geo: { '@type': 'GeoCoordinates', latitude: poi.latitude, longitude: poi.longitude } }
      : {}),
  };

  return (
    <SectionShell theme="dark" spacing="spacious">
      <JsonLd data={jsonLd} />
      <article className="mx-auto max-w-page px-6 md:px-10 lg:px-16">
        <Link href="/places-to-visit" className="text-sm text-accent hover:underline">
          ← Places to Visit
        </Link>

        <header className="mt-6 max-w-3xl">
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)]">{poi.name}</h1>
          {poi.summary ? <p className="mt-6 text-xl text-muted">{poi.summary}</p> : null}
        </header>

        {poi.accolades.length > 0 ? (
          <ul className="mt-8 flex flex-wrap gap-2">
            {poi.accolades.map((a) => (
              <li
                key={a}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-sm text-accent"
              >
                <span aria-hidden>★</span>
                {a}
              </li>
            ))}
          </ul>
        ) : null}

        <dl className="mt-10 grid max-w-xl grid-cols-1 gap-x-8 gap-y-4 border-t border-line pt-8 sm:grid-cols-2">
          {price ? (
            <div>
              <dt className="eyebrow">Price</dt>
              <dd className="mt-1 text-lg">{price}</dd>
            </div>
          ) : null}
          {poi.openingHours ? (
            <div>
              <dt className="eyebrow">Opening hours</dt>
              <dd className="mt-1 text-lg">{poi.openingHours}</dd>
            </div>
          ) : null}
          {mapUrl ? (
            <div>
              <dt className="eyebrow">Location</dt>
              <dd className="mt-1 text-lg">
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  View on map →
                </a>
              </dd>
            </div>
          ) : null}
        </dl>
      </article>
    </SectionShell>
  );
}
