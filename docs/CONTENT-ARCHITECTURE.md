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

## 2. The tree (multisite-ready)
Every site lives under its own **site-root node**, so the CMS is multisite-ready from day one —
adding *This is Abu Dhabi* later is just another sibling subtree, no rework (see §8).
```
Root
└─ This is Dubai            HomePage Experience  ← Home = Site Root = Start Page  → /
   ├─ Places to Visit       PlacesToVisitPage                      → /places-to-visit
   │   └─ Point of Interest…                                        → /places-to-visit/<slug>
   ├─ Events                EventsPage                             → /events
   │   └─ Event…                                                    → /events/<slug>
   ├─ Neighbourhoods        NeighbourhoodsPage                     → /neighbourhoods
   │   └─ Area… (Downtown, Marina, Old Dubai)                       → /neighbourhoods/<slug>
   ├─ Taxonomy              Folder (not in site nav)
   │   └─ Tag… (Landmarks, Beaches, Festivals, Luxury…)             referenced for facets + AI
   └─ Settings              Folder (not in site nav)
       └─ Site Settings      SiteSettings (singleton)               this site's brand / SEO / crawl
```
- **Home IS the site root** (one node, e.g. "This is Dubai"): it's the Start Page the Application
  binds its host(s) to (`localhost:3000` dev, the Vercel domain in prod) AND it parents the section
  pages. URLs resolve relative to it → Home = `/`, children = `/<segment>`. No separate SiteRoot node,
  and no Application rebind when restructuring (Home never moves).
- **An Experience CAN parent pages** once it declares **`mayContainTypes`** — verified. (The earlier
  "not allowed under parent" error was simply a missing `mayContainTypes`, not an Experience limitation.)
  So `HomePage.mayContainTypes = [PlacesToVisitPage, EventsPage, NeighbourhoodsPage, Area, Event, SiteSettings]`.
- **Section pages** (`PlacesToVisitPage`, `EventsPage`, `NeighbourhoodsPage`) share the listing
  pattern: SEO + heading/intro + `pageSize` + top/bottom composition zones, `mayContainTypes`
  their item type. See LISTING-PATTERN.md.
- **Taxonomy & Settings live *per site*** (under each site root) so each site owns its own tags,
  brand and SEO — clean multisite isolation. (A future "shared" taxonomy could sit under Root if
  ever needed.)
- **Folders** (`Taxonomy`, `Settings`) use a `_folder` type purely to organise; not routable.

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
- Fields: `siteName` ("This is Dubai"), `titleTagline`, `titleSeparator`, `allowSearchIndexing`
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

## 7. Migration

### Phase 1 — site-root restructure ✅ DONE
Home (renamed **"This is Dubai"**) is the site root: `HomePage.mayContainTypes` added, Places to Visit +
Areas + Events re-parented under it, **Site Settings singleton** created (siteName "This is Dubai"). Root
now has one content child. Home stays the Start Page at `/`, so **no Application rebind** was needed;
all URLs verified clean (`/`, `/places-to-visit`, `/places-to-visit/<slug>`). Global title now reads from
CMS Site Settings.

### Phase 2 — sections + taxonomy [next]
1. **Types** (`config push --force`): `_folder` type; `Tag` (`_page`); `EventsPage`, `NeighbourhoodsPage`
   (+ their components); a **`tags`** field (`contentReference`→`Tag`) on POI & Event; add
   EventsPage/NeighbourhoodsPage to `HomePage.mayContainTypes`.
2. **Seed:** **Taxonomy** + **Settings** folders (move Site Settings into Settings); **Events** +
   **Neighbourhoods** section pages under Home; the **Tag** terms (incl. *Festivals*).
3. **Re-parent + tag:** Areas → Neighbourhoods, Events → Events; tag Food/Shopping Festival → *Festivals*.
4. **Verify:** `/events`, `/neighbourhoods` + children resolve; facets (Tag/Area/price) resolve; taxonomy
   pages noindex.
5. **Docs:** fold taxonomy/CMA/multisite gotchas into OPTIMIZELY-BEST-PRACTICES.md + CONTENT-MODEL.md.

_Then_ resume the listing-pattern build (breadcrumbs, composition zones, pagination, sort, filters) on
this clean, multisite-ready structure. (Dormant `_component` `Category` + its 6 stuck items: delete later
via interactive `content delete`.)

## 8. Multisite (future — structured for it now)
Each destination is a self-contained subtree + its own Application:
```
Root
├─ This is Dubai      SiteRoot   → Application A: thisisdubai.com      → Home + sections + Taxonomy + Settings
├─ This is Abu Dhabi  SiteRoot   → Application B: visitabudhabi.com   → its own Home + sections + …
└─ This is Sharjah    SiteRoot   → …
```
- **Per-site isolation:** each site owns its Home, sections, Tags, and Site Settings — so brand, SEO,
  taxonomy and content never collide across sites. Add a site = add a SiteRoot subtree + an Application.
- **Frontend:** the Next.js app is host-aware — `getContentByPath` already resolves by path **and**
  `url.base` (host). Multisite adds a host→site map; the same components render every site.
- **Localization** (EN→AR later) is a language variation *within* a site, orthogonal to multisite.
- We build **only This is Dubai now**, but in this layout, so nothing needs re-parenting when more
  destinations arrive.
