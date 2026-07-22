import { buildConfig } from '@optimizely/cms-sdk';

export default buildConfig({
  // Only Visit Dubai content types (under content/) are pushed to the CMS.
  // The scaffold's demo components are intentionally excluded so they are not
  // recreated in the cleaned instance. The `visit_dubai` application (site) is
  // added in a later sprint once a Home experience exists to be its entry point.
  components: ['./src/components/content/**/*.tsx'],
  propertyGroups: [
    { key: 'content', displayName: 'Content', sortOrder: 0 },
    { key: 'seo', displayName: 'SEO', sortOrder: 1 },
  ],
  content: [],
  applications: [],
});
