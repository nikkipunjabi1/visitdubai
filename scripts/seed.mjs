// Seed script — creates + publishes starter content in Optimizely SaaS CMS via
// the Content Management API (CMA). Run: `npm run seed` (loads .env).
//
// Auth: OAuth client-credentials (OPTIMIZELY_CMS_CLIENT_ID/SECRET) against the
// SaaS gateway. Flow per item: POST /v1/content (draft) -> publish the version.
// Idempotent: deterministic keys (md5 of slug); an item that already exists
// (409) is skipped, or (for re-parented items) PATCHed to its new container.
//
// Content tree (CMS-managed URLs):
//   Home (/)
//   └─ Places to Visit (/places-to-visit)        [PlacesToVisitPage]
//      └─ <PointOfInterest>  (/places-to-visit/<slug>)
// Areas/Categories/Events currently sit under the root; they get their own
// dedicated section pages when those listings are built.
//
// v1 seeds SCALAR + URL fields only; relationships (area, categories), images
// and rich text come in v2 once the reference write-shapes are confirmed.

import { createHash } from 'node:crypto';

const GATEWAY = (process.env.OPTIMIZELY_CMS_API_URL || 'https://api.cms.optimizely.com').replace(/\/$/, '');
const CLIENT_ID = process.env.OPTIMIZELY_CMS_CLIENT_ID;
const CLIENT_SECRET = process.env.OPTIMIZELY_CMS_CLIENT_SECRET;
// Site root (container of the existing Home experience). Root-level pages route
// from "/", so a page here gets /{routeSegment}/.
const ROOT = process.env.SEED_CONTAINER || '43f936c99b234ea397b261c538ad07c9';
const HOME = process.env.SEED_HOME || '71792f1b444e4d6d9a77c41c47c4cf7e';
const LOCALE = process.env.SEED_LOCALE || 'en';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('✖ Missing OPTIMIZELY_CMS_CLIENT_ID / OPTIMIZELY_CMS_CLIENT_SECRET in the environment.');
  process.exit(1);
}

const keyFor = (slug) => createHash('md5').update(slug).digest('hex');
const S = (value) => ({ value }); // scalar / array / url property (url written as a plain string)
// Content references are written as "cms://content/<key>" strings.
const REF = (slug) => ({ value: `cms://content/${keyFor(slug)}` });
const REFS = (slugs) => ({ value: slugs.map((s) => `cms://content/${keyFor(s)}`) });
// Tags use a namespaced key ("tag:<slug>") so they don't collide with the deleted
// (trashed) legacy Category items, whose keys were md5(<slug>).
const tagKey = (slug) => keyFor(`tag:${slug}`);
const TAGREFS = (slugs) => ({ value: slugs.map((s) => `cms://content/${tagKey(s)}`) });
const PLACES_KEY = keyFor('places-to-visit');
const NEIGHBOURHOODS_KEY = keyFor('neighbourhoods');
const EVENTS_KEY = keyFor('events');

