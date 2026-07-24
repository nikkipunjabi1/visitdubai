import { contentType } from '@optimizely/cms-sdk';
import { TagContentType } from './Tag';

/**
 * Folder — an organizational container in the CMS content tree. Used to keep the
 * tree tidy for authors by grouping non-routable, behind-the-scenes content:
 *   • Taxonomy → all the Tag terms
 *   • Settings → the Site Settings singleton
 *
 * Folders are NON-ROUTABLE (no public URL) and are excluded from Graph delivery,
 * so scoping that used to key off the direct `container` now keys off the
 * ancestor `path` (see src/lib/seo.ts) — that survives any nesting depth.
 *
 * `mayContainTypes` restricts what an author can file here, so the structure
 * stays predictable.
 */
export const FolderContentType = contentType({
  key: 'Folder',
  displayName: 'Folder',
  baseType: '_folder',
  mayContainTypes: [TagContentType],
});
