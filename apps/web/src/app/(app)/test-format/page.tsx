'use client';

import React from 'react';
import { DocumentContentRenderer } from '../../../components/documents/document-content-renderer';
import { DocumentSection } from '../../../lib/api-client';

// ─── Mock Data chuẩn — bao phủ đủ 5 loại block theo V2 ───────────────────────
const mockSections: DocumentSection[] = [
  // 1. Chapter block
  {
    id: 'ch-1',
    documentId: 'mock',
    title: 'CHƯƠNG 1: LỊCH SỬ ĐẢNG CỘNG SẢN VIỆT NAM',
    contentText:
      'Chương này trình bày quá trình ra đời, hình thành và phát triển của Đảng Cộng sản Việt Nam từ năm 1930 đến nay. Nội dung bao gồm bối cảnh lịch sử, các mốc sự kiện quan trọng và ý nghĩa lý luận.',
    createdAt: '',
    updatedAt: '',
  },
  // 2. Section heading + nhiều đoạn văn (test heuristic multi-para)
  {
    id: 'sec-1-1',
    documentId: 'mock',
    title: '1.1. Bối cảnh ra đời',
    contentText:
      'Cuối thế kỷ XIX, thực dân Pháp tiến hành xâm lược và đô hộ Việt Nam. Chính sách thực dân tàn bạo đã đẩy nhân dân vào cảnh cùng cực, kéo theo hàng loạt cuộc khởi nghĩa.\n\nTrước tình hình đó, yêu cầu có một tổ chức cách mạng đủ năng lực lãnh đạo toàn dân đứng lên giải phóng đất nước ngày càng trở nên cấp thiết.\n\nNguyễn Ái Quốc – Hồ Chí Minh đã tích cực chuẩn bị về lý luận, tổ chức và cán bộ, đặt nền tảng cho sự ra đời của Đảng.',
    createdAt: '',
    updatedAt: '',
  },
  // 3. Lưu ý / Citation block
  {
    id: 'note-1',
    documentId: 'mock',
    title: 'Lưu ý',
    contentText:
      'Khi nghiên cứu lịch sử Đảng, cần phân biệt sự kiện lịch sử Đảng với sự kiện lịch sử dân tộc nói chung. Sự kiện lịch sử Đảng gắn trực tiếp với sự lãnh đạo, quyết sách của Đảng trong từng thời kỳ.',
    createdAt: '',
    updatedAt: '',
  },
  // 4. Nội dung có heuristic (title = "Trang X" → header stamp không sinh h3)
  //    và bên trong contentText có cả tên chương + mục bị gom lại (bắt chước parser kém)
  {
    id: 'page-2',
    documentId: 'mock',
    title: 'Trang 2',
    contentText:
      'CHƯƠNG 2: QUÁ TRÌNH LÃNH ĐẠO CÁCH MẠNG (1930 – 1945)\n\n2.1. Giai đoạn 1930 – 1935\n\nSau khi thành lập, Đảng lãnh đạo phong trào Xô Viết Nghệ Tĩnh (1930–1931) – phong trào cách mạng đầu tiên do Đảng lãnh đạo, thể hiện ý chí quật cường và sức mạnh của quần chúng nhân dân.\n\n2.2. Giai đoạn 1936 – 1939\n\nĐảng tổ chức phong trào Dân chủ Đông Dương, đấu tranh đòi các quyền dân sinh, dân chủ trong khuôn khổ hợp pháp, tranh thủ tập hợp lực lượng rộng rãi.',
    createdAt: '',
    updatedAt: '',
  },
  // 5. Figure / Biểu đồ block
  {
    id: 'fig-1',
    documentId: 'mock',
    title: 'Hình 2.1: Sơ đồ tổ chức Đảng năm 1930',
    contentText:
      'Ban Chấp hành Trung ương\n└── Xứ ủy Bắc Kỳ\n└── Xứ ủy Trung Kỳ\n└── Xứ ủy Nam Kỳ\n\n(Nguồn: Viện Lịch sử Đảng, 2005)',
    createdAt: '',
    updatedAt: '',
  },
  // 6. Khái niệm / Definition citation
  {
    id: 'def-1',
    documentId: 'mock',
    title: 'Khái niệm: Đảng tiên phong',
    contentText:
      '"Đảng tiên phong" là khái niệm chỉ tổ chức cách mạng đại diện cho giai cấp công nhân, trang bị lý luận Mác-Lênin, có tổ chức chặt chẽ và có khả năng lãnh đạo quần chúng thực hiện mục tiêu cách mạng.',
    createdAt: '',
    updatedAt: '',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TestFormatPage() {
  return (
    <div className="flex min-h-screen w-full flex-col" style={{ background: '#F4F6FB' }}>
      {/* Sandbox header ──────────────────────────────────────────────────────── */}
      <header className="border-b border-border bg-white px-8 py-4">
        <h1 className="text-[16px] font-medium text-text">
          🧪 Sandbox — Kiểm tra Format Document V2
        </h1>
        <p className="mt-1 text-[12px] text-text-muted">
          Mock Data bao phủ: Chapter · Section · Normal (heuristic) · Figure · Citation · Lưu ý — chỉnh sửa
          <code className="mx-1 rounded bg-[#F4F6FB] px-1 font-mono text-[11px]">
            document-content-renderer.tsx
          </code>
          rồi F5 để xem thay đổi.
        </p>
      </header>

      {/* Viewer mock shell ──────────────────────────────────────────────────── */}
      <main className="flex flex-1 items-start justify-center p-8">
        <div
          className="w-full max-w-[620px] select-text overflow-hidden rounded-[14px] border border-border bg-white"
          style={{ minHeight: 400 }}
        >
          <div className="flex flex-col px-8 py-8">
            <DocumentContentRenderer
              documentDisplayName="GIÁO TRÌNH LỊCH SỬ ĐẢNG CỘNG SẢN VIỆT NAM"
              page={1}
              sections={mockSections}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
