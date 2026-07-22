/**
 * Wordmark — original "Visit Dubai" wordmark for this demo (NOT the official
 * Visit Dubai logo/trademark). Fraunces display with a champagne accent.
 */
export function Wordmark({
  className = '',
  as: Tag = 'span',
}: {
  className?: string;
  as?: 'span' | 'a' | 'div';
}) {
  return (
    <Tag
      aria-label="Visit Dubai"
      className={`font-display text-2xl leading-none tracking-[-0.015em] ${className}`}
    >
      Visit<span className="text-accent">&nbsp;Dubai</span>
    </Tag>
  );
}
