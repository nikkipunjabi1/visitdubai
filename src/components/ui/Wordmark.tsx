/**
 * Wordmark — the original "This is Dubai" wordmark for this demo. Entirely
 * original branding; not affiliated with, and deliberately distinct from, any
 * official Dubai tourism brand or trademark. Fraunces display + champagne accent.
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
      aria-label="This is Dubai"
      className={`font-display text-2xl leading-none tracking-[-0.015em] ${className}`}
    >
      This is<span className="text-accent">&nbsp;Dubai</span>
    </Tag>
  );
}
