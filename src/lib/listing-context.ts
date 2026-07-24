import { cache } from 'react';

/**
 * Request-scoped listing state (page — later: sort, filters). WHY this exists:
 * the section pages are Visual Builder experiences, so the listing renders as the
 * `SectionListing` block DEEP inside the composition, where Next.js `searchParams`
 * don't reach. The route ([...slug]/page.tsx) is the only place with searchParams,
 * so it seeds this store and the block reads it.
 *
 * React `cache()` scopes the object to a single request/render (a fresh object per
 * request), so there's no cross-request leakage. This keeps pagination 100%
 * server-rendered and URL-driven (no client JS), per docs/LISTING-PATTERN.md §2.
 */
export type ListingState = {
  page: number;
  /** The current page's path (e.g. "/places-to-visit"), for building pagination hrefs. */
  path: string;
  /** Other query params to preserve on pagination links (sort, filters…). Excludes `page`. */
  query: Record<string, string>;
};

const store = cache((): ListingState => ({ page: 1, path: '/', query: {} }));

/** Seed the listing state from the route. Call once per request in the page component. */
export function seedListingState(state: Partial<ListingState>): void {
  Object.assign(store(), state);
}

/** Read the current request's listing state (from the SectionListing block). */
export function getListingState(): ListingState {
  return store();
}

/** Build a pagination href for `targetPage`, preserving other query params. */
export function pageHref(state: ListingState, targetPage: number): string {
  const params = new URLSearchParams(state.query);
  if (targetPage <= 1) params.delete('page');
  else params.set('page', String(targetPage));
  const qs = params.toString();
  return qs ? `${state.path}?${qs}` : state.path;
}
