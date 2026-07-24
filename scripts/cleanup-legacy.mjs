// Cleanup after the shared-blocks migration: remove the retired `_page` Tag
// instances and the now-empty organizational folders from the content tree, and
// best-effort delete the orphaned content types. Idempotent (404/409 are fine).
//
// Run: `node --env-file=.env scripts/cleanup-legacy.mjs`

import { createHash } from 'node:crypto';

const CMA = (process.env.OPTIMIZELY_CMS_API_URL || 'https://api.cms.optimizely.com').replace(/\/$/, '');
const CLIENT_ID = process.env.OPTIMIZELY_CMS_CLIENT_ID;
const CLIENT_SECRET = process.env.OPTIMIZELY_CMS_CLIENT_SECRET;
const keyFor = (s) => createHash('md5').update(s).digest('hex');

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('✖ Missing OPTIMIZELY_CMS_CLIENT_ID / OPTIMIZELY_CMS_CLIENT_SECRET.');
  process.exit(1);
}

// Retired `_page` Tag instances (old namespace "tag:<slug>") + the empty folders.
const TAG_SLUGS = ['landmarks', 'fine-dining', 'beaches', 'culture-heritage', 'family', 'luxury', 'festivals'];
const instanceKeys = [
  ...TAG_SLUGS.map((s) => keyFor(`tag:${s}`)),
  keyFor('folder:taxonomy'), // Taxonomy folder (Settings folder already deleted)
];
// Orphaned types (best-effort — may 409 while instances are freshly trashed).
const typeKeys = ['Tag', 'Folder', 'SiteSettings', 'ZZProbeTag', 'ZZProbeHost'];

async function token() {
  const r = await fetch(`${CMA}/oauth/token`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ grant_type: 'client_credentials', client_id: CLIENT_ID, client_secret: CLIENT_SECRET }) });
  if (!r.ok) throw new Error(`token ${r.status}`);
  return (await r.json()).access_token;
}
async function del(t, path) {
  const r = await fetch(`${CMA}/v1${path}`, { method: 'DELETE', headers: { Authorization: `Bearer ${t}` } });
  return r.status;
}

(async () => {
  const t = await token();
  console.log('Instances:');
  for (const k of instanceKeys) console.log(`  ${k} → ${await del(t, `/content/${k}`)}`);
  console.log('Types (best-effort; 409 = still pinned by trashed content, harmless):');
  for (const k of typeKeys) console.log(`  ${k} → ${await del(t, `/contenttypes/${k}`)}`);
})().catch((e) => { console.error(e); process.exit(1); });
