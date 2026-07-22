import type { ReactNode } from 'react';

/**
 * Container — centers content at the page max-width (1240px) with responsive
 * side gutters (24 → 40 → 64px). The horizontal spine of the editorial grid.
 * See docs/COMPONENT-STANDARDS.md §4.
 */
export function Container({
  className = '',
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`mx-auto w-full max-w-page px-6 md:px-10 lg:px-16 ${className}`}>
      {children}
    </div>
  );
}
