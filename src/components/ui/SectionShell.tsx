import type { ReactNode } from 'react';
import { Container } from './Container';

export type SectionTheme = 'inherit' | 'light' | 'dark';
export type SectionWidth = 'contained' | 'full';
export type SectionSpacing = 'none' | 'compact' | 'normal' | 'spacious';

const spacingClass: Record<SectionSpacing, string> = {
  none: 'py-0',
  compact: 'py-8 md:py-12',
  normal: 'py-16 md:py-24',
  spacious: 'py-24 md:py-36',
};

/**
 * SectionShell — the single place theme + width + spacing are applied.
 * `theme` sets `data-theme` (light/dark) so tokens flip for everything inside;
 * `inherit` takes the ancestor/page theme. `width` chooses contained (inside
 * the grid Container) vs full-bleed. Visual Builder display settings map 1:1
 * to these props (layoutProps). Components never hand-roll width/theming.
 * See docs/COMPONENT-STANDARDS.md §3–§4.
 */
export function SectionShell({
  theme = 'inherit',
  width = 'contained',
  spacing = 'normal',
  className = '',
  children,
}: {
  theme?: SectionTheme;
  width?: SectionWidth;
  spacing?: SectionSpacing;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      data-theme={theme === 'inherit' ? undefined : theme}
      className={`bg-bg text-fg ${spacingClass[spacing]} ${className}`}
    >
      {width === 'contained' ? <Container>{children}</Container> : children}
    </section>
  );
}