async function getToken() {
  const res = await fetch(`${GATEWAY}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grant_type: 'client_credentials', client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
  });
  if (!res.ok) throw new Error(`Token request failed: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(token, method, path, body, extraHeaders = {}, attempt = 1) {
  const res = await fetch(`${GATEWAY}/v1${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...extraHeaders },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  // The CMA rate-limits bursts (429). Back off and retry so the seed self-throttles.
  if (res.status === 429 && attempt <= 6) {
    await sleep(1500 * attempt);
    return api(token, method, path, body, extraHeaders, attempt + 1);
  }
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { status: res.status, json };
}

async function publishLatest(token, key, label) {
  const versions = await api(token, 'GET', `/content/${key}/versions`);
  const version = versions.json?.items?.[0]?.version;
  if (!version) return `⚠ no version to publish`;
  const pub = await api(token, 'POST', `/content/${key}/versions/${version}:publish`, {});
  // Publish succeeds with 204 (No Content) or 200.
  return pub.status === 204 || pub.status === 200
    ? 'published'
    : `publish ${pub.status}: ${JSON.stringify(pub.json).slice(0, 160)}`;
}

async function upsert(token, { slug, key: providedKey, contentType, container, routable, displayName, properties, reparent }) {
  const key = providedKey || keyFor(slug);
  const version = { locale: LOCALE, displayName, ...(routable ? { routeSegment: slug } : {}), properties };
  const create = await api(token, 'POST', '/content', { key, contentType, container, initialVersion: version });

  if (create.status === 201) {
    const state = await publishLatest(token, key);
    console.log(`✔ ${contentType.padEnd(18)} "${displayName}" — created + ${state}`);
    return;
  }
  if (create.status === 409) {
    // Already exists → make it current: (optionally) re-parent, then write a fresh
    // version with the full properties (adds new fields like references) and publish.
    if (reparent && container) {
      await api(token, 'PATCH', `/content/${key}`, { container }, { 'Content-Type': 'application/merge-patch+json' });
    }
    const nv = await api(token, 'POST', `/content/${key}/versions`, version);
    if (nv.status !== 201 && nv.status !== 200) {
      console.log(`✖ ${contentType.padEnd(18)} "${displayName}" — new version ${nv.status}: ${JSON.stringify(nv.json).slice(0, 300)}`);
      return;
    }
    const state = await publishLatest(token, key);
    console.log(`↻ ${contentType.padEnd(18)} "${displayName}" — updated + ${state}`);
    return;
  }
  console.log(`✖ ${contentType.padEnd(18)} "${displayName}" — create ${create.status}: ${JSON.stringify(create.json).slice(0, 400)}`);
}

// ---------------------------------------------------------------------------
// Seed data (royalty-free/factual; real place names used descriptively).
// ---------------------------------------------------------------------------

// Section pages live UNDER Home (the site root) → /<segment>. Home.mayContainTypes
// allows them. Their children (POIs, Areas, Events) nest under them.
const listingPages = [
  {
    slug: 'places-to-visit',
    contentType: 'PlacesToVisitPage',
    container: HOME,
    displayName: 'Places to Visit',
    properties: {
      heading: S('Where Dubai comes to life'),
      intro: S('From record-breaking landmarks to quiet heritage lanes — a curated guide to the city’s most memorable places.'),
      metaDescription: S('Explore the best places to visit in Dubai — landmarks, beaches, dining and hidden gems.'),
    },
  },
  {
    slug: 'neighbourhoods',
    contentType: 'NeighbourhoodsPage',
    container: HOME,
    displayName: 'Neighbourhoods',
    properties: {
      heading: S('Every district has a story'),
      intro: S('From Downtown’s skyline to Old Dubai’s souks — explore the city one neighbourhood at a time.'),
      metaDescription: S('Explore Dubai’s neighbourhoods — Downtown, Marina, Old Dubai and beyond.'),
    },
  },
  {
    slug: 'events',
    contentType: 'EventsPage',
    container: HOME,
    displayName: 'Events',
    properties: {
      heading: S('What’s on in Dubai'),
      intro: S('Festivals, races and seasonal celebrations across the city — plan your visit around the moments that matter.'),
      metaDescription: S('What’s on in Dubai — festivals, events and seasonal highlights.'),
    },
  },
];

const areas = [
  { slug: 'downtown-dubai', displayName: 'Downtown Dubai', props: { name: S('Downtown Dubai'), summary: S('The glittering heart of the city — Burj Khalifa, The Dubai Fountain and the Dubai Mall.'), latitude: S(25.1972), longitude: S(55.2744) } },
  { slug: 'dubai-marina', displayName: 'Dubai Marina', props: { name: S('Dubai Marina'), summary: S('A waterfront district of skyscrapers, promenades and yacht-lined canals.'), latitude: S(25.0805), longitude: S(55.1403) } },
  { slug: 'old-dubai', displayName: 'Old Dubai', props: { name: S('Old Dubai'), summary: S('Deira and Bur Dubai — historic souks, the Creek and traditional abra crossings.'), latitude: S(25.2697), longitude: S(55.3094) } },
];

const tags = [
  { slug: 'landmarks', displayName: 'Landmarks', props: { name: S('Landmarks'), slug: S('landmarks'), dimension: S('theme'), description: S('Iconic sights and must-see attractions.'), synonyms: S(['icon', 'attraction', 'must-see']), featured: S(true), icon: S('🏙️') } },
  { slug: 'fine-dining', displayName: 'Fine Dining', props: { name: S('Fine Dining'), slug: S('fine-dining'), dimension: S('cuisine'), description: S('High-end and award-winning restaurants.'), synonyms: S(['Michelin', 'haute cuisine', 'gourmet', 'starred']), featured: S(true), icon: S('🍽️') } },
  { slug: 'beaches', displayName: 'Beaches', props: { name: S('Beaches'), slug: S('beaches'), dimension: S('theme'), description: S('Sun, sand and the Arabian Gulf.'), synonyms: S(['waterfront', 'sea', 'coast']), featured: S(true), icon: S('🏖️') } },
  { slug: 'culture-heritage', displayName: 'Culture & Heritage', props: { name: S('Culture & Heritage'), slug: S('culture-heritage'), dimension: S('interest'), description: S('History, museums and Emirati tradition.'), synonyms: S(['history', 'museum', 'tradition', 'heritage']), icon: S('🕌') } },
  { slug: 'family', displayName: 'Family', props: { name: S('Family'), slug: S('family'), dimension: S('audience'), description: S('Great for kids and families.'), synonyms: S(['kids', 'children', 'family-friendly']), icon: S('👨‍👩‍👧') } },
  { slug: 'luxury', displayName: 'Luxury', props: { name: S('Luxury'), slug: S('luxury'), dimension: S('theme'), description: S('Premium, five-star and exclusive experiences.'), synonyms: S(['premium', 'five-star', 'exclusive', 'VIP']), featured: S(true), icon: S('✨') } },
  { slug: 'festivals', displayName: 'Festivals', props: { name: S('Festivals'), slug: S('festivals'), dimension: S('eventType'), description: S('City-wide festivals and seasonal celebrations.'), synonyms: S(['festival', 'celebration', 'seasonal']), featured: S(true), icon: S('🎉') } },
];

const pois = [
  { slug: 'burj-khalifa', displayName: 'Burj Khalifa', props: { name: S('Burj Khalifa'), summary: S('The world’s tallest building, soaring 828m above Downtown Dubai.'), latitude: S(25.197197), longitude: S(55.274376), priceBand: S('$$$'), accolades: S(['Tallest building in the world']), openingHours: S('Daily 09:00–23:00'), area: REF('downtown-dubai'), tags: TAGREFS(['landmarks', 'luxury']) } },
  { slug: 'the-dubai-fountain', displayName: 'The Dubai Fountain', props: { name: S('The Dubai Fountain'), summary: S('A choreographed water, light and music spectacle on the Burj Lake.'), latitude: S(25.1955), longitude: S(55.2764), priceBand: S('free'), accolades: S(['One of the world’s largest choreographed fountains']), openingHours: S('Shows every 30 min, 18:00–23:00'), area: REF('downtown-dubai'), tags: TAGREFS(['landmarks', 'family']) } },
  { slug: 'dubai-mall', displayName: 'The Dubai Mall', props: { name: S('The Dubai Mall'), summary: S('One of the world’s largest malls — retail, aquarium, ice rink and more.'), latitude: S(25.1972), longitude: S(55.2796), priceBand: S('free'), openingHours: S('Daily 10:00–24:00'), area: REF('downtown-dubai'), tags: TAGREFS(['landmarks', 'family']) } },
  { slug: 'burj-al-arab', displayName: 'Burj Al Arab', props: { name: S('Burj Al Arab'), summary: S('The sail-shaped icon of Jumeirah, among the world’s most luxurious hotels.'), latitude: S(25.1412), longitude: S(55.1853), priceBand: S('$$$$'), accolades: S(['Iconic sail-shaped landmark']), area: REF('dubai-marina'), tags: TAGREFS(['luxury', 'landmarks']) } },
  { slug: 'palm-jumeirah', displayName: 'Palm Jumeirah', props: { name: S('Palm Jumeirah'), summary: S('The palm-shaped archipelago of beaches, resorts and the Atlantis.'), latitude: S(25.1124), longitude: S(55.139), priceBand: S('free'), area: REF('dubai-marina'), tags: TAGREFS(['beaches', 'luxury']) } },
  { slug: 'dubai-marina-walk', displayName: 'Dubai Marina Walk', props: { name: S('Dubai Marina Walk'), summary: S('A 7km waterfront promenade of cafés, dining and yacht views.'), latitude: S(25.0805), longitude: S(55.1403), priceBand: S('free'), openingHours: S('Open 24 hours'), area: REF('dubai-marina'), tags: TAGREFS(['beaches', 'family']) } },
  { slug: 'museum-of-the-future', displayName: 'Museum of the Future', props: { name: S('Museum of the Future'), summary: S('An award-winning museum of innovation inside a striking calligraphy-clad torus.'), latitude: S(25.2197), longitude: S(55.2820), priceBand: S('$$$'), accolades: S(['Award-winning architecture']), openingHours: S('Daily 10:00–19:30'), area: REF('downtown-dubai'), tags: TAGREFS(['landmarks', 'culture-heritage']) } },
  { slug: 'al-fahidi-neighbourhood', displayName: 'Al Fahidi Historical Neighbourhood', props: { name: S('Al Fahidi Historical Neighbourhood'), summary: S('Wind-tower houses and galleries in one of Dubai’s oldest districts.'), latitude: S(25.2637), longitude: S(55.2996), priceBand: S('free'), openingHours: S('Open 24 hours'), area: REF('old-dubai'), tags: TAGREFS(['culture-heritage']) } },
  { slug: 'gold-souk', displayName: 'Gold Souk', props: { name: S('Gold Souk'), summary: S('Deira’s legendary market glittering with gold, jewellery and trade.'), latitude: S(25.2716), longitude: S(55.2971), priceBand: S('free'), openingHours: S('Sat–Thu 10:00–22:00'), area: REF('old-dubai'), tags: TAGREFS(['culture-heritage', 'family']) } },
  { slug: 'jumeirah-beach', displayName: 'Jumeirah Beach', props: { name: S('Jumeirah Beach'), summary: S('A long stretch of white sand with skyline and Burj Al Arab views.'), latitude: S(25.2048), longitude: S(55.2708), priceBand: S('free'), openingHours: S('Open 24 hours'), area: REF('dubai-marina'), tags: TAGREFS(['beaches', 'family']) } },
];

const events = [
  { slug: 'dubai-shopping-festival', displayName: 'Dubai Shopping Festival', props: { name: S('Dubai Shopping Festival'), summary: S('The city’s flagship retail, entertainment and fireworks festival.'), startDate: S('2026-12-15T00:00:00Z'), endDate: S('2027-01-29T00:00:00Z'), ticketUrl: S('https://www.dubai.com/'), tags: TAGREFS(['festivals']) } },
  { slug: 'dubai-food-festival', displayName: 'Dubai Food Festival', props: { name: S('Dubai Food Festival'), summary: S('A city-wide celebration of Dubai’s diverse culinary scene.'), startDate: S('2027-02-20T00:00:00Z'), endDate: S('2027-03-08T00:00:00Z'), tags: TAGREFS(['festivals']) } },
  { slug: 'dubai-world-cup', displayName: 'Dubai World Cup', props: { name: S('Dubai World Cup'), summary: S('The world’s richest horse-racing day at Meydan Racecourse.'), startDate: S('2027-03-27T00:00:00Z') } },
];

async function main() {
  console.log(`Seeding → ${GATEWAY} (locale ${LOCALE})\n`);
  const token = await getToken();

  for (const p of listingPages) await upsert(token, { slug: p.slug, contentType: p.contentType, container: p.container, routable: true, displayName: p.displayName, properties: p.properties, reparent: true });
  for (const a of areas) await upsert(token, { slug: a.slug, contentType: 'Area', container: NEIGHBOURHOODS_KEY, routable: true, displayName: a.displayName, properties: a.props, reparent: true });
  for (const t of tags) await upsert(token, { slug: t.slug, key: tagKey(t.slug), contentType: 'Tag', container: HOME, routable: true, displayName: t.displayName, properties: t.props });
  // POIs live under Places to Visit → /places-to-visit/<slug>. reparent moves any already-seeded (flat) POIs.
  for (const p of pois) await upsert(token, { slug: p.slug, contentType: 'PointOfInterest', container: PLACES_KEY, routable: true, displayName: p.displayName, properties: p.props, reparent: true });
  for (const e of events) await upsert(token, { slug: e.slug, contentType: 'Event', container: EVENTS_KEY, routable: true, displayName: e.displayName, properties: e.props, reparent: true });

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
