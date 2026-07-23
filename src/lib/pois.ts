import { getClient } from '@optimizely/cms-sdk';

/**
 * Data access for PointOfInterest content via Optimizely Graph (published-only,
 * public single key). Guarded so a Graph hiccup / missing key degrades to an
 * empty result instead of crashing a route.
 *
 * URLs are CMS-managed: each POI's `path` is its own `_metadata.url.default`
 * (e.g. "/places-to-visit/burj-al-arab/"), driven by the content tree — cards
 * link straight to it, and the `[...slug]` catch-all renders it via
 * getContentByPath. No URL prefixes are hardcoded here.
 */

export type PoiCard = {
  name: string;
  summary: string | null;
  priceBand: string | null;
  accolades: string[];
  path: string; // e.g. "/places-to-visit/burj-al-arab/"
};

type PoiNode = {
  name?: string | null;
  summary?: string | null;
  priceBand?: string | null;
  accolades?: (string | null)[] | null;
  _metadata?: { url?: { default?: string | null } | null } | null;
};

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
    path: node._metadata?.url?.default ?? '#',
  };
}

const CARD_FIELDS = `name summary priceBand accolades _metadata { url { default } }`;

/** POIs that are children of a given container (a listing page's own key). */
export async function getChildPois(containerKey: string): Promise<PoiCard[]> {
  try {
    const data = (await getClient().request(
      `query($c: String!) {
        PointOfInterest(where: { _metadata: { container: { eq: $c } } }, orderBy: { name: ASC }, limit: 100) {
          items { ${CARD_FIELDS} }
        }
      }`,
      { c: containerKey },
    )) as { PointOfInterest?: { items?: PoiNode[] } };
    return (data?.PointOfInterest?.items ?? []).map(toCard);
  } catch {
    return [];
  }
}

/** All published POIs (used as a fallback / for non-tree listings). */
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
