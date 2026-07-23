import type { Metadata } from 'next';
import { SectionShell } from '@/components/ui/SectionShell';
import { Grid } from '@/components/ui/Grid';
import { Wordmark } from '@/components/ui/Wordmark';

export const metadata: Metadata = {
  title: 'Style Guide — This is Dubai',
  robots: { index: false, follow: false },
};

const palette = [
  { name: 'Obsidian', var: 'bg-obsidian', hex: '#0B0B0D', ring: true },
  { name: 'Ink', var: 'bg-ink', hex: '#16171A', ring: true },
  { name: 'Desert Night', var: 'bg-desert-night', hex: '#12233A', ring: true },
  { name: 'Sand Deep', var: 'bg-sand-deep', hex: '#7A6A4F' },
  { name: 'Champagne', var: 'bg-champagne', hex: '#C9A96A' },
  { name: 'Champagne Hi', var: 'bg-champagne-hi', hex: '#E4CE9E' },
  { name: 'Mist', var: 'bg-mist', hex: '#E7E4DD' },
  { name: 'Porcelain', var: 'bg-porcelain', hex: '#F7F5F1' },
];

function Swatch({ name, hex, className, ring }: { name: string; hex: string; className: string; ring?: boolean }) {
  return (
    <div className="col-span-2 lg:col-span-3">
      <div className={`aspect-[4/3] w-full rounded-lg ${className} ${ring ? 'ring-1 ring-white/10' : 'ring-1 ring-black/10'}`} />
      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-sm">{name}</span>
        <span className="text-xs text-muted tabular-nums">{hex}</span>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full bg-line" />;
}

export default function StyleGuidePage() {
  return (
    <>
      {/* Hero — dark, cinematic */}
      <SectionShell theme="dark" spacing="spacious">
        <p className="eyebrow">This is Dubai · Design System</p>
        <div className="mt-6 flex items-center justify-between">
          <Wordmark className="text-3xl" />
          <span className="text-xs text-muted">v0.1 · sleek-modern-luxury</span>
        </div>
        <h1 className="mt-10 text-[clamp(2.75rem,7vw,6rem)]">
          Where the desert
          <br />
          meets the <span className="text-accent italic">sea</span>.
        </h1>
        <p className="mt-8 max-w-[42ch] text-lg text-muted">
          The visual language for This is Dubai — obsidian &amp; champagne, editorial restraint,
          photography-first. Built to feel crafted, never templated.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a className="rounded-full bg-champagne px-7 py-3 text-sm font-semibold text-obsidian transition hover:bg-champagne-hi">
            Primary action
          </a>
          <a className="rounded-full border border-champagne px-7 py-3 text-sm font-semibold text-champagne transition hover:bg-champagne hover:text-obsidian">
            Secondary
          </a>
        </div>
      </SectionShell>

      {/* Palette — light */}
      <SectionShell theme="light" spacing="normal">
        <p className="eyebrow">Palette</p>
        <h2 className="mt-3 text-4xl">Colour</h2>
        <Grid className="mt-10">
          {palette.map((c) => (
            <Swatch key={c.name} name={c.name} hex={c.hex} className={c.var} ring={c.ring} />
          ))}
        </Grid>
      </SectionShell>

      {/* Typography — dark */}
      <SectionShell theme="dark" spacing="normal">
        <p className="eyebrow">Typography</p>
        <h2 className="mt-3 text-4xl">Fraunces &amp; Hanken Grotesk</h2>
        <div className="mt-10 space-y-8">
          <div className="border-t border-line pt-6">
            <span className="text-xs text-muted">Display / Fraunces</span>
            <p className="font-display text-6xl">A journey worth taking</p>
          </div>
          <div className="border-t border-line pt-6">
            <span className="text-xs text-muted">Heading / Fraunces</span>
            <p className="font-display text-3xl">Neighbourhoods &amp; nightfall</p>
          </div>
          <div className="border-t border-line pt-6">
            <span className="text-xs text-muted">Body / Hanken Grotesk</span>
            <p className="mt-2 max-w-[60ch] text-lg">
              From the gold-lit souks of Deira to the still water of the marina at dawn, discover a
              city that rewards the curious. Comfortable reading measure, generous leading.
            </p>
          </div>
          <div className="border-t border-line pt-6">
            <span className="text-xs text-muted">Eyebrow / kicker</span>
            <p className="eyebrow mt-2">Things to do · Dining · Culture</p>
          </div>
        </div>
      </SectionShell>

      {/* Grid + primitives — light */}
      <SectionShell theme="light" spacing="normal">
        <p className="eyebrow">Layout</p>
        <h2 className="mt-3 text-4xl">12-column editorial grid</h2>
        <Grid className="mt-10">
          <div className="col-span-4 flex h-16 items-center justify-center rounded-md bg-surface text-sm ring-1 ring-black/5 md:col-span-8 lg:col-span-7">
            7 cols
          </div>
          <div className="col-span-4 flex h-16 items-center justify-center rounded-md bg-champagne/15 text-sm ring-1 ring-black/5 lg:col-span-5">
            5 cols
          </div>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="col-span-1 flex h-10 items-center justify-center rounded bg-surface text-[10px] text-muted ring-1 ring-black/5"
            >
              {i + 1}
            </div>
          ))}
        </Grid>
        <div className="mt-10">
          <Divider />
          <p className="mt-4 text-sm text-muted">
            Primitives: <code>&lt;SectionShell&gt;</code> (theme/width/spacing) ·{' '}
            <code>&lt;Container&gt;</code> (max 1240px) · <code>&lt;Grid&gt;</code> (12-col) ·{' '}
            <code>&lt;Wordmark&gt;</code>. Theme + width live on the section; children inherit.
          </p>
        </div>
      </SectionShell>

      {/* Full-bleed demo — dark */}
      <SectionShell theme="dark" width="full" spacing="spacious" className="text-center">
        <p className="eyebrow">width = &quot;full&quot;</p>
        <h2 className="mx-auto mt-4 max-w-[20ch] text-5xl">A full-bleed band, edge to edge.</h2>
      </SectionShell>
    </>
  );
}
