import Link from 'next/link';
import { pageHref, type ListingState } from '@/lib/listing-context';

/**
 * Pagination — server-rendered, URL-driven page controls (no client JS). Renders a
 * "showing X–Y of T" summary, prev/next, and numbered page links with the current
 * page marked `aria-current`. Links preserve other query params (sort/filters) via
 * pageHref(). Renders nothing when everything fits on one page.
 */
export function Pagination({
  state,
  total,
  pageSize,
}: {
  state: ListingState;
  total: number;
  pageSize: number;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, state.page), pageCount);
  if (pageCount <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  const numberCls =
    'inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-line px-3 text-sm transition hover:border-accent hover:text-accent';
  const arrowCls = `${numberCls} font-medium`;
  const disabledCls = 'inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-line/50 px-3 text-sm text-muted/40';

  return (
    <nav aria-label="Pagination" className="mt-14 flex flex-col items-center gap-4">
      <p className="text-sm text-muted">
        Showing <span className="text-fg">{from}</span>–<span className="text-fg">{to}</span> of{' '}
        <span className="text-fg">{total}</span>
      </p>
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          {page > 1 ? (
            <Link href={pageHref(state, page - 1)} scroll={false} rel="prev" className={arrowCls} aria-label="Previous page">
              ← Prev
            </Link>
          ) : (
            <span className={disabledCls} aria-disabled>← Prev</span>
          )}
        </li>
        {pages.map((p) => (
          <li key={p}>
            {p === page ? (
              <span aria-current="page" className={`${numberCls} border-accent bg-surface font-semibold text-accent`}>
                {p}
              </span>
            ) : (
              <Link href={pageHref(state, p)} scroll={false} className={numberCls} aria-label={`Page ${p}`}>
                {p}
              </Link>
            )}
          </li>
        ))}
        <li>
          {page < pageCount ? (
            <Link href={pageHref(state, page + 1)} scroll={false} rel="next" className={arrowCls} aria-label="Next page">
              Next →
            </Link>
          ) : (
            <span className={disabledCls} aria-disabled>Next →</span>
          )}
        </li>
      </ul>
    </nav>
  );
}
