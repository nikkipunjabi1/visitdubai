import type { ReactNode } from 'react';

/**
 * Grid — the 12-column editorial grid (4 cols mobile → 8 md → 12 lg),
 * gutters 16px mobile / 24px desktop. Children place themselves with
 * `col-span-*` (asymmetric spans like 7/5, 8/4 encouraged on lg+).
 * See docs/COMPONENT-STANDARDS.md §4.
 */
export function Grid({
  className = '',
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`grid grid-cols-4 gap-4 md:grid-cols-8 md:gap-6 lg:grid-cols-12 ${className}`}>
      {children}
    </div>
  );
}
