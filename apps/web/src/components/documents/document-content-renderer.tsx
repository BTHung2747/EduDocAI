import React from 'react';
import { DocumentSection } from '../../lib/api-client';

// ─── Classifier ────────────────────────────────────────────────────────────────
// Phân loại tiêu đề section thành một trong 5 dạng để áp style đúng V2.
export type SectionType = 'chapter' | 'section' | 'figure' | 'citation' | 'normal';

export function classifyTitle(title?: string | null): SectionType {
  if (!title) return 'normal';
  const t = title.trim();
  // Tiêu đề dạng "Trang X" do parser PDF sinh ra → không render thành heading
  if (/^trang\s*\d+$/i.test(t)) return 'normal';
  // Tiêu đề chương: bắt đầu bằng "Chương/Phần/Chapter/Part" HOẶC viết hoa toàn bộ
  if (
    /chương|phần|chapter|part/i.test(t) ||
    (t.length > 5 && t === t.toUpperCase() && /[A-ZÀ-Ỹ]/.test(t))
  ) return 'chapter';
  // Tiêu đề mục: bắt đầu bằng số thứ tự (1., 1.1., I., IV.…)
  if (/^(\d+(\.\d+)*\.?|[IVXLCDM]+\.?)\s/i.test(t)) return 'section';
  // Hình / biểu đồ / bảng
  if (/hình|bảng|figure|table|sơ đồ|biểu đồ/i.test(t)) return 'figure';
  // Khung chú thích / lưu ý
  if (/lưu ý|ghi chú|chú ý|định nghĩa|khái niệm|trích dẫn|note/i.test(t)) return 'citation';
  return 'section';
}

// ─── Heuristic paragraph scanner ───────────────────────────────────────────────
// Khi backend gom cả tên chương vào contentText, hàm này tự nhận diện từng dòng.
function renderParagraph(para: string, i: number) {
  const t = para.trim();
  if (!t) return null;

  // Dòng toàn chữ hoa ngắn → Chapter heading (V2 §3.2 Page title 28/36)
  if (
    /^(chương|phần|chapter|part)\s/i.test(t) ||
    (t.length > 5 && t.length < 150 && t === t.toUpperCase() && /[A-ZÀ-Ỹ]/.test(t))
  ) {
    return (
      <h2
        key={i}
        className="mt-4 text-[20px] font-medium leading-7 tracking-tight text-text-strong uppercase"
      >
        {t}
      </h2>
    );
  }

  // Dòng bắt đầu bằng số mục (1., 1.1., I.…) và đủ ngắn → Section heading (V2 §3.2 Body emphasis)
  if (/^(\d+(\.\d+)*\.?|[IVXLCDM]+\.?)\s/i.test(t) && t.length < 200) {
    return (
      <h3 key={i} className="mt-3 text-[14px] font-medium leading-5 text-text-strong">
        {t}
      </h3>
    );
  }

  // Đoạn văn bình thường (V2 §3.2 Body 14/20)
  return (
    <p
      key={i}
      className="whitespace-pre-line text-justify text-[14px] font-normal leading-[1.7] text-text-secondary"
    >
      {para}
    </p>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────
export interface DocumentContentRendererProps {
  /** Tên tài liệu hiển thị trong Page Header Stamp */
  documentDisplayName?: string;
  /** Số trang hiện tại */
  page?: number;
  /** Danh sách section từ API */
  sections: DocumentSection[];
}

/**
 * Render nội dung tài liệu theo chuẩn UI Design V2.
 *
 * Các block:
 *   - Page Header Stamp (tên tài liệu + TRANG X) — 1 lần mỗi trang
 *   - Chapter  → h2 (20/28, 500, uppercase, text-strong)
 *   - Section  → h3 (14/20, 500, text-strong) + paragraphs
 *   - Normal   → paragraphs chỉ (không tiêu đề)
 *   - Figure   → card căn giữa (surface-subtle, border, radius-md)
 *   - Citation → left-border primary + bg primary-soft
 */
export function DocumentContentRenderer({
  documentDisplayName,
  page,
  sections,
}: DocumentContentRendererProps) {
  return (
    <>
      {/* Page Header Stamp ─────────────────────────────────────────────────── */}
      {documentDisplayName && page !== undefined && (
        <div className="mb-6 flex items-center justify-between border-b border-border pb-2">
          <span className="max-w-[420px] truncate text-[12px] font-medium uppercase tracking-[0.6px] text-text-muted">
            {documentDisplayName}
          </span>
          <span className="shrink-0 text-[12px] font-medium uppercase tracking-[0.6px] text-text-muted">
            TRANG {page}
          </span>
        </div>
      )}

      {/* Sections ─────────────────────────────────────────────────────────── */}
      {sections.map((section) => {
        const type = classifyTitle(section.title);

        const paragraphs = section.contentText
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean);
        const contentParas = paragraphs.length > 0 ? paragraphs : [section.contentText];

        return (
          <article
            key={section.id ?? Math.random().toString(36).slice(2)}
            className="mb-8 flex flex-col gap-4 last:mb-0"
          >
            {/* ── Chapter (V2: Section title 20/28, 500, uppercase) ─────────── */}
            {type === 'chapter' && section.title && (
              <h2 className="text-[20px] font-medium leading-7 uppercase tracking-tight text-text-strong">
                {section.title}
              </h2>
            )}

            {/* ── Chapter body text: plain paragraphs only, no heuristic scan ─ */}
            {type === 'chapter' && (
              <div className="flex flex-col gap-3">
                {contentParas.map((para, i) => (
                  <p
                    key={i}
                    className="whitespace-pre-line text-justify text-[14px] font-normal leading-[1.7] text-text-secondary"
                  >
                    {para}
                  </p>
                ))}
              </div>
            )}

            {/* ── Section (V2: Body emphasis 14/20, 500) + heuristic paragraphs */}
            {(type === 'section' || type === 'normal') && (
              <div className="flex flex-col gap-3">
                {type === 'section' && section.title && (
                  <h3 className="text-[14px] font-medium leading-5 text-text-strong">
                    {section.title}
                  </h3>
                )}
                {contentParas.map((para, i) => renderParagraph(para, i))}
              </div>
            )}

            {/* ── Figure / Table (card căn giữa, V2: surface-subtle + border) ─ */}
            {type === 'figure' && (
              <figure className="flex flex-col items-center gap-3 rounded-[10px] border border-border bg-[#FAFBFD] p-5">
                {section.title && (
                  <figcaption className="text-center text-[12px] font-medium uppercase tracking-[0.6px] text-text-muted">
                    {section.title}
                  </figcaption>
                )}
                <p className="whitespace-pre-line text-center text-[12px] leading-[1.6] text-text-secondary">
                  {section.contentText}
                </p>
              </figure>
            )}

            {/* ── Citation / Lưu ý (left-border primary, bg primary-soft) ───── */}
            {type === 'citation' && (
              <div className="flex flex-col gap-2">
                {section.title && (
                  <h3 className="text-[14px] font-medium leading-5 text-text-strong">
                    {section.title}
                  </h3>
                )}
                <div className="rounded-[8px] border-l-4 border-primary bg-primary-soft px-4 py-3">
                  <p className="whitespace-pre-line text-[14px] leading-[1.7] text-text">
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
