'use client';

import Link from 'next/link';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';

import { apiFetch, bytes, DocumentItem, Subject } from '../../../lib/api-client';
import { DocumentStatusBadge } from '../../../components/documents/status-badge';
import { Icon } from '../../../components/ui/icon';
import { FigmaDocumentIcon } from '../../../components/ui/figma-document-icon';

type ListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  quota?: { usedBytes: number; limitBytes: number };
  maxUploadBytes?: number;
};

const acceptedExtensions = ['pdf', 'docx', 'txt'];

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(value));
}

function FileMark({ extension }: { extension: string }) {
  const type = extension.toUpperCase();
  const icon = type === 'PDF' ? 'file-pdf' : 'file-docx';
  const colors = type === 'PDF' ? 'bg-[#fef3f2]' : type === 'DOCX' ? 'bg-primary-soft' : 'bg-success-soft';
  return <span aria-label={type} className={'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ' + colors}><FigmaDocumentIcon name={icon} className="h-[18px] w-[18px] object-contain" /></span>;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [meta, setMeta] = useState<ListMeta>({ page: 1, pageSize: 10, total: 0, totalPages: 1 });
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [updatingSubjectId, setUpdatingSubjectId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '10' });
      if (appliedQuery) params.set('q', appliedQuery);
      if (subjectId) params.set('subjectId', subjectId);
      if (status) params.set('status', status);
      const [listed, subjectList] = await Promise.all([
        apiFetch<DocumentItem[]>('/documents?' + params.toString()),
        apiFetch<Subject[]>('/subjects'),
      ]);
      setDocuments(listed.data);
      setMeta((listed.meta ?? { page: 1, pageSize: 10, total: listed.data.length, totalPages: 1 }) as ListMeta);
      setSubjects(subjectList.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể tải thư viện tài liệu.');
    } finally {
      setLoading(false);
    }
  }, [appliedQuery, page, status, subjectId]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setAppliedQuery(query.trim());
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [query]);
  useEffect(() => {
    if (!documents.some((document) => document.status === 'PROCESSING')) return;
    const interval = window.setInterval(() => void load(), 4_000);
    return () => window.clearInterval(interval);
  }, [documents, load]);

  function resetFilters() {
    setQuery('');
    setAppliedQuery('');
    setSubjectId('');
    setStatus('');
    setPage(1);
  }

  function pickFile(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null;
    setUploadError(null);
    if (!next) return setFile(null);
    const extension = next.name.split('.').pop()?.toLowerCase();
    if (!extension || !acceptedExtensions.includes(extension)) {
      setFile(null);
      setUploadError('Chỉ hỗ trợ tệp PDF, DOCX hoặc TXT.');
      return;
    }
    if (meta.maxUploadBytes && next.size > meta.maxUploadBytes) {
      setFile(null);
      setUploadError('Tệp vượt quá giới hạn ' + bytes(meta.maxUploadBytes) + '.');
      return;
    }
    setFile(next);
  }

  async function upload() {
    if (!file) {
      setUploadError('Chọn một tệp để tải lên.');
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const body = new FormData();
      body.append('file', file);
      await apiFetch<DocumentItem>('/documents', { method: 'POST', body });
      setShowUpload(false);
      setFile(null);
      setPage(1);
      await load();
    } catch (cause) {
      setUploadError(cause instanceof Error ? cause.message : 'Tải tài liệu lên không thành công.');
    } finally {
      setUploading(false);
    }
  }

  async function retry(documentId: string) {
    try {
      await apiFetch('/documents/' + documentId + '/retry', { method: 'POST' });
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể thử lại tài liệu.');
    }
  }

  async function changeSubject(document: DocumentItem, nextSubjectId: string) {
    setUpdatingSubjectId(document.id);
    try {
      await apiFetch<DocumentItem>('/documents/' + document.id, {
        method: 'PATCH',
        body: JSON.stringify({ subjectId: nextSubjectId || null }),
      });
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể cập nhật môn học.');
    } finally {
      setUpdatingSubjectId(null);
    }
  }

  const hasFilters = Boolean(query || subjectId || status);

  return (
    <div className="documents-v2 max-w-[1120px]">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] font-medium leading-9 tracking-[-.025em] text-text">Thư viện tài liệu</h1>
          <p className="mt-1 text-sm text-text-secondary">Quản lý, xử lý tài liệu học tập và trích xuất kiến thức bằng AI.</p>
        </div>
        <button type="button" onClick={() => { setShowUpload(true); setUploadError(null); }} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-[18px] text-sm font-medium text-white transition-[background-color,transform] duration-150 ease-out hover:bg-primary-hover active:translate-y-px active:bg-[#3f40b3] focus:outline-none focus:ring-2 focus:ring-primary/30">
          <FigmaDocumentIcon name="upload" className="h-[18px] w-[18px] object-contain" />
          Tải tài liệu lên
        </button>
      </header>

      <section className="rounded-[14px] border border-border bg-surface p-4">
        <div className="grid gap-3 lg:grid-cols-12 lg:items-center">
          <label className="relative block lg:col-span-5">
            <FigmaDocumentIcon name="search" className="pointer-events-none absolute left-3 top-1/2 h-[19px] w-[19px] -translate-y-1/2 object-contain" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên tài liệu..." className="library-filter-control h-10 w-full rounded-md border border-border bg-surface px-10 text-sm text-text outline-none placeholder:text-text-muted focus:border-primary" />
          </label>
          <label className="relative block lg:col-span-3"><select value={subjectId} onChange={(event) => { setSubjectId(event.target.value); setPage(1); }} className="library-filter-control h-10 w-full appearance-none rounded-md border border-border bg-surface px-3 pr-10 text-sm text-text outline-none focus:border-primary">
              <option value="">Tất cả môn học</option>
              {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select><FigmaDocumentIcon name="chevron-down" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 object-contain" /></label>
          <label className="relative block lg:col-span-3"><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="library-filter-control h-10 w-full appearance-none rounded-md border border-border bg-surface px-3 pr-10 text-sm text-text outline-none focus:border-primary">
              <option value="">Tất cả trạng thái</option>
              <option value="READY">Sẵn sàng</option>
              <option value="PROCESSING">Đang xử lý</option>
              <option value="FAILED">Không thể đọc</option>
            </select><FigmaDocumentIcon name="chevron-down" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 object-contain" /></label>
          <button type="button" onClick={resetFilters} disabled={!hasFilters} className="inline-flex h-10 items-center justify-self-start gap-1 rounded-md px-2 text-sm font-medium text-text-secondary transition-colors duration-150 hover:bg-primary-soft hover:text-primary disabled:text-text-muted disabled:hover:bg-transparent disabled:opacity-60 lg:col-span-1"><FigmaDocumentIcon name="reset" className="h-4 w-4 object-contain" />Đặt lại</button>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-[14px] border border-border bg-surface">
        {error && <div className="m-4 flex items-start gap-3 rounded-lg border border-danger/20 bg-danger-soft p-3 text-sm text-danger"><Icon name="error" className="h-[19px] w-[19px] shrink-0" /><div className="flex-1">{error}</div><button onClick={() => void load()} className="font-semibold underline">Thử lại</button></div>}
        {loading ? <div className="space-y-3 p-5">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-14 animate-pulse rounded-lg bg-surface-soft" />)}</div> : documents.length === 0 ? (
          <div className="flex min-h-[474px] flex-col items-center justify-center px-5 text-center">
            <Icon name="folder_open" className="mb-3 h-[34px] w-[34px] text-text-muted" />
            <h2 className="text-base font-semibold text-text">Chưa có tài liệu phù hợp</h2>
            <p className="mt-1 max-w-sm text-sm text-text-secondary">Tải một tài liệu PDF, DOCX hoặc TXT để bắt đầu học cùng EduDocs AI.</p>
            <button type="button" onClick={() => setShowUpload(true)} className="mt-4 text-sm font-semibold text-primary">Tải tài liệu lên</button>
          </div>
        ) : <>
          <div className="hidden h-12 grid-cols-[minmax(260px,1.8fr)_minmax(130px,.8fr)_145px_145px_120px] items-center gap-4 border-b border-border bg-surface-table-header px-5 text-xs font-medium uppercase tracking-[.05em] text-text-secondary md:grid">
            <span>Tên tài liệu</span><span>Môn học</span><span>Trạng thái</span><span>Thời gian cập nhật</span><span className="text-right">Thao tác</span>
          </div>
          <div className="divide-y divide-border">
            {documents.map((document) => (
              <div key={document.id} className="document-row grid min-h-[72px] gap-3 px-4 py-3 md:grid-cols-[minmax(260px,1.8fr)_minmax(130px,.8fr)_145px_145px_120px] md:items-center md:gap-4 md:px-5">
                <Link href={'/documents/' + document.id} className="document-row-link flex min-w-0 items-center gap-3 rounded-lg outline-none focus:ring-2 focus:ring-primary/30">
                  <FileMark extension={document.extension} />
                  <span className="min-w-0"><span className="block truncate text-sm font-medium text-text">{document.displayName}</span><span className="mt-0.5 block text-xs text-text-muted">{document.extension.toUpperCase()}{document.pageCount ? ` · ${document.pageCount} trang` : ''} · {bytes(document.sizeBytes)}</span></span>
                </Link>
                <div className="min-w-0">
                  <select aria-label={`Đổi môn học cho ${document.displayName}`} value={document.subjectId ?? ''} disabled={updatingSubjectId === document.id} onChange={(event) => void changeSubject(document, event.target.value)} className="h-8 w-full min-w-0 rounded-md border border-transparent bg-transparent px-2 text-sm text-text-secondary outline-none transition-colors hover:border-border focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-wait">
                    <option value="">Chưa phân loại</option>
                    {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                  </select>
                  {document.subjectAssignmentSource === 'AI' && <span title={document.subjectConfidence !== null && document.subjectConfidence !== undefined ? `Độ tin cậy ${Math.round(document.subjectConfidence * 100)}%` : 'AI đề xuất'} className="ml-2 inline-flex h-5 items-center rounded-full border border-[#c7c9f8] bg-primary-soft px-1.5 text-[10px] font-medium text-primary">AI đề xuất</span>}
                </div>
                <DocumentStatusBadge status={document.status} />
                <span className="text-sm text-text-secondary">{formatDate(document.updatedAt)}</span>
                <div className="flex items-center justify-end gap-1">
                  {document.status === 'READY' && <Link href={'/documents/' + document.id} className="text-right text-xs font-semibold text-primary hover:underline">Học với AI</Link>}
                  {document.status === 'PROCESSING' && <Link href={'/documents/' + document.id} className="text-right text-xs font-semibold text-text-secondary hover:text-primary">Xem tiến độ</Link>}
                  {document.status === 'FAILED' && <button type="button" onClick={() => void retry(document.id)} className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold text-danger hover:bg-danger-soft"><Icon name="refresh" className="h-[17px] w-[17px]" />Tải lại file</button>}
                  <Link aria-label={'Mở ' + document.displayName} href={'/documents/' + document.id} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-surface-soft hover:text-primary"><Icon name="more_vertical" className="h-[19px] w-[19px]" /></Link>
                </div>
              </div>
            ))}
          </div>
        </>}
      </section>

      {meta.totalPages > 1 && <div className="mt-5 flex items-center justify-between text-sm text-text-secondary"><span>Hiển thị {documents.length} / {meta.total} tài liệu</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="h-9 rounded-lg border border-border px-3 font-semibold disabled:opacity-45">Trước</button><button type="button" disabled={page >= meta.totalPages} onClick={() => setPage((value) => value + 1)} className="h-9 rounded-lg border border-border px-3 font-semibold disabled:opacity-45">Sau</button></div></div>}

      {showUpload && <div role="dialog" aria-modal="true" aria-labelledby="upload-title" className="fixed inset-0 z-50 flex items-end bg-text/35 p-0 sm:items-center sm:justify-center sm:p-5">
        <div className="w-full max-w-lg rounded-t-[14px] bg-surface p-5 sm:rounded-[14px]">
          <div className="flex items-start justify-between gap-4"><div><h2 id="upload-title" className="text-lg font-semibold text-text">Tải tài liệu lên</h2><p className="mt-1 text-sm text-text-secondary">Hỗ trợ PDF, DOCX và TXT{meta.maxUploadBytes ? ' · tối đa ' + bytes(meta.maxUploadBytes) : ''}.</p></div><button aria-label="Đóng" onClick={() => setShowUpload(false)} className="text-text-muted hover:text-text"><Icon name="close" className="h-5 w-5" /></button></div>
          <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-[10px] border border-dashed border-border bg-surface-soft px-5 py-8 text-center hover:border-primary"><Icon name="upload_file" className="h-[30px] w-[30px] text-primary" /><span className="mt-2 text-sm font-semibold text-text">{file ? file.name : 'Chọn tệp từ máy tính'}</span><span className="mt-1 text-xs text-text-secondary">Tệp sẽ được xử lý nền sau khi tải lên.</span><input className="sr-only" type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" onChange={pickFile} /></label>
          {uploadError && <p className="mt-3 text-sm text-danger">{uploadError}</p>}
          {uploading && <div className="mt-4 h-1 overflow-hidden rounded-full bg-primary-soft"><div className="h-full w-2/3 animate-pulse bg-primary" /></div>}
          <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setShowUpload(false)} disabled={uploading} className="h-10 rounded-lg px-4 text-sm font-semibold text-text-secondary">Hủy</button><button type="button" onClick={() => void upload()} disabled={uploading || !file} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-white disabled:opacity-50">{uploading ? 'Đang tải lên...' : 'Tải lên'}</button></div>
        </div>
      </div>}
    </div>
  );
}
