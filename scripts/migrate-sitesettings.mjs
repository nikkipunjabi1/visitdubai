// ONE-TIME migration: move the Site Settings singleton from a non-routable `_page`
// to a **shared block** (`_component`) in the application's shared-assets folder
// ("For This Application" → /SysSiteAssets/), so editors manage it from the Shared
// Blocks panel instead of hunting the page tree.
//
// Base types are immutable, so this runs in two phases around a `config push`:
//   1) `node scripts/migrate-sitesettings.mjs delete`  — delete old instance + type
//      (+ the now-empty Settings folder)
//   2) edit SiteSettings.tsx → baseType '_component'; `npm run opti-push`
//   3) `node scripts/migrate-sitesettings.mjs create`  — recreate the instance as a
//      shared block, preserving the previously-authored values.

import { createHash } from 'node:crypto';

const CMA = (process.env.OPTIMIZELY_CMS_API_URL || 'https://api.cms.optimizely.com').replace(/\/$/, '');
const CLIENT_ID = process.env.OPTIMIZELY_CMS_CLIENT_ID;
const CLIENT_SECRET = process.env.OPTIMIZELY_CMS_CLIENT_SECRET;
const LOCALE = process.env.SEED_LOCALE || 'en';

// Existing IDs (from Graph): old instance, the app shared-assets folder, the empty Settings folder.
const OLD_INSTANCE = '2463bf3e5417cd07746ed1a38086acb5';
const SITE_ASSETS = process.env.SEED_SITE_ASSETS || '8ce609ddb1984b04a99c5764a540d313';
const SETTINGS_FOLDER = '19823f8a5d045da546a9630c379929a9';
const NEW_KEY = createHash('md5').update('site-settings-block').digest('hex');

// Values preserved from the previous Site Settings (read from Graph before running).
const VALUES = {
  siteName: 'This is Dubai',
  titleTagline: 'Unofficial Travel & Tourism Guide',
  titleSeparator: '|',
  allowSearchIndexing: false,
};

const phase = process.argv[2];
if (!['delete', 'create'].includes(phase)) {
  console.error('Usage: node scripts/migrate-sitesettings.mjs <delete|create>');
  process.exit(1);
}
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('✖ Missing OPTIMIZELY_CMS_CLIENT_ID / OPTIMIZELY_CMS_CLIENT_SECRET.');
  process.exit(1);
}

async function token() {
  const r = await fetch(`${CMA}/oauth/token`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ grant_type: 'client_credentials', client_id: CLIENT_ID, client_secret: CLIENT_SECRET }) });
  if (!r.ok) throw new Error(`token ${r.status}`);
  return (await r.json()).access_token;
}
async function api(t, m, p, b) {
  const r = await fetch(`${CMA}/v1${p}`, { method: m, headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' }, body: b === undefined ? undefined : JSON.stringify(b) });
  const txt = await r.text(); let j = null; try { j = txt ? JSON.parse(txt) : null; } catch { j = txt; }
  return { status: r.status, json: j };
}
async function publishLatest(t, key) {
  const v = await api(t, 'GET', `/content/${key}/versions`);
  const ver = v.json?.items?.[0]?.version;
  if (!ver) return 'no-version';
  const p = await api(t, 'POST', `/content/${key}/versions/${ver}:publish`);
  return p.status === 204 || p.status === 200 ? 'published' : `publish ${p.status}`;
}

(async () => {
  const t = await token();

  if (phase === 'delete') {
    console.log('del instance   :', (await api(t, 'DELETE', `/content/${OLD_INSTANCE}`)).status);
    console.log('del _page type :', (await api(t, 'DELETE', '/contenttypes/SiteSettings')).status);
    console.log('del Settings fld:', (await api(t, 'DELETE', `/content/${SETTINGS_FOLDER}`)).status, '(should be empty)');
    console.log('\nNow: edit SiteSettings.tsx → _component, `npm run opti-push`, then run this with "create".');
    return;
  }

  // create
  const body = {
    key: NEW_KEY,
    contentType: 'SiteConfiguration',
    container: SITE_ASSETS,
    initialVersion: {
      locale: LOCALE,
      displayName: 'Site Settings',
      properties: {
        siteName: { value: VALUES.siteName },
        titleTagline: { value: VALUES.titleTagline },
        titleSeparator: { value: VALUES.titleSeparator },
        allowSearchIndexing: { value: VALUES.allowSearchIndexing },
      },
    },
  };
  const c = await api(t, 'POST', '/content', body);
  console.log('create shared block:', c.status, c.status >= 400 ? JSON.stringify(c.json).slice(0, 300) : `— ${await publishLatest(t, NEW_KEY)}  key=${NEW_KEY}`);
})().catch((e) => { console.error(e); process.exit(1); });
