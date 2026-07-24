import Link from 'next/link';
import { JsonLd } from './JsonLd';
import type { Crumb } from '@/lib/breadcrumbs';

/**
 * Breadcrumbs — the shared trail primitive for every listing + detail page. Renders
 * an accessible <nav>/<ol> (the last item is the current page, marked
 * `aria-current="page"` and not linked) plus `BreadcrumbList` JSON-LD for SEO.
 *
 * Trail data comes from getBreadcrumbs() (CMS tree). Renders nothing for a bare
 * "Home" trail (the home page doesn't need breadcrumbs).
 */
export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  if (crumbs.length <= 1) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      ...(c.url ? { item: c.url } : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-page px-6 pt-8 md:px-10 lg:px-16">
      <JsonLd data={jsonLd} />
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={`${c.name}-${i}`} className="flex items-center gap-x-2">
              {c.url && !last ? (
                <Link href={c.url} className="transition hover:text-accent">
                  {c.name}
                </Link>
              ) : (
                <span aria-current={last ? 'page' : undefined} className={last ? 'text-fg' : undefined}>
                  {c.name}
                </span>
              )}
              {!last ? <span aria-hidden className="text-line">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
