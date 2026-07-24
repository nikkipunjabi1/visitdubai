// ONE-TIME migration: convert the section listing pages from the old `_page`
// types (PlacesToVisitPage / NeighbourhoodsPage / EventsPage) to Visual Builder
// `_experience` types (PlacesToVisit / Neighbourhoods / Events).
//
// Per section: create the new experience under Home with a seeded canvas
// (Section Heading + Section Listing block) → move all child items onto it →
// delete the now-empty old page → rename the experience to the canonical URL
// segment. Idempotent-ish (safe to re-run). Run: `npm run migrate:experiences`.
//
// After this, the canonical seed (scripts/seed.mjs) targets the experiences, and
// authors enrich each canvas in Visual Builder (add a Hero above, RichText below).

import { createHash, randomUUID } from 'node:crypto';

const CMA = (process.env.OPTIMIZELY_CMS_API_URL || 'https://api.cms.optimizely.com').replace(/\/$/, '');
const GRAPH = (process.env.OPTIMIZELY_GRAPH_GATEWAY || '').replace(/\/$/, '');
const GKEY = process.env.OPTIMIZELY_GRAPH_SINGLE_KEY;
const CLIENT_ID = process.env.OPTIMIZELY_CMS_CLIENT_ID;
const CLIENT_SECRET = process.env.OPTIMIZELY_CMS_CLIENT_SECRET;
const HOME = process.env.SEED_HOME || '71792f1b444e4d6d9a77c41c47c4cf7e';
const LOCALE = process.env.SEED_LOCALE || 'en';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('✖ Missing OPTIMIZELY_CMS_CLIENT_ID / OPTIMIZELY_CMS_CLIENT_SECRET.');
  process.exit(1);
}

const keyFor = (s) => createHash('md5').update(s).digest('hex');
const asUuid = (k) => `${k.slice(0, 8)}-${k.slice(8, 12)}-${k.slice(12, 16)}-${k.slice(16, 20)}-${k.slice(20)}`;
const V = (value) => ({ value });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const sections = [
  {
    seg: 'places-to-visit', type: 'PlacesToVisit', name: 'Places to Visit',
    oldKey: keyFor('places-to-visit'), newKey: keyFor('places-to-visit-exp'),
    heading: 'Where Dubai comes to life',
    intro: 'From record-breaking landmarks to quiet heritage lanes — a curated guide to the city’s most memorable places.',
    metaDescription: 'Explore the best places to visit in Dubai — landmarks, beaches, dining and hidden gems.',
  },
  {
    seg: 'neighbourhoods', type: 'Neighbourhoods', name: 'Neighbourhoods',
    oldKey: keyFor('neighbourhoods'), newKey: keyFor('neighbourhoods-exp'),
    heading: 'Every district has a story',
    intro: 'From Downtown’s skyline to Old Dubai’s souks — explore the city one neighbourhood at a time.',
    metaDescription: 'Explore Dubai’s neighbourhoods — Downtown, Marina, Old Dubai and beyond.',
  },
  {
    seg: 'events', type: 'Events', name: 'Events',
    oldKey: keyFor('events'), newKey: keyFor('events-exp'),
    heading: 'What’s on in Dubai',
    intro: 'Festivals, races and seasonal celebrations across the city — plan your visit around the moments that matter.',
    metaDescription: 'What’s on in Dubai — festivals, events and seasonal highlights.',
  },
];

