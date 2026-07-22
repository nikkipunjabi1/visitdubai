import { buildConfig } from '@optimizely/cms-sdk';

export default buildConfig({
  // Only Visit Dubai content types (under content/) are pushed to the CMS.
  // The scaffold's demo components are intentionally excluded so they are not
  // recreated in the cleaned instance. The `visit_dubai` application (site) is
  // added in a later sprint once a Home experience exists to be its entry point.
  components: ['./src/components/content/**/*.tsx', './src/components/blocks/**/*.tsx'],
  propertyGroups: [
    // 'content' is a read-only system group; only declare our custom groups.
    { key: 'seo', displayName: 'SEO', sortOrder: 1 },
  ],
  // NOTE: our CLI API key can push content *types* but is Forbidden from creating
  // content *instances* or applications. So the Home experience + the "Visit Dubai"
  // application (host mapping + preview) are created in the CMS UI (see docs/PREVIEW-WORKFLOW.md).
  // Kept here as the intended code-first template for when a content-create-capable key
  // (or an existing HomeContent key) is available:
  //
  // content: [{ key: 'HomeContent', displayName: 'Home', contentType: 'HomePage' }],
  // applications: [{
  //   key: 'visit_dubai', displayName: 'Visit Dubai', type: 'website', isDefault: true,
  //   entryPoint: 'HomeContent', useApplicationSpecificAssets: false, usePreviewTokens: true,
  //   hosts: [{ authority: 'localhost:3000', type: 'primary', preferredUrlScheme: 'https' }],
  // }],
  content: [],
  applications: [],
});
