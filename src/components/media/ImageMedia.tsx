import { contentType, type ContentProps } from '@optimizely/cms-sdk';
import Image from 'next/image';

/**
 * ImageMedia — the concrete content type SaaS CMS assigns to uploaded image
 * assets (base type `_image`). It MUST be registered even though we rarely
 * render it directly: blocks reference images via `contentReference` +
 * `allowedTypes: ['_image']` (e.g. Hero's `backgroundImage`), and the Graph
 * delivery query resolves those references to `ImageMedia`. If it is missing
 * from the registry the SDK throws `GraphMissingContentTypeError` and preview
 * fails.
 *
 * Properties are intentionally left empty: for an `_image` base type the SDK
 * auto-selects `_assetMetadata { fileSize mimeType url }` and
 * `_imageMetadata { width height }`, which is all we need to render. Requesting
 * only base fields keeps the generated query valid regardless of any extra
 * custom fields the asset type may carry in the CMS.
 */
export const ImageMediaContentType = contentType({
  key: 'ImageMedia',
  displayName: 'Image',
  baseType: '_image',
  properties: {},
});

type Props = {
  content: ContentProps<typeof ImageMediaContentType>;
};

export default function ImageMedia({ content }: Props) {
  const url = content._assetMetadata?.url;
  if (!url) return null;

  const width = content._imageMetadata?.width ?? 1600;
  const height = content._imageMetadata?.height ?? 900;

  return (
    <Image
      src={url}
      alt=""
      width={width}
      height={height}
      className="h-auto w-full"
    />
  );
}
