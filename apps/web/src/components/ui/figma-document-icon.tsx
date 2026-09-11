import type { ImgHTMLAttributes } from 'react';

const sources = {
  'chevron-down': '/figma/documents/chevron-down.svg',
  'detail-back': '/figma/document-detail/back.svg',
  'detail-download': '/figma/document-detail/download.svg',
  'detail-find': '/figma/document-detail/find.svg',
  'detail-fullscreen': '/figma/document-detail/fullscreen.svg',
  'detail-generate': '/figma/document-detail/generate.svg',
  'detail-minus': '/figma/document-detail/minus.svg',
  'detail-next': '/figma/document-detail/next.svg',
  'detail-previous': '/figma/document-detail/previous.svg',
  documents: '/figma/documents/documents.svg',
  'file-docx': '/figma/documents/file-docx.svg',
  'file-pdf': '/figma/documents/file-pdf.svg',
  notification: '/figma/documents/notification.svg',
  overview: '/figma/documents/overview.svg',
  questions: '/figma/documents/questions.svg',
  reset: '/figma/documents/reset.svg',
  search: '/figma/documents/search.svg',
  settings: '/figma/documents/settings.svg',
  storage: '/figma/documents/storage.svg',
  subjects: '/figma/documents/subjects.svg',
  tests: '/figma/documents/tests.svg',
  upload: '/figma/documents/upload.svg',
} as const;

export type FigmaDocumentIconName = keyof typeof sources;

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  name: FigmaDocumentIconName;
};

/** Exact vector exports from the approved Figma document-library design. */
export function FigmaDocumentIcon({ name, alt = '', className, ...props }: Props) {
  // eslint-disable-next-line @next/next/no-img-element -- preserves the exact local Figma SVG bytes.
  return <img alt={alt} aria-hidden={alt ? undefined : true} className={className} draggable={false} src={sources[name]} {...props} />;
}
