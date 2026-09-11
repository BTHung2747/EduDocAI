import React from 'react';
import { DocumentSection } from '../../lib/api-client';

export function classifyTitle(title?: string | null): 'chapter' | 'section' | 'figure' | 'citation' | 'normal' {
  if (!title) return 'normal';
  const t = title.trim();
  if (/^trang\s*\d+$/i.test(t)) return 'normal';
  if (/chương|phần|chapter|part/i.test(t) || (t.length > 5 && t === t.toUpperCase() && /[A-ZÀ-Ỹ]/.test(t))) return 'chapter';
  if (/^(\d+(\.\d+)*\.?|[IVXLCDM]+\.?)\s/i.test(t)) return 'section';
  if (/hình|bảng|figure|table|sơ đồ|biểu đồ/i.test(t)) return 'figure';
  if (/lưu ý|ghi chú|chú ý|định nghĩa|khái niệm|trích dẫn|>|note/i.test(t)) return 'citation';
  return 'section';
}

export interface DocumentContentRendererProps {
  documentDisplayName?: string;
  page?: number;
  sections: DocumentSection[];
}

export function DocumentContentRenderer({ documentDisplayName, page, sections }: DocumentContentRendererProps) {
  return (
    <>
      {/* Page Header Stamp - Rendered once per page if details are provided */}
      {documentDisplayName && page !== undefined && (
        <div className="mb-6 flex items-center justify-between border-b border-[#E1E5EE] pb-2 text-[12px] font-medium uppercase tracking-wider text-[#687188]">
          <span className="max-w-[420px] truncate">{documentDisplayName}</span>
          <span className="shrink-0">TRANG {page}</span>
        </div>
      )}

      {sections.map((section) => {
        const titleType = classifyTitle(section.title);
        
        const paragraphs = section.contentText
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean);
        
        const contentParas = paragraphs.length > 0 ? paragraphs : [section.contentText];

        const renderParagraph = (para: string, i: number) => {
          const t = para.trim();
          // Tự động nhận diện tên chương nằm trong nội dung nếu parser backend không bóc tách được
          if (/^(chương|phần|chapter|part)\s/i.test(t) || (t.length > 5 && t === t.toUpperCase() && /[A-ZÀ-Ỹ]/.test(t) && t.length < 150)) {
            return (
              <div key={i} className="pt-2">
                <h2 className="text-[18px] font-medium uppercase leading-snug tracking-tight text-[#192033]">
                  {t}
                </h2>
              </div>
            );
          }
          // Tự động nhận diện các đề mục 1.1, I., v.v.
          if (/^(\d+(\.\d+)*\.?|[IVXLCDM]+\.?)\s/i.test(t) && t.length < 200) {
            return (
              <h3 key={i} className="mt-2 text-[14px] font-medium text-[#192033]">
                {t}
              </h3>
            );
          }
          return (
            <p key={i} className="whitespace-pre-line text-justify text-[14px] font-normal leading-relaxed text-[#2C344E]">
              {para}
            </p>
          );
        };

        return (
          <article key={section.id || Math.random().toString()} className="mb-8 flex flex-col gap-5 last:mb-0">
            {/* Chapter title */}
            {titleType === 'chapter' && (
              <div className="pt-2">
                <h2 className="text-[18px] font-medium uppercase leading-snug tracking-tight text-[#192033]">
                  {section.title}
                </h2>
              </div>
            )}

            {/* Section/Normal Content Block */}
            {(titleType === 'section' || titleType === 'normal' || titleType === 'chapter') && (
              <div className="flex flex-col gap-2">
                {titleType === 'section' && section.title && (
                  <h3 className="text-[14px] font-medium text-[#192033]">
                    {section.title}
                  </h3>
                )}
                {contentParas.map((para, i) => renderParagraph(para, i))}
              </div>
            )}

            {/* Figure block */}
            {titleType === 'figure' && (
              <div className="my-4 flex flex-col items-center rounded-[10px] border border-[#E1E5EE] bg-[#FAFBFD] p-4">
                <span className="mb-3 text-center text-[12px] font-medium uppercase tracking-wider text-[#687188]">
                  {section.title}
                </span>
                <p className="whitespace-pre-line text-center text-[12px] font-normal leading-relaxed text-[#687188]">
                  {section.contentText}
                </p>
              </div>
            )}

            {/* Highlight citation */}
            {titleType === 'citation' && (
              <div className="flex flex-col gap-2">
                {section.title && (
                  <h3 className="text-[14px] font-medium text-[#192033]">
                    {section.title}
                  </h3>
                )}
                <div className="rounded-[8px] border-l-4 border-[#5b5ce2] bg-[#5b5ce2]/15 p-3">
                  <p className="whitespace-pre-line text-[14px] font-normal leading-relaxed text-[#192033]">
                    {section.contentText}
                  </p>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </>
  );
}
