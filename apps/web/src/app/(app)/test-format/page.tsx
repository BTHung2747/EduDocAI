'use client';

import React from 'react';
import { DocumentContentRenderer } from '../../../components/documents/document-content-renderer';
import { DocumentSection } from '../../../lib/api-client';

const mockSections: DocumentSection[] = [
  {
    id: 'section-1',
    documentId: 'doc-1',
    title: 'CHƯƠNG 1: TỔNG QUAN VỀ HỆ THỐNG',
    contentText: 'Đây là phần nội dung giới thiệu chung về hệ thống tài liệu. Trong chương này, chúng ta sẽ đi qua các khái niệm cơ bản và cách thức hoạt động của nền tảng EduDocs AI.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'section-2',
    documentId: 'doc-1',
    title: '1.1. Lịch sử hình thành',
    contentText: 'Nền tảng được xây dựng nhằm giải quyết bài toán khó khăn trong việc tra cứu và đọc các tài liệu học thuật có cấu trúc phức tạp.\n\nĐội ngũ phát triển đã tham khảo các chuẩn thiết kế hiện đại nhất để tối ưu hóa trải nghiệm người dùng (UX) và giao diện người dùng (UI), đảm bảo mọi đoạn văn đều được căn lề đều đặn và có khoảng cách dễ đọc.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'section-3',
    documentId: 'doc-1',
    title: 'Lưu ý quan trọng',
    contentText: 'Các tính năng AI chỉ hỗ trợ trích xuất thông tin, người dùng vẫn cần kiểm tra lại độ chính xác của các đoạn text được sinh ra. Tránh phụ thuộc hoàn toàn vào kết quả tự động.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'section-4',
    documentId: 'doc-1',
    title: 'Trang 2',
    contentText: 'CHƯƠNG 2: PHÂN TÍCH YÊU CẦU\n\n2.1. Yêu cầu chức năng\n\nHệ thống cần có khả năng hiển thị các hình ảnh và biểu đồ một cách rõ nét, với các chú thích rõ ràng ở bên dưới.\n\nĐoạn văn này minh họa cho việc backend bóc tách dữ liệu không tốt, gom cả tên chương vào nội dung văn bản. Heuristic parser sẽ tự động bôi đậm các mục này.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'section-5',
    documentId: 'doc-1',
    title: 'Sơ đồ luồng dữ liệu (Figure 2.1)',
    contentText: 'Nguồn dữ liệu -> RAG Pipeline -> LLM -> Kết quả trả về cho Client.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default function TestFormatPage() {
  return (
    <div className="flex h-screen w-full flex-col bg-surface-soft">
      <header className="border-b border-border bg-white px-8 py-4">
        <h1 className="text-xl font-semibold text-text">Sandbox: Kiểm tra Format Document</h1>
        <p className="text-sm text-text-secondary">Trang này sử dụng Mock Data hoàn hảo để kiểm tra các rule CSS (Gap, Margin, Typo, Alignment) trước khi áp dụng vào trang thật.</p>
      </header>
      
      <main className="flex-1 overflow-y-auto p-8 select-text">
        <div className="mx-auto max-w-[620px] bg-white shadow-sm rounded-lg border border-border">
          <div className="flex flex-col px-8 py-8">
            <DocumentContentRenderer 
              documentDisplayName="TÀI LIỆU HƯỚNG DẪN KIỂM THỬ GIAO DIỆN MẪU"
              page={1}
              sections={mockSections}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
