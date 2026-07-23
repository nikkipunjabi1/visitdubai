import { Grid } from '@/components/ui/Grid';
import { POICard } from './POICard';
import type { PoiCard } from '@/lib/pois';

/**
 * POICardGrid — lays POICards on the 12-col editorial grid: 1-up mobile,
 * 2-up md, 3-up lg (each card spans 4 columns at every breakpoint).
 */
export function POICardGrid({ pois }: { pois: PoiCard[] }) {
  if (pois.length === 0) {
    return (
      <p className="text-muted">No places to show yet. Check back soon.</p>
    );
  }
  return (
    <Grid>
      {pois.map((poi) => (
        <div key={poi.slug || poi.name} className="col-span-4">
          <POICard poi={poi} />
        </div>
      ))}
    </Grid>
  );
}
