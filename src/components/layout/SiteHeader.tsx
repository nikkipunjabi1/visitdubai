import Link from 'next/link';
import { Wordmark } from '@/components/ui/Wordmark';

/**
 * SiteHeader — sticky top chrome: the (original) This is Dubai wordmark + primary
 * nav. Nav is data-driven so new sections (Events, Areas…) slot in as they ship.
 */
const NAV: { href: string; label: string }[] = [
  { href: '/', label: 'Home' },
  { href: '/places-to-visit', label: 'Places to Visit' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-page items-center justify-between px-6 py-4 md:px-10 lg:px-16">
        <Link href="/" aria-label="This is Dubai — home" className="transition hover:opacity-80">
          <Wordmark />
        </Link>
        <nav aria-label="Primary">
          <ul className="flex items-center gap-6 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-muted transition hover:text-accent">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
