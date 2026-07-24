import { getClient } from '@optimizely/cms-sdk';

/**
 * Generic "children of a section page" queries for the listing pattern. Each
 * section page (Neighbourhoods, Events…) renders its child content as cards; we
 * query by the page's own key (`_metadata.container`). Guarded so a Graph hiccup
 * degrades to an empty list. URLs are CMS-driven (`_metadata.url.default`).
 */
export type SectionCardItem = {
  name: string;
  summary: string | null;
  path: string;
  meta: string | null; // small contextual line (e.g. an event date range)
};

type Node = {
  name?: string | null;
  summary?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  _metadata?: { url?: { default?: string | null } | null } | null;
};

function toCard(node: Node, meta: string | null = null): SectionCardItem {
  return {
    name: node.name ?? 'Untitled',
    summary: node.summary ?? null,
    path: node._metadata?.url?.default ?? '#',
    meta,
  };
}

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

function eventMeta(node: Node): string | null {
  const start = fmtDate(node.startDate);
  if (!start) return null;
  const end = fmtDate(node.endDate);
  return end && end !== start ? `${start} – ${end}` : start;
}

export async function getChildAreas(containerKey: string): Promise<SectionCardItem[]> {
  try {
    const data = (await getClient().request(
      `query($c: String!) {
        Area(where: { _metadata: { container: { eq: $c } } }, orderBy: { name: ASC }, limit: 100) {
          items { name summary _metadata { url { default } } }
        }
      }`,
      { c: containerKey },
    )) as { Area?: { items?: Node[] } };
    return (data?.Area?.items ?? []).map((n) => toCard(n));
  } catch {
    return [];
  }
}

export async function getChildEvents(containerKey: string): Promise<SectionCardItem[]> {
  try {
    const data = (await getClient().request(
      `query($c: String!) {
        Event(where: { _metadata: { container: { eq: $c } } }, orderBy: { startDate: ASC }, limit: 100) {
          items { name summary startDate endDate _metadata { url { default } } }
        }
      }`,
      { c: containerKey },
    )) as { Event?: { items?: Node[] } };
    return (data?.Event?.items ?? []).map((n) => toCard(n, eventMeta(n)));
  } catch {
    return [];
  }
}

type AnyChild = Node & { priceBand?: string | null; _metadata?: { url?: { default?: string | null } | null; displayName?: string | null; types?: string[] | null } | null };

const priceMeta = (band?: string | null) => (band && band !== 'free' ? band : band === 'free' ? 'Free' : null);

/**
 * Generic children query for the SectionListing block — one engine for ALL section
 * pages (Places to Visit, Neighbourhoods, Events). Uses inline fragments so each
 * child type contributes its own fields (POI price, Event dates) while sharing one
 * card. Ordered by name. Guarded → empty list on error.
 */
export async function getSectionChildren(containerKey: string): Promise<SectionCardItem[]> {
  try {
    const data = (await getClient().request(
      `query($c: String!) {
        _Page(where: { _metadata: { container: { eq: $c } } }, limit: 100) {
          items {
            _metadata { displayName url { default } types }
            ... on PointOfInterest { name summary priceBand }
            ... on Area { name summary }
            ... on Event { name summary startDate endDate }
          }
        }
      }`,
      { c: containerKey },
    )) as { _Page?: { items?: AnyChild[] } };
    return (data?._Page?.items ?? [])
      .map((n) => {
        const isEvent = n._metadata?.types?.includes('Event');
        const meta = isEvent ? eventMeta(n) : priceMeta(n.priceBand);
        return toCard({ ...n, name: n.name ?? n._metadata?.displayName ?? 'Untitled' }, meta);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}
