# Content Architecture — the author-first CMS structure

_How content is organized in the CMS so **content authors** can find, add and update things
intuitively, and so URLs, faceting, and global settings all follow from one deliberate tree.
Supersedes the ad-hoc flat layout we started with. Pairs with CONTENT-MODEL.md (types),
LISTING-PATTERN.md (listings), SEO.md._

## 1. Goals (authoring-first)
- **Group by kind** — an author adding a place goes to *Places to Visit*; adding a tag goes to
  *Taxonomy*. No hunting through a flat root.
- **Separate concerns** — site **pages** (nav) vs **taxonomy** (data) vs **settings** (config) live
  in clearly-labelled containers.
- **Tree = URL** — each section is a page whose children are its items, so the content tree mirrors
  the site URLs (editor-managed, no hardcoded routes).
- **One obvious home** for global settings.

## 2. The tree
```
Root
├─ Home                     Experience (HomePage)          → /
├─ Places to Visit          PlacesToVisitPage              → /places-to-visit
│   └─ Point of Interest…                                   → /places-to-visit/<slug>
├─ Events                   EventsPage                     → /events            [S: next]
│   └─ Event…                                                → /events/<slug>
├─ Neighbourhoods           NeighbourhoodsPage             → /neighbourhoods     [S: next]
│   └─ Area…  (Downtown, Marina, Old Dubai)                 → /neighbourhoods/<slug>
├─ Taxonomy                 Folder (not in site nav)
│   └─ Tag…   (Landmarks, Beaches, Festivals, Luxury…)      referenced for facets + AI
└─ Settings                 Folder (not in site nav)
    └─ Site Settings         SiteSettings (singleton)        global brand / SEO / crawl
```
- **Section pages** (`PlacesToVisitPage`, `EventsPage`, `NeighbourhoodsPage`) share the listing
  pattern: SEO + heading/intro + `pageSize` + top/bottom composition zones, `mayContainTypes`
  their item type. See LISTING-PATTERN.md.
- **Folders** (`Taxonomy`, `Settings`) use a `_folder` type purely to organise; not routable, not
  in navigation.

## 3. Taxonomy — `Tag` (managed `_page`)
- New type **`Tag`** (base `_page`), organised under the **Taxonomy** folder. Fields: `name`, `slug`,
  `dimension` (theme / cuisine / audience / amenity / interest / season / accessibility), `description`,
  `synonyms`, `parent` (self, for hierarchy), `featured`, `icon`.
- **Why `_page`, not `_component`:** Optimizely Graph can only **resolve + filter** a reference whose
  target is *managed* content. A `_component` can't be a referenced, filterable taxonomy (proven the
  hard way). A fresh `Tag` type also avoids the old `Category`'s immutable-base-type + interactive-delete
  block. (The dormant `_component` `Category` type can be deleted later, interactively.)
- Referenced by items via a **`tags`** field (`array` of `contentReference` → `Tag`). Powers the
  listing facets (grouped by `dimension`) and later AI/semantic search (`synonyms`/`description`).
- Tag pages are **noindex** (taxonomy isn't thin-content SEO); they can become real landing pages later.

## 4. Global settings — `SiteSettings` singleton
- Lives under **Settings**. A single instance authors edit in one place.
- Fields: `siteName` ("Visit Dubai"), `titleTagline`, `titleSeparator`, `allowSearchIndexing`
  (global crawl switch, default OFF), `robotsTxtCustom`. Drives the global title template
  (`<page> | <tagline> | <siteName>`) → rebrand in one publish. **(Gap today: the type is missing the
  brand fields and no instance exists — this step adds both.)**

## 5. Authoring workflows (the test of the design)
- **Add a place:** Places to Visit → New → *Point of Interest*; set fields, pick `tags`, publish → live at
  `/places-to-visit/<slug>`, appears in the listing + facets automatically.
- **Add a tag:** Taxonomy → New → *Tag*; set `dimension`. Immediately available as a facet.
- **Edit global branding/SEO:** Settings → *Site Settings*. One publish rebrands every page title.
- **Add a new section (e.g. Hotels):** new section page type + card + config entry (LISTING-PATTERN §8);
  author creates the section page and adds children.

## 6. Naming & conventions
- Section URLs: `/places-to-visit`, `/events`, `/neighbourhoods` (kebab-case, plural, descriptive).
- Item `routeSegment` = slug of the name. Tags: kebab-case slug.
- Folders named for authors ("Taxonomy", "Settings").

## 7. Migration (current → target)
Current: POIs correctly nested under Places to Visit ✓. Loose at root: 3 Areas, 3 Events. Missing:
Events/Neighbourhoods sections, Taxonomy + Settings folders, `Tag` type, Site Settings instance,
brand fields on SiteSettings. Dormant: 6 stuck `Category` `_component` items.

Steps:
1. Add `_folder` type + `Tag` (`_page`) type; add brand fields to `SiteSettings`; add `EventsPage`,
   `NeighbourhoodsPage` types (+ their card/detail components); add a `tags` field to POI & Event.
   Push (`--force` where breaking; no live data at risk).
2. Seed: create **Taxonomy** + **Settings** folders; **Events**, **Neighbourhoods** section pages;
   **Site Settings** singleton; the **Tag** terms (incl. *Festivals*).
3. Re-parent existing content: Areas → Neighbourhoods; Events → Events. Tag POIs & Events
   (Food/Shopping Festival → *Festivals*).
4. Verify: tree matches §2; facets resolve; global title reads from Site Settings; breadcrumbs work.
5. Docs: fold taxonomy/CMA gotchas into OPTIMIZELY-BEST-PRACTICES.md + CONTENT-MODEL.md.

_Then_ resume the listing-pattern build (breadcrumbs, composition zones, pagination, sort, filters)
on this clean structure.
