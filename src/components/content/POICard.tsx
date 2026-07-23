import Link from 'next/link';
import { type PoiCard, priceLabel } from '@/lib/pois';

/**
 * POICard — an editorial, image-optional card for a Point of Interest.
 * Until images are seeded (v2), a gradient "monogram" band gives each card
 * visual weight; the image slots in here later. Content-first: name, summary,
 * price band + a lead accolade. The whole card links to the detail page.
 */
export function POICard({ poi }: { poi: PoiCard }) {
  const price = priceLabel(poi.priceBand);
  const initial = poi.name.charAt(0).toUpperCase();
  const lead = poi.accolades[0];

  return (
    <Link
      href={`/places-to-visit/${poi.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface transition duration-300 hover:-translate-y-1 hover:border-accent focus-visible:-translate-y-1 focus-visible:border-accent focus-visible:outline-none"
    >
      {/* Gradient placeholder band (image goes here in v2). */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-desert-night to-obsidian">
        <span
          aria-hidden
          className="absolute inset-0 grid place-content-center font-display text-[5rem] leading-none text-champagne/15 transition duration-500 group-hover:scale-110 group-hover:text-champagne/25"
        >
          {initial}
        </span>
        {price ? (
          <span className="absolute left-3 top-3 rounded-full bg-obsidian/70 px-3 py-1 text-xs font-semibold text-champagne backdrop-blur">
            {price}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-2xl">{poi.name}</h3>
        {poi.summary ? (
          <p className="line-clamp-2 text-sm text-muted">{poi.summary}</p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          {lead ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-xs text-accent">
              <span aria-hidden>★</span>
              <span className="line-clamp-1">{lead}</span>
            </span>
          ) : (
            <span />
          )}
          <span className="shrink-0 text-sm font-medium text-accent transition group-hover:translate-x-0.5">
            Explore →
          </span>
        </div>
      </div>
    </Link>
  );
}