async function getToken() {
  const r = await fetch(`${CMA}/oauth/token`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ grant_type: 'client_credentials', client_id: CLIENT_ID, client_secret: CLIENT_SECRET }) });
  if (!r.ok) throw new Error(`token ${r.status}`);
  return (await r.json()).access_token;
}
async function api(t, m, p, b, extra = {}, attempt = 1) {
  const r = await fetch(`${CMA}/v1${p}`, { method: m, headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json', ...extra }, body: b === undefined ? undefined : JSON.stringify(b) });
  if (r.status === 429 && attempt <= 6) { await sleep(1500 * attempt); return api(t, m, p, b, extra, attempt + 1); }
  const text = await r.text(); let json = null; try { json = text ? JSON.parse(text) : null; } catch { json = text; }
  return { status: r.status, json };
}
async function graph(query, variables = {}) {
  const r = await fetch(`${GRAPH}?auth=${GKEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, variables }) });
  return r.json();
}
async function publishLatest(t, key) {
  const versions = await api(t, 'GET', `/content/${key}/versions`);
  const version = versions.json?.items?.[0]?.version;
  if (!version) return 'no-version';
  const pub = await api(t, 'POST', `/content/${key}/versions/${version}:publish`, {});
  return pub.status === 204 || pub.status === 200 ? 'published' : `publish ${pub.status}`;
}

// Composition: a Section Heading + the Section Listing block (source = this page).
function buildComposition(s) {
  const layout = { displayTemplate: 'LayoutDisplayTemplate', settings: { theme: 'inherit', width: 'contained', spacing: 'normal' } };
  return {
    id: asUuid(s.newKey), displayName: s.name, nodeType: 'experience', layoutType: 'outline',
    nodes: [
      {
        id: randomUUID(), displayName: 'Section Heading', nodeType: 'component', displaySettings: layout,
        component: { contentType: 'SectionHeading', properties: { eyebrow: V(s.name), heading: V(s.heading), intro: V(s.intro) } },
      },
      {
        id: randomUUID(), displayName: 'Section Listing', nodeType: 'component', displaySettings: layout,
        component: { contentType: 'SectionListing', properties: { source: V(`cms://content/${s.newKey}`), pageSize: V('9') } },
      },
    ],
  };
}
const versionBody = (s, routeSegment) => ({ locale: LOCALE, displayName: s.name, routeSegment, composition: buildComposition(s), properties: { metaDescription: V(s.metaDescription) } });

async function migrate(t, s) {
  console.log(`\n=== ${s.name} ===`);

  // 1. Create the new experience with a TEMP segment (avoids collision with the old page).
  const tempSeg = `${s.seg}-new`;
  const create = await api(t, 'POST', '/content', { key: s.newKey, contentType: s.type, container: HOME, initialVersion: versionBody(s, tempSeg) });
  if (create.status === 201) {
    console.log(`✔ created experience (${tempSeg}) — ${await publishLatest(t, s.newKey)}`);
  } else if (create.status === 409) {
    console.log('= experience already exists');
  } else {
    console.log(`✖ create ${create.status}: ${JSON.stringify(create.json).slice(0, 300)}`);
    return;
  }

  // 2. Move all child items from the old page onto the new experience.
  const kids = await graph(`query($c:String!){ _Page(where:{ _metadata:{ container:{ eq:$c } } }, limit:100){ items{ _metadata{ key displayName } } } }`, { c: s.oldKey });
  // SAFETY: a failed/errored child query must NOT be treated as "empty", or step 3
  // would delete a page that still has children and cascade-delete them.
  if (kids.errors) {
    console.log(`  ✖ child query errored — SKIPPING delete to avoid cascade: ${JSON.stringify(kids.errors).slice(0, 200)}`);
    return;
  }
  const items = kids.data?._Page?.items ?? [];
  for (const it of items) {
    const key = it._metadata.key;
    const patch = await api(t, 'PATCH', `/content/${key}`, { container: s.newKey }, { 'Content-Type': 'application/merge-patch+json' });
    if (patch.status === 200 || patch.status === 204) {
      console.log(`  ↻ moved "${it._metadata.displayName}" — ${await publishLatest(t, key)}`);
    } else {
      console.log(`  ✖ move "${it._metadata.displayName}" — PATCH ${patch.status}: ${JSON.stringify(patch.json).slice(0, 160)}`);
    }
  }
  if (items.length === 0) console.log('  (no children under old page — already migrated)');

  // 3. Delete the now-empty old page (frees the canonical URL segment).
  const del = await api(t, 'DELETE', `/content/${s.oldKey}`);
  console.log(`  🗑  delete old page: ${del.status === 204 ? 'deleted' : del.status === 404 ? 'already gone' : `${del.status} ${JSON.stringify(del.json).slice(0, 160)}`}`);

  // 4. Rename the experience to the canonical segment (new version — PATCH can't set routeSegment).
  const nv = await api(t, 'POST', `/content/${s.newKey}/versions`, versionBody(s, s.seg));
  if (nv.status === 201 || nv.status === 200) {
    console.log(`  🔁 renamed → /${s.seg} — ${await publishLatest(t, s.newKey)}`);
  } else {
    console.log(`  ✖ rename ${nv.status}: ${JSON.stringify(nv.json).slice(0, 200)}`);
  }
}

(async () => {
  console.log(`Migrating section pages → experiences on ${CMA}`);
  const t = await getToken();
  for (const s of sections) await migrate(t, s);
  console.log('\nDone. Verify routes, then enrich each canvas in Visual Builder.');
})().catch((e) => { console.error(e); process.exit(1); });
