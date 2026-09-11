import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EduDocs AI',
  description: 'Nền tảng học tập từ tài liệu cá nhân',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
