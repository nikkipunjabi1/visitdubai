import { getClient } from '@optimizely/cms-sdk';

/**
 * Data access for PointOfInterest content via Optimizely Graph.
 * Queries use the public single key (published content only) and are guarded so
 * a Graph hiccup / missing key degrades gracefully instead of crashing a route.
 *
 * The "slug" is the CMS route segment, derived from `_metadata.url.default`
 * (e.g. "/burj-khalifa/" → "burj-khalifa"). Detail pages live at
 * /places-to-visit/[slug]; we look content up by that path.
 */

export type PoiCard = {
  name: string;
  summary: string | null;
  priceBand: string | null;
  accolades: string[];
  slug: string;
};

export type PoiDetail = PoiCard & {
  openingHours: string | null;
  latitude: number | null;
  longitude: number | null;
  metaTitle: string | null;
  metaDescription: string | null;
  noindex: boolean | null;
  nofollow: boolean | null;
};

type PoiNode = {
  name?: string | null;
  summary?: string | null;
  priceBand?: string | null;
  accolades?: (string | null)[] | null;
  openingHours?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  noindex?: boolean | null;
  nofollow?: boolean | null;
  _metadata?: { url?: { default?: string | null } | null } | null;
};

/** "/burj-khalifa/" → "burj-khalifa" */
export function slugFromUrl(url: string | null | undefined): string {
  return (url ?? '').replace(/^\/+|\/+$/g, '');
}

/** Human-friendly price label. "free" → "Free"; "$$$" stays as-is. */
export function priceLabel(band: string | null): string | null {
  if (!band) return null;
  return band === 'free' ? 'Free' : band;
}

function toCard(node: PoiNode): PoiCard {
  return {
    name: node.name ?? 'Untitled',
    summary: node.summary ?? null,
    priceBand: node.priceBand ?? null,
    accolades: (node.accolades ?? []).filter((a): a is string => Boolean(a)),
    slug: slugFromUrl(node._metadata?.url?.default),
  };
}

const CARD_FIELDS = `name summary priceBand accolades _metadata { url { default } }`;

export async function getAllPois(): Promise<PoiCard[]> {
  try {
    const data = (await getClient().request(
      `query { PointOfInterest(limit: 100, orderBy: { name: ASC }) { items { ${CARD_FIELDS} } } }`,
      {},
    )) as { PointOfInterest?: { items?: PoiNode[] } };
    return (data?.PointOfInterest?.items ?? []).map(toCard);
  } catch {
    return [];
  }
}

export async function getPoiSlugs(): Promise<string[]> {
  const pois = await getAllPois();
  return pois.map((p) => p.slug).filter(Boolean);
}

export async function getPoiBySlug(slug: string): Promise<PoiDetail | null> {
  try {
    const data = (await getClient().request(
      `query($p: String!) {
        PointOfInterest(where: { _metadata: { url: { default: { eq: $p } } } }, limit: 1) {
          items {
            ${CARD_FIELDS}
            openingHours latitude longitude
            metaTitle metaDescription noindex nofollow
          }
        }
      }`,
      { p: `/${slug}/` },
    )) as { PointOfInterest?: { items?: PoiNode[] } };
    const node = data?.PointOfInterest?.items?.[0];
    if (!node) return null;
    return {
      ...toCard(node),
      openingHours: node.openingHours ?? null,
      latitude: node.latitude ?? null,
      longitude: node.longitude ?? null,
      metaTitle: node.metaTitle ?? null,
      metaDescription: node.metaDescription ?? null,
      noindex: node.noindex ?? null,
      nofollow: node.nofollow ?? null,
    };
  } catch {
    return null;
  }
}
