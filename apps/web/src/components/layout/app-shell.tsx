'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Icon } from '../ui/icon';
import { FigmaDocumentIcon, FigmaDocumentIconName } from '../ui/figma-document-icon';
import { apiFetch, bytes } from '../../lib/api-client';

type NavigationIcon = FigmaDocumentIconName | 'results';

const nav: Array<[NavigationIcon, string, string]> = [
  ['overview', 'Tổng quan', '#'],
  ['subjects', 'Môn học', '/subjects'],
  ['documents', 'Tài liệu', '/documents'],
  ['questions', 'Ngân hàng câu hỏi', '/questions'],
  ['tests', 'Bài kiểm tra', '#'],
  ['results', 'Kết quả', '#'],
  ['settings', 'Cài đặt', '#'],
];

type StorageQuota = { usedBytes: number; limitBytes: number };
type SessionUser = { displayName?: string; role?: string };

function formatStorage(value: number) {
  return value >= 1024 * 1024 * 1024 ? `${(value / 1024 / 1024 / 1024).toFixed(1)} GB` : bytes(value);
}

function Sidebar({ close }: { close?: () => void }) {
  const pathname = usePathname();
  const [quota, setQuota] = useState<StorageQuota | null>(null);

  useEffect(() => {
    let active = true;
    void apiFetch<unknown>('/documents?page=1&pageSize=1').then((result) => {
      const value = result.meta?.quota as StorageQuota | undefined;
      if (active && value) setQuota(value);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  const usedPercent = quota?.limitBytes ? Math.min(100, Math.round((quota.usedBytes / quota.limitBytes) * 100)) : null;

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col bg-sidebar text-[#94a3b8]">
      <div className="flex h-[68px] items-center border-b border-[#1e293b] px-6">
        {/* eslint-disable-next-line @next/next/no-img-element -- approved local Figma brand asset. */}
        <img alt="EduDocs.ai" className="h-8 w-32 object-contain object-left" draggable={false} src="/figma/documents/brand.png" />
      </div>
      <div className="px-4 pt-6"><p className="px-3 pb-2 text-xs font-medium tracking-[.05em] text-[#64748b]">QUẢN LÝ TÀI LIỆU</p>
      <nav className="space-y-1">
        {nav.map(([icon, label, href]) => {
          const active = href !== '#' && pathname.startsWith(href);
          const navigationIcon = icon === 'results' ? <Icon name="bar_chart" className="h-[17px] w-[17px]" /> : <FigmaDocumentIcon name={icon} className="h-[17px] w-[17px] object-contain" />;
          return <Link onClick={close} key={label} href={href} className={`flex h-9 items-center gap-3 rounded-lg px-3 text-sm transition-[background-color,color] duration-150 ease-out ${active ? 'bg-primary font-medium text-white' : 'hover:bg-white/10 hover:text-white'}`}>{navigationIcon}{label}</Link>;
        })}
      </nav></div>
      <div className="mt-auto border-t border-[#1e293b] px-4 pb-4 pt-4">
        <div className="flex items-center justify-between rounded-lg bg-[#1e293b]/60 px-3 py-2 text-xs">
          <span className="flex min-w-0 items-center gap-2 text-[#94a3b8]"><FigmaDocumentIcon name="storage" className="h-4 w-4 shrink-0 object-contain" />{quota ? `Lưu trữ: ${formatStorage(quota.usedBytes)} / ${formatStorage(quota.limitBytes)}` : 'Đang tải dung lượng...'}</span>
          {usedPercent !== null && <span className="ml-2 shrink-0 font-medium text-white">{usedPercent}%</span>}
        </div>
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem('edudocs_user');
    if (!stored) return;
    try { setUser(JSON.parse(stored) as SessionUser); } catch { window.localStorage.removeItem('edudocs_user'); }
  }, []);

  const initial = user?.displayName?.trim().charAt(0).toUpperCase() || 'T';
  const roleLabel = user?.role === 'TEACHER' ? 'Giảng viên' : 'Học tập cá nhân';

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-text">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block"><Sidebar /></div>
      {open && <div className="fixed inset-0 z-40 bg-[#192033]/35 lg:hidden" onClick={() => setOpen(false)}><div className="h-full" onClick={(event) => event.stopPropagation()}><Sidebar close={() => setOpen(false)} /></div></div>}
      <div className="min-w-0 lg:pl-[260px]">
        <header className="flex h-[68px] items-center gap-3 border-b border-border bg-surface px-4 lg:px-8">
          <button aria-label="Mở điều hướng" className="min-h-11 min-w-11 lg:hidden" onClick={() => setOpen(true)}><Icon name="menu" className="h-5 w-5" /></button>
          <label className="topbar-search hidden h-10 max-w-[680px] flex-1 items-center gap-2 rounded-md border border-border px-3 text-sm text-text-muted sm:flex">
            <FigmaDocumentIcon name="search" className="h-4 w-4 object-contain" />
            <input className="min-w-0 flex-1 border-0 bg-transparent outline-none" placeholder="Tìm kiếm tài liệu, môn học..." />
          </label>
          <div className="ml-auto flex items-center gap-5">
            <button aria-label="Thông báo" className="relative grid h-10 w-10 place-items-center rounded-md border border-border text-text-secondary transition-colors hover:border-primary"><FigmaDocumentIcon name="notification" className="h-5 w-5 object-contain" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-danger" /></button>
            <div className="hidden border-l border-border pl-5 text-left text-xs sm:block"><span className="block font-medium text-text">{user?.displayName || 'Tài khoản'}</span><span className="text-text-secondary">{roleLabel}</span></div>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-soft text-xs font-medium text-primary">{initial}</span>
          </div>
        </header>
        <main className="px-4 py-6 lg:px-8 lg:pb-8 lg:pt-2">{children}</main>
      </div>
    </div>
  );
}
