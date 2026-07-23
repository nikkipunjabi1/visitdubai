// Seed script — creates + publishes starter content in Optimizely SaaS CMS via
// the Content Management API (CMA). Run: `npm run seed` (loads .env).
//
// Auth: OAuth client-credentials (OPTIMIZELY_CMS_CLIENT_ID/SECRET) against the
// SaaS gateway. Flow per item: POST /v1/content (draft) -> publish the version.
// Idempotent: deterministic keys (md5 of slug); an item that already exists
// (409) is skipped, so re-running is safe.
//
// v1 seeds SCALAR + URL fields only (name, summary, geo, priceBand, accolades,
// dates, taxonomy). Relationships (area, categories, images) + rich text come in
// v2 once the reference payload shape is confirmed against a real item.

import { createHash } from 'node:crypto';

const GATEWAY = (process.env.OPTIMIZELY_CMS_API_URL || 'https://api.cms.optimizely.com').replace(/\/$/, '');
const CLIENT_ID = process.env.OPTIMIZELY_CMS_CLIENT_ID;
const CLIENT_SECRET = process.env.OPTIMIZELY_CMS_CLIENT_SECRET;
// Parent container for the seeded content. Defaults to this instance's site root
// (the container of the existing Home experience). Override with SEED_CONTAINER.
const CONTAINER = process.env.SEED_CONTAINER || '43f936c99b234ea397b261c538ad07c9';
const LOCALE = process.env.SEED_LOCALE || 'en';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('✖ Missing OPTIMIZELY_CMS_CLIENT_ID / OPTIMIZELY_CMS_CLIENT_SECRET in the environment.');
  process.exit(1);
}

const keyFor = (slug) => createHash('md5').update(slug).digest('hex');
const S = (value) => ({ value }); // scalar / array / url property (url is written as a plain string)

