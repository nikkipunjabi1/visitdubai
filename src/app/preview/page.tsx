import { cache } from 'react';
import type { Metadata } from 'next';
import { getClient, type PreviewParams } from '@optimizely/cms-sdk';
import { OptimizelyComponent } from '@optimizely/cms-sdk/react/server';
import { PreviewComponent } from '@optimizely/cms-sdk/react/client';
import { withAppContext } from '@optimizely/cms-sdk/react/server';
import Script from 'next/script';
import { getSiteSettings, buildContentMetadata, type PageSeo } from '@/lib/seo';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Fetch the previewed (draft) content once; keyed by the serialized preview
// params so `generateMetadata` and the page share one Graph call.
const getPreview = cache((paramsJson: string) =>
  getClient().getPreviewContent(JSON.parse(paramsJson) as PreviewParams),
);

// Reflect the draft's authored SEO title in the preview tab, so editors see title
// changes live (unlike `/`, which only updates on publish).
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  try {
    const [content, settings] = await Promise.all([
      getPreview(JSON.stringify(await searchParams)),
      getSiteSettings(),
    ]);
    return buildContentMetadata(content as PageSeo, settings, 'Preview');
  } catch {
    return {};
  }
}

async function Page({ searchParams }: Props) {
  const content = await getPreview(JSON.stringify(await searchParams));

  return (
    <>
      <Script
        src={
          new URL(
            '/util/javascript/communicationinjector.js',
            process.env.OPTIMIZELY_CMS_URL,
          ).href
        }
      ></Script>
      <PreviewComponent />
      <OptimizelyComponent content={content} />
    </>
  );
}

export default withAppContext(Page);
