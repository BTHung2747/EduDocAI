'use client';

import { useEffect, useState } from 'react';
import { apiFetch, Subject } from '../../../lib/api-client';

type DefaultSubjectsResult = { created: number; skipped: number };
type ReclassifySubjectsResult = { processed: number; assigned: number; skipped: number };

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [seeding, setSeeding] = useState(false);

  const load = () => apiFetch<Subject[]>('/subjects').then((value) => setSubjects(value.data)).catch((cause) => setError(cause.message));
  useEffect(() => { load(); }, []);

  async function add() {
    try {
      setError('');
      await apiFetch('/subjects', { method: 'POST', body: JSON.stringify({ name }) });
      setName('');
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể tạo môn học.');
    }
  }

  async function addDefaults() {
    setSeeding(true);
    setError('');
    setNotice('');
    try {
      const result = await apiFetch<DefaultSubjectsResult>('/subjects/defaults', { method: 'POST' });
      const classification = await apiFetch<ReclassifySubjectsResult>('/subjects/reclassify', { method: 'POST' });
      setNotice(result.data.created ? `Đã thêm ${result.data.created} môn học mẫu; AI đã gán môn cho ${classification.data.assigned}/${classification.data.processed} tài liệu sẵn sàng.` : `Các môn học mẫu đã có đầy đủ. AI đã gán môn cho ${classification.data.assigned}/${classification.data.processed} tài liệu sẵn sàng.`);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể thêm môn học mẫu.');
    } finally {
      setSeeding(false);
    }
  }

  return <>
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-[24px] font-medium lg:text-[28px]">Môn học</h1><p className="mt-1 text-xs text-text-secondary">Quản lý môn học và phân loại tài liệu.</p></div><button type="button" onClick={() => void addDefaults()} disabled={seeding} className="h-10 rounded-md border border-border bg-surface px-3 text-sm font-medium text-primary transition-colors hover:bg-primary-soft disabled:cursor-wait disabled:opacity-60">{seeding ? 'Đang thêm...' : 'Thêm môn học mẫu'}</button></div>
    <div className="mt-5 max-w-[640px] rounded-lg border border-border bg-surface p-4"><label className="text-xs font-medium">Tên môn học</label><div className="mt-2 flex gap-2"><input maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className="h-10 min-w-0 flex-1 rounded-md border border-border px-3" placeholder="Ví dụ: Mạng máy tính"/><button type="button" onClick={() => void add()} disabled={!name.trim()} className="min-w-24 rounded-md bg-primary px-3 text-white disabled:opacity-50">Tạo</button></div>{error && <p role="alert" className="mt-2 text-xs text-danger">{error}</p>}{notice && <p role="status" className="mt-2 text-xs text-success">{notice}</p>}<ul className="mt-5 divide-y divide-border">{subjects.map((subject) => <li className="flex items-center justify-between gap-3 py-3" key={subject.id}><span className="min-w-0"><span className="block">{subject.name}</span>{subject.description && <span className="mt-1 block truncate text-xs text-text-secondary">{subject.description}</span>}</span><button type="button" onClick={async () => { if (confirm(`Xóa môn ${subject.name}? Tài liệu sẽ về Chưa phân loại.`)) { await apiFetch(`/subjects/${subject.id}`, { method: 'DELETE' }); load(); } }} className="shrink-0 text-xs text-danger">Xóa</button></li>)}{!subjects.length && <li className="py-4 text-xs text-text-secondary">Chưa có môn học.</li>}</ul></div>
  </>;
}