async function getToken() {
  const res = await fetch(`${GATEWAY}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grant_type: 'client_credentials', client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
  });
  if (!res.ok) throw new Error(`Token request failed: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

async function api(token, method, path, body, extraHeaders = {}) {
  const res = await fetch(`${GATEWAY}/v1${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...extraHeaders },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { status: res.status, json };
}

async function upsert(token, { slug, contentType, routable, displayName, properties }) {
  const key = keyFor(slug);
  const initialVersion = {
    locale: LOCALE,
    displayName,
    ...(routable ? { routeSegment: slug } : {}),
    properties,
  };
  const create = await api(token, 'POST', '/content', { key, contentType, container: CONTAINER, initialVersion });

  if (create.status === 409) {
    console.log(`• ${contentType.padEnd(16)} "${displayName}" — exists, skipping`);
    return;
  }
  if (create.status !== 201) {
    console.log(`✖ ${contentType.padEnd(16)} "${displayName}" — create ${create.status}: ${JSON.stringify(create.json).slice(0, 400)}`);
    return;
  }

  // Publish the freshly-created draft version.
  const versions = await api(token, 'GET', `/content/${key}/versions`);
  const version = versions.json?.items?.[0]?.version;
  if (!version) {
    console.log(`✔ ${contentType.padEnd(16)} "${displayName}" — created (⚠ no version found to publish)`);
    return;
  }
  const pub = await api(token, 'POST', `/content/${key}/versions/${version}:publish`, {});
  const state = pub.status === 200 ? 'published' : `publish ${pub.status}: ${JSON.stringify(pub.json).slice(0, 200)}`;
  console.log(`✔ ${contentType.padEnd(16)} "${displayName}" — created + ${state}`);
}

// ---------------------------------------------------------------------------
// Seed data (royalty-free/factual; real place names used descriptively).
// ---------------------------------------------------------------------------

const areas = [
  { slug: 'downtown-dubai', displayName: 'Downtown Dubai', props: { name: S('Downtown Dubai'), summary: S('The glittering heart of the city — Burj Khalifa, The Dubai Fountain and the Dubai Mall.'), latitude: S(25.1972), longitude: S(55.2744) } },
  { slug: 'dubai-marina', displayName: 'Dubai Marina', props: { name: S('Dubai Marina'), summary: S('A waterfront district of skyscrapers, promenades and yacht-lined canals.'), latitude: S(25.0805), longitude: S(55.1403) } },
  { slug: 'old-dubai', displayName: 'Old Dubai', props: { name: S('Old Dubai'), summary: S('Deira and Bur Dubai — historic souks, the Creek and traditional abra crossings.'), latitude: S(25.2697), longitude: S(55.3094) } },
];

const categories = [
  { slug: 'landmarks', displayName: 'Landmarks', props: { name: S('Landmarks'), slug: S('landmarks'), dimension: S('theme'), description: S('Iconic sights and must-see attractions.'), synonyms: S(['icon', 'attraction', 'must-see']), featured: S(true), icon: S('🏙️') } },
  { slug: 'fine-dining', displayName: 'Fine Dining', props: { name: S('Fine Dining'), slug: S('fine-dining'), dimension: S('cuisine'), description: S('High-end and award-winning restaurants.'), synonyms: S(['Michelin', 'haute cuisine', 'gourmet', 'starred']), featured: S(true), icon: S('🍽️') } },
  { slug: 'beaches', displayName: 'Beaches', props: { name: S('Beaches'), slug: S('beaches'), dimension: S('theme'), description: S('Sun, sand and the Arabian Gulf.'), synonyms: S(['waterfront', 'sea', 'coast']), featured: S(true), icon: S('🏖️') } },
  { slug: 'culture-heritage', displayName: 'Culture & Heritage', props: { name: S('Culture & Heritage'), slug: S('culture-heritage'), dimension: S('interest'), description: S('History, museums and Emirati tradition.'), synonyms: S(['history', 'museum', 'tradition', 'heritage']), icon: S('🕌') } },
  { slug: 'family', displayName: 'Family', props: { name: S('Family'), slug: S('family'), dimension: S('audience'), description: S('Great for kids and families.'), synonyms: S(['kids', 'children', 'family-friendly']), icon: S('👨‍👩‍👧') } },
  { slug: 'luxury', displayName: 'Luxury', props: { name: S('Luxury'), slug: S('luxury'), dimension: S('theme'), description: S('Premium, five-star and exclusive experiences.'), synonyms: S(['premium', 'five-star', 'exclusive', 'VIP']), featured: S(true), icon: S('✨') } },
];

const pois = [
  { slug: 'burj-khalifa', displayName: 'Burj Khalifa', props: { name: S('Burj Khalifa'), summary: S('The world’s tallest building, soaring 828m above Downtown Dubai.'), latitude: S(25.197197), longitude: S(55.274376), priceBand: S('$$$'), accolades: S(['Tallest building in the world']), openingHours: S('Daily 09:00–23:00') } },
  { slug: 'the-dubai-fountain', displayName: 'The Dubai Fountain', props: { name: S('The Dubai Fountain'), summary: S('A choreographed water, light and music spectacle on the Burj Lake.'), latitude: S(25.1955), longitude: S(55.2764), priceBand: S('free'), accolades: S(['One of the world’s largest choreographed fountains']), openingHours: S('Shows every 30 min, 18:00–23:00') } },
  { slug: 'dubai-mall', displayName: 'The Dubai Mall', props: { name: S('The Dubai Mall'), summary: S('One of the world’s largest malls — retail, aquarium, ice rink and more.'), latitude: S(25.1972), longitude: S(55.2796), priceBand: S('free'), openingHours: S('Daily 10:00–24:00') } },
  { slug: 'burj-al-arab', displayName: 'Burj Al Arab', props: { name: S('Burj Al Arab'), summary: S('The sail-shaped icon of Jumeirah, among the world’s most luxurious hotels.'), latitude: S(25.1412), longitude: S(55.1853), priceBand: S('$$$$'), accolades: S(['Iconic sail-shaped landmark']) } },
  { slug: 'palm-jumeirah', displayName: 'Palm Jumeirah', props: { name: S('Palm Jumeirah'), summary: S('The palm-shaped archipelago of beaches, resorts and the Atlantis.'), latitude: S(25.1124), longitude: S(55.139), priceBand: S('free') } },
  { slug: 'dubai-marina-walk', displayName: 'Dubai Marina Walk', props: { name: S('Dubai Marina Walk'), summary: S('A 7km waterfront promenade of cafés, dining and yacht views.'), latitude: S(25.0805), longitude: S(55.1403), priceBand: S('free'), openingHours: S('Open 24 hours') } },
  { slug: 'museum-of-the-future', displayName: 'Museum of the Future', props: { name: S('Museum of the Future'), summary: S('An award-winning museum of innovation inside a striking calligraphy-clad torus.'), latitude: S(25.2197), longitude: S(55.2820), priceBand: S('$$$'), accolades: S(['Award-winning architecture']), openingHours: S('Daily 10:00–19:30') } },
  { slug: 'al-fahidi-neighbourhood', displayName: 'Al Fahidi Historical Neighbourhood', props: { name: S('Al Fahidi Historical Neighbourhood'), summary: S('Wind-tower houses and galleries in one of Dubai’s oldest districts.'), latitude: S(25.2637), longitude: S(55.2996), priceBand: S('free'), openingHours: S('Open 24 hours') } },
  { slug: 'gold-souk', displayName: 'Gold Souk', props: { name: S('Gold Souk'), summary: S('Deira’s legendary market glittering with gold, jewellery and trade.'), latitude: S(25.2716), longitude: S(55.2971), priceBand: S('free'), openingHours: S('Sat–Thu 10:00–22:00') } },
  { slug: 'jumeirah-beach', displayName: 'Jumeirah Beach', props: { name: S('Jumeirah Beach'), summary: S('A long stretch of white sand with skyline and Burj Al Arab views.'), latitude: S(25.2048), longitude: S(55.2708), priceBand: S('free'), openingHours: S('Open 24 hours') } },
];

const events = [
  { slug: 'dubai-shopping-festival', displayName: 'Dubai Shopping Festival', props: { name: S('Dubai Shopping Festival'), summary: S('The city’s flagship retail, entertainment and fireworks festival.'), startDate: S('2026-12-15T00:00:00Z'), endDate: S('2027-01-29T00:00:00Z'), ticketUrl: S('https://www.visitdubai.com/') } },
  { slug: 'dubai-food-festival', displayName: 'Dubai Food Festival', props: { name: S('Dubai Food Festival'), summary: S('A city-wide celebration of Dubai’s diverse culinary scene.'), startDate: S('2027-02-20T00:00:00Z'), endDate: S('2027-03-08T00:00:00Z') } },
  { slug: 'dubai-world-cup', displayName: 'Dubai World Cup', props: { name: S('Dubai World Cup'), summary: S('The world’s richest horse-racing day at Meydan Racecourse.'), startDate: S('2027-03-27T00:00:00Z') } },
];

async function main() {
  console.log(`Seeding → ${GATEWAY} (container ${CONTAINER}, locale ${LOCALE})\n`);
  const token = await getToken();

  for (const a of areas) await upsert(token, { slug: a.slug, contentType: 'Area', routable: true, displayName: a.displayName, properties: a.props });
  for (const c of categories) await upsert(token, { slug: c.slug, contentType: 'Category', routable: false, displayName: c.displayName, properties: c.props });
  for (const p of pois) await upsert(token, { slug: p.slug, contentType: 'PointOfInterest', routable: true, displayName: p.displayName, properties: p.props });
  for (const e of events) await upsert(token, { slug: e.slug, contentType: 'Event', routable: true, displayName: e.displayName, properties: e.props });

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
