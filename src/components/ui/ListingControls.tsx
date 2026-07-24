import Link from 'next/link';
import { controlHref, type ListingState } from '@/lib/listing-context';
import type { SortKey } from '@/lib/sections';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'A–Z' },
  { key: '-name', label: 'Z–A' },
  { key: 'newest', label: 'Newest' },
];

/**
 * ListingControls — the server-rendered toolbar above a listing grid: a result count
 * and sort links (no client JS; each link is a query-string change). Filters will
 * join this toolbar in a later phase.
 */
export function ListingControls({
  state,
  total,
  activeSort,
}: {
  state: ListingState;
  total: number;
  activeSort: SortKey;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
      <p className="text-sm text-muted">
        <span className="text-fg">{total}</span> {total === 1 ? 'result' : 'results'}
      </p>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted">Sort</span>
        <ul className="flex items-center gap-1">
          {SORTS.map((s) => {
            const active = s.key === activeSort;
            return (
              <li key={s.key}>
                <Link
                  href={controlHref(state, { sort: s.key === 'name' ? null : s.key })}
                  aria-current={active ? 'true' : undefined}
                  className={
                    active
                      ? 'rounded-full border border-accent bg-surface px-3 py-1 font-medium text-accent'
                      : 'rounded-full border border-line px-3 py-1 text-muted transition hover:border-accent hover:text-accent'
                  }
                >
                  {s.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
