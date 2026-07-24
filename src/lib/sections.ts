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
