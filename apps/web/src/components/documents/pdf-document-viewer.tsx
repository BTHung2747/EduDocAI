'use client';

import { useEffect, useState } from 'react';

import { createDocumentObjectUrl } from '../../lib/api-client';

type PdfDocumentViewerProps = {
  documentId: string;
  page: number;
  zoom: number;
  onError: (message: string) => void;
};

export function PdfDocumentViewer({ documentId, page, zoom, onError }: PdfDocumentViewerProps) {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    void createDocumentObjectUrl(`/documents/${documentId}/download`)
      .then((url) => {
        objectUrl = url;
        if (active) setSourceUrl(url);
        else URL.revokeObjectURL(url);
      })
      .catch((error: unknown) => {
        if (active) onError(error instanceof Error ? error.message : 'Không thể tải bản PDF gốc.');
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [documentId, onError]);

  if (!sourceUrl) {
    return <div className="grid min-h-[560px] place-items-center p-5 text-sm text-text-secondary">Đang tải trang PDF…</div>;
  }

  return <iframe title="Trình đọc PDF" src={`${sourceUrl}#page=${page}&zoom=${zoom}`} className="min-h-[620px] w-full border-0 bg-surface" />;
}
