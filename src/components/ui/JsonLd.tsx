/**
 * JsonLd — renders a JSON-LD structured-data block into the server-rendered HTML
 * (initial payload, not client-only), per docs/SEO.md. Pass a schema.org object.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here; we escape `<` to avoid closing the tag early.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
