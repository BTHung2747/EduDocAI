'use client';

import Link from 'next/link';
import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ApiError, apiFetch, DocumentItem, DocumentSection, downloadDocument, GroundedAnswer, SummaryView, TopicsView } from '../../../../lib/api-client';
import { DocumentStatusBadge } from '../../../../components/documents/status-badge';
import { PdfDocumentViewer } from '../../../../components/documents/pdf-document-viewer';
import { Icon } from '../../../../components/ui/icon';
import { FigmaDocumentIcon } from '../../../../components/ui/figma-document-icon';

type DetailContent = { document: DocumentItem; sections: DocumentSection[] };
type AiTab = 'summary' | 'topics' | 'ask';

const viewerControlClass = 'inline-flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-[background-color,color,transform] duration-150 ease-out hover:bg-surface-soft hover:text-text active:translate-y-px active:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-40';
const aiTabClass = 'border-b-2 px-1 pb-3 text-xs font-medium transition-[background-color,border-color,color] duration-150 ease-out hover:bg-surface-soft hover:text-text active:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20';

function readableError(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function classifyTitle(title?: string | null): 'chapter' | 'section' | 'figure' | 'citation' | 'normal' {
  if (!title) return 'normal';
  const t = title.trim();
  if (/^trang\s*\d+$/i.test(t)) return 'normal';
  if (/chương|phần|chapter|part/i.test(t) || (t.length > 5 && t === t.toUpperCase() && /[A-ZÀ-Ỹ]/.test(t))) return 'chapter';
  if (/^(\d+(\.\d+)*\.?|[IVXLCDM]+\.?)\s/i.test(t)) return 'section';
  if (/hình|bảng|figure|table|sơ đồ|biểu đồ/i.test(t)) return 'figure';
  if (/lưu ý|ghi chú|chú ý|định nghĩa|khái niệm|trích dẫn|>|note/i.test(t)) return 'citation';
  return 'section';
}

function AnalysisState({ status, message }: { status: string; message?: string }) {
  const text = status === 'NOT_GENERATED' ? 'Chưa có phân tích cho tài liệu này.' : status === 'QUEUED' ? 'Phân tích đang chờ xử lý.' : status === 'RUNNING' ? 'AI đang đọc tài liệu.' : message || 'Không thể tải kết quả phân tích.';
  return <div className="flex min-h-44 flex-col items-center justify-center px-5 text-center"><Icon name={status === 'RUNNING' || status === 'QUEUED' ? 'hourglass_top' : 'auto_awesome'} className="mb-2 h-[30px] w-[30px] text-text-secondary" /><p className="text-sm font-semibold text-text">{text}</p><p className="mt-1 text-xs text-text-secondary">Kết quả chỉ được tạo bởi tác vụ AI nền, không tạo trong khi bạn đang xem.</p></div>;
}

export default function DocumentDetailPage({ params }: { params: Promise<{ documentId: string }> }) {
  const { documentId } = use(params);
  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [sections, setSections] = useState<DocumentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentError, setContentError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [zoom, setZoom] = useState(100);
  const [find, setFind] = useState('');
  const [showFind, setShowFind] = useState(false);
  const [tab, setTab] = useState<AiTab>('ask');
  const [summary, setSummary] = useState<SummaryView | null>(null);
  const [topics, setTopics] = useState<TopicsView | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisConfigured, setAnalysisConfigured] = useState(true);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState<GroundedAnswer | null>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const viewerRef = useRef<HTMLElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const loadDocument = useCallback(async () => {
    setLoading(true);
    setContentError(null);
    try {
      const detail = await apiFetch<DocumentItem>(`/documents/${documentId}`);
      setDocument(detail.data);
      if (detail.data.status === 'READY') {
        const content = await apiFetch<DetailContent>(`/documents/${documentId}/content`);
        setSections(content.data.sections);
      } else {
        setSections([]);
      }
    } catch (error) {
      setContentError(readableError(error, 'Không thể mở tài liệu.'));
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  const loadAnalysis = useCallback(async (kind: 'summary' | 'topics') => {
    setAnalysisLoading(true);
    setAnalysisError(null);
    try {
      if (kind === 'summary') {
        const response = await apiFetch<SummaryView>(`/documents/${documentId}/summary`);
        setSummary(response.data);
      } else {
        const response = await apiFetch<TopicsView>(`/documents/${documentId}/topics`);
        setTopics(response.data);
      }
    } catch (error) {
      if (error instanceof ApiError && error.code === 'AI_NOT_CONFIGURED') setAnalysisConfigured(false);
      setAnalysisError(readableError(error, 'Không thể tải phân tích.'));
    } finally {
      setAnalysisLoading(false);
    }
  }, [documentId]);

  useEffect(() => { void loadDocument(); }, [loadDocument]);

  useEffect(() => {
    setPage(1);
  }, [documentId]);

  useEffect(() => {
    if (document?.status !== 'PROCESSING') return;
    const interval = window.setInterval(() => void loadDocument(), 4_000);
    return () => window.clearInterval(interval);
  }, [document?.status, loadDocument]);

  useEffect(() => {
    if (document?.status !== 'READY') return;
    if (tab === 'summary' && !summary) void loadAnalysis('summary');
    if (tab === 'topics' && !topics) void loadAnalysis('topics');
  }, [document?.status, loadAnalysis, summary, tab, topics]);

  useEffect(() => {
    const syncFullscreenState = () => setIsFullscreen(globalThis.document.fullscreenElement === viewerRef.current);
    globalThis.document.addEventListener('fullscreenchange', syncFullscreenState);
    return () => globalThis.document.removeEventListener('fullscreenchange', syncFullscreenState);
  }, []);

  const pageCount = Math.max(1, document?.pageCount ?? sections.reduce((maximum, section) => Math.max(maximum, section.pageEnd ?? section.pageStart ?? 1), 1));

  useEffect(() => {
    setPage((value) => Math.min(value, pageCount));
  }, [pageCount]);

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  function updatePageInput(value: string) {
    if (!/^\d*$/.test(value)) return;
    setPageInput(value);
    if (value) setPage(Math.min(pageCount, Math.max(1, Number(value))));
  }

  function commitPageInput() {
    setPageInput(String(page));
  }

  const visibleSections = useMemo(() => sections.filter((section) => {
    const onPage = page >= (section.pageStart ?? 1) && page <= (section.pageEnd ?? section.pageStart ?? pageCount);
    const matches = !find.trim() || section.contentText.toLowerCase().includes(find.trim().toLowerCase()) || section.title?.toLowerCase().includes(find.trim().toLowerCase());
    return onPage && matches;
  }), [find, page, pageCount, sections]);

  useEffect(() => {
    const query = find.trim().toLowerCase();
    if (!query) return;
    const match = sections.find((section) => section.contentText.toLowerCase().includes(query) || section.title?.toLowerCase().includes(query));
    if (match?.pageStart) setPage(Math.min(pageCount, Math.max(1, match.pageStart)));
  }, [find, pageCount, sections]);

  async function requestAnalysis() {
    setAnalysisError(null);
    try {
      await apiFetch('/ai/jobs', { method: 'POST', body: JSON.stringify({ type: 'DOCUMENT_ANALYSIS', documentId }) });
      setSummary(null);
      setTopics(null);
      await loadAnalysis(tab === 'topics' ? 'topics' : 'summary');
    } catch (error) {
      if (error instanceof ApiError && error.code === 'AI_NOT_CONFIGURED') setAnalysisConfigured(false);
      setAnalysisError(readableError(error, 'Không thể tạo tác vụ phân tích.'));
    }
  }

  async function ask() {
    if (!question.trim()) return;
    setAsking(true);
    setAnswer(null);
    setAnswerError(null);
    try {
      const response = await apiFetch<GroundedAnswer>(`/documents/${documentId}/ask`, { method: 'POST', body: JSON.stringify({ question: question.trim() }) });
      setAnswer(response.data);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'AI_NOT_CONFIGURED') setAnalysisConfigured(false);
      setAnswerError(readableError(error, 'Không thể hỏi AI về tài liệu này.'));
    } finally {
      setAsking(false);
    }
  }

  function openCitation(pageStart?: number) {
    if (pageStart) setPage(Math.min(pageCount, Math.max(1, pageStart)));
  }

  function toggleViewerFullscreen() {
    const viewer = viewerRef.current;
    if (!viewer) return;
    if (globalThis.document.fullscreenElement === viewer) {
      void globalThis.document.exitFullscreen();
      return;
    }
    void viewer.requestFullscreen().catch(() => undefined);
  }

  async function download() {
    try {
      await downloadDocument(`/documents/${documentId}/download`, document?.displayName ?? 'document');
    } catch (error) {
      setContentError(readableError(error, 'Không thể tải tài liệu.'));
    }
  }

  if (loading) return <div className="space-y-5"><div className="h-8 w-48 animate-pulse rounded bg-surface-soft" /><div className="h-[560px] animate-pulse rounded-[14px] bg-surface-soft" /></div>;
  if (!document) return <div className="rounded-[14px] border border-danger/20 bg-danger-soft p-5 text-sm text-danger">{contentError ?? 'Không tìm thấy tài liệu.'} <button onClick={() => void loadDocument()} className="ml-2 font-bold underline">Thử lại</button></div>;

  const activeView = tab === 'summary' ? summary : topics;
  const isNotGenerated = activeView?.status === 'NOT_GENERATED';
  const isPdf = document.extension.toLowerCase() === 'pdf';

  return (
    <div className="document-detail-v2 max-w-[1120px]">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-sm text-text-secondary"><Link href="/documents" className="inline-flex items-center gap-1 text-primary hover:text-primary-hover"><FigmaDocumentIcon name="detail-back" className="h-3 w-3 object-contain" />Thư viện tài liệu</Link><span className="text-text-secondary">/</span><span className="truncate text-text">{document.displayName}</span></nav>
      <header className="mb-6 flex flex-col gap-4">
        <div className="min-w-0 max-w-[780px]"><h1 className="text-[28px] font-medium leading-[38.5px] tracking-[-.025em] text-text">{document.displayName}</h1><div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-muted"><span className="rounded-md bg-primary-soft px-2 py-1 font-medium text-primary">Môn học: {document.subject?.name ?? 'Chưa phân loại'}</span>{document.subjectAssignmentSource === 'AI' && <span title={document.subjectConfidence !== null && document.subjectConfidence !== undefined ? `Độ tin cậy ${Math.round(document.subjectConfidence * 100)}%` : 'AI đề xuất'} className="rounded-full border border-[#c7c9f8] bg-primary-soft px-2 py-1 font-medium text-primary">AI đề xuất</span>}<span className="rounded-md bg-[#eef2f6] px-2 py-1 font-medium text-[#475467]">{document.extension.toUpperCase()}</span><span>{document.pageCount ? `${document.pageCount} trang` : 'Đang xác định số trang'}</span><span className="text-border">•</span><span>{document.sizeBytes ? `${(document.sizeBytes / 1024 / 1024).toFixed(1)} MB` : 'Đang xác định dung lượng'}</span><DocumentStatusBadge status={document.status} /></div></div>
        {document.status === 'READY' && <div className="flex flex-wrap gap-3"><button type="button" onClick={() => void download()} className="btn-secondary font-medium"><FigmaDocumentIcon name="detail-download" className="h-3 w-3 object-contain" />Tải xuống</button><Link href="/questions" className="btn-primary font-medium"><FigmaDocumentIcon name="detail-generate" className="h-[15px] w-3 object-contain" />Tạo câu hỏi</Link></div>}
      </header>

      {document.status !== 'READY' ? <section className="rounded-[14px] border border-border bg-surface p-8 text-center"><DocumentStatusBadge status={document.status} /><h2 className="mt-4 text-lg font-bold text-text">{document.status === 'PROCESSING' ? 'Tài liệu đang được xử lý' : 'Không thể đọc nội dung tài liệu'}</h2><p className="mt-2 text-sm text-text-secondary">{document.status === 'PROCESSING' ? 'Trang này sẽ tự làm mới khi nội dung sẵn sàng.' : document.errorMessage ?? 'Bạn có thể quay lại thư viện để thử lại.'}</p></section> : (
        <div className="grid gap-6 lg:h-[810px] lg:grid-cols-12">
          <section ref={viewerRef} className="viewer-shell min-w-0 overflow-hidden rounded-[14px] border border-border bg-surface lg:col-span-7 lg:flex lg:h-full lg:flex-col">
            <div className="flex min-h-12 flex-wrap items-center gap-2 border-b border-border px-3 py-2 sm:px-4">
              <div className="flex items-center gap-2"><button type="button" aria-label="Trang trước" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className={viewerControlClass}><FigmaDocumentIcon name="detail-previous" className="h-3 w-2 object-contain" /></button><div className="flex items-center gap-1"><input aria-label="Số trang" type="text" inputMode="numeric" pattern="[0-9]*" value={pageInput} onChange={(event) => updatePageInput(event.target.value)} onBlur={commitPageInput} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }} className="h-7 w-9 rounded-md border border-border bg-surface text-center text-xs font-medium outline-none transition-[border-color,box-shadow] duration-150 ease-out hover:border-[#c7c9f8] focus:border-primary focus:ring-2 focus:ring-primary/15" /><span className="text-xs font-medium text-text-secondary">/ {pageCount}</span></div><button type="button" aria-label="Trang sau" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)} className={viewerControlClass}><FigmaDocumentIcon name="detail-next" className="h-3 w-2 object-contain" /></button></div>
              {showFind && <label className="relative min-w-[150px] flex-1"><FigmaDocumentIcon name="detail-find" className="pointer-events-none absolute left-2 top-1/2 h-[15px] w-[15px] -translate-y-1/2 object-contain" /><input autoFocus value={find} onChange={(event) => setFind(event.target.value)} placeholder="Tìm trong tài liệu" className="h-8 w-full rounded-md border border-border pl-8 pr-2 text-xs outline-none focus:border-primary" /></label>}
              <div className="ml-auto flex items-center gap-1"><button type="button" aria-label="Thu nhỏ" onClick={() => setZoom((value) => Math.max(75, value - 10))} className={viewerControlClass}><FigmaDocumentIcon name="detail-minus" className="h-3 w-3 object-contain" /></button><span className="w-10 text-center text-xs font-medium text-text-secondary">{zoom}%</span><button type="button" aria-label="Phóng to" onClick={() => setZoom((value) => Math.min(150, value + 10))} className={viewerControlClass}><Icon name="add" className="h-[18px] w-[18px]" /></button><span className="mx-1 h-4 w-px bg-border" /><button type="button" aria-label="Tìm trong tài liệu" aria-pressed={showFind} onClick={() => setShowFind((value) => !value)} className={`${viewerControlClass} ${showFind ? 'bg-primary-soft text-primary' : ''}`}><FigmaDocumentIcon name="detail-find" className="h-[15px] w-[15px] object-contain" /></button><button type="button" aria-label={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'} aria-pressed={isFullscreen} onClick={toggleViewerFullscreen} className={`${viewerControlClass} ${isFullscreen ? 'bg-primary-soft text-primary' : ''}`}><FigmaDocumentIcon name="detail-fullscreen" className="h-[15px] w-[15px] object-contain" /></button></div>
            </div>
            <div className="min-h-[620px] select-text bg-white lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
              <div style={{ fontSize: `${zoom}%` }} className="mx-auto flex max-w-[620px] flex-col px-8 py-8">
                {contentError ? (
                  <div className="rounded-lg bg-danger-soft p-4 text-sm text-danger">{contentError}</div>
                ) : visibleSections.length === 0 ? (
                  <div className="flex min-h-96 items-center justify-center text-center text-sm text-text-secondary">Không có nội dung khớp với trang hiện tại.</div>
                ) : (
                  <>
                    {/* Page Header Stamp - Rendered once per page */}
                    <div className="mb-6 flex items-center justify-between border-b border-[#E1E5EE] pb-2 text-[12px] font-medium uppercase tracking-wider text-[#687188]">
                      <span className="max-w-[420px] truncate">{document.displayName}</span>
                      <span className="shrink-0">TRANG {page}</span>
                    </div>

                    {visibleSections.map((section) => {
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
                        <article key={section.id} className="mb-8 flex flex-col gap-5 last:mb-0">
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
                )}
              </div>
            </div>
          </section>

          <aside className="min-w-0 overflow-hidden rounded-[14px] border border-border bg-surface lg:col-span-5 lg:flex lg:h-full lg:flex-col">
            <div className="border-b border-border px-4 pt-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft"><Icon name="auto_awesome" className="h-4 w-4 text-primary" /></span><span><h2 className="text-sm font-bold text-text">Trợ lý học tập AI</h2><p className="text-xs text-text-secondary">Mô hình RAG liên kết tài liệu</p></span></div><span className="rounded-full bg-primary-soft px-2 py-1 text-[11px] font-medium text-primary">Gắn liền tài liệu</span></div><div className="mt-4 grid grid-cols-3"><button onClick={() => setTab('summary')} className={`${aiTabClass} ${tab === 'summary' ? 'border-primary text-primary' : 'border-transparent text-text-secondary'}`}>Tóm tắt</button><button onClick={() => setTab('topics')} className={`${aiTabClass} ${tab === 'topics' ? 'border-primary text-primary' : 'border-transparent text-text-secondary'}`}>Chủ đề</button><button onClick={() => setTab('ask')} className={`${aiTabClass} ${tab === 'ask' ? 'border-primary text-primary' : 'border-transparent text-text-secondary'}`}>Hỏi AI</button></div></div>
            <div className="min-h-[530px] p-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
              {!analysisConfigured ? <div className="rounded-[10px] border border-warning/25 bg-warning-soft p-4"><Icon name="key_off" className="h-5 w-5 text-warning" /><h3 className="mt-2 text-sm font-bold text-text">AI chưa được cấu hình</h3><p className="mt-1 text-sm text-text-secondary">Quản trị viên cần cấu hình dịch vụ AI trước khi dùng tính năng này.</p></div> : tab === 'ask' ? <>
                <p className="text-sm text-text-secondary">Hỏi về nội dung trong tài liệu này. Câu trả lời chỉ dùng các đoạn được trích xuất.</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => setQuestion('Tóm tắt nội dung chính của trang này.')} className="prompt-chip">Tóm tắt trang này</button><button type="button" onClick={() => setQuestion('Các khái niệm quan trọng cần ghi nhớ là gì?')} className="prompt-chip">Khái niệm chính</button><button type="button" onClick={() => setQuestion('Giải thích ví dụ trong tài liệu.')} className="prompt-chip">Giải thích ví dụ</button></div><textarea value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={1_000} rows={4} placeholder="Ví dụ: Khái niệm quan trọng nhất là gì?" className="detail-question-input mt-4 w-full resize-none rounded-[10px] border border-border p-3 text-sm outline-none placeholder:text-text-secondary focus:border-primary" /><button type="button" onClick={() => void ask()} disabled={asking || !question.trim()} className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-white disabled:opacity-50"><Icon name="send" className="h-[18px] w-[18px]" />{asking ? 'Đang tìm trong tài liệu...' : 'Gửi câu hỏi'}</button>
                {answerError && <p className="mt-4 rounded-lg bg-danger-soft p-3 text-sm text-danger">{answerError}</p>}
                {answer?.grounded && <div className="mt-5"><p className="whitespace-pre-wrap text-sm leading-6 text-text">{answer.answer}</p><h3 className="mt-5 text-xs font-medium uppercase tracking-[.08em] text-text-secondary">Nguồn tham chiếu</h3><div className="mt-2 space-y-2">{answer.citations.map((citation) => <button type="button" key={citation.chunkId} onClick={() => openCitation(citation.pageStart ?? undefined)} className="citation-card w-full rounded-[10px] border border-border bg-surface-soft p-3 text-left"><span className="block text-xs font-medium text-primary">{citation.section || 'Tài liệu'}{citation.pageStart ? ` · trang ${citation.pageStart}${citation.pageEnd && citation.pageEnd !== citation.pageStart ? `–${citation.pageEnd}` : ''}` : ''}</span><span className="mt-1 line-clamp-3 block text-xs leading-5 text-text-secondary">{citation.excerpt}</span><span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">Nhảy tới vị trí này<Icon name="chevron_right" className="h-3.5 w-3.5" /></span></button>)}</div></div>}
                {answer && !answer.grounded && <div className="mt-5 rounded-[10px] bg-surface-soft p-4 text-sm text-text-secondary">Không tìm thấy thông tin này trong tài liệu hiện tại.</div>}
              </> : analysisLoading && !activeView ? <div className="space-y-3 py-5"><div className="h-4 animate-pulse rounded bg-surface-soft" /><div className="h-4 w-5/6 animate-pulse rounded bg-surface-soft" /><div className="h-4 w-2/3 animate-pulse rounded bg-surface-soft" /></div> : analysisError ? <div className="rounded-lg bg-danger-soft p-4 text-sm text-danger">{analysisError}<button onClick={() => void loadAnalysis(tab === 'topics' ? 'topics' : 'summary')} className="ml-2 font-bold underline">Thử lại</button></div> : isNotGenerated ? <><AnalysisState status="NOT_GENERATED" /><button type="button" onClick={() => void requestAnalysis()} className="mx-auto flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white"><Icon name="auto_awesome" className="h-[18px] w-[18px]" />Tạo phân tích</button></> : activeView && activeView.status !== 'SUCCEEDED' ? <AnalysisState status={activeView.status} message={activeView.status === 'FAILED' ? activeView.errorMessage : undefined} /> : tab === 'summary' && summary?.status === 'SUCCEEDED' ? <div><p className="whitespace-pre-wrap text-sm leading-7 text-text">{summary.summary.summary}</p><button type="button" onClick={() => openCitation(summary.summary.scope.pageStart)} className="mt-5 rounded-lg bg-primary-soft px-3 py-2 text-xs font-semibold text-primary">Xem phạm vi: trang {summary.summary.scope.pageStart}–{summary.summary.scope.pageEnd}</button><p className="mt-4 text-xs text-text-secondary">{summary.provider} · {summary.model}</p></div> : tab === 'topics' && topics?.status === 'SUCCEEDED' ? <div className="space-y-3">{topics.topics.topics.map((topic) => <button type="button" key={`${topic.title}-${topic.pageStart}`} onClick={() => openCitation(topic.pageStart)} className="w-full rounded-[10px] border border-border p-3 text-left hover:border-primary"><span className="block text-sm font-bold text-text">{topic.title}</span><span className="mt-1 line-clamp-3 block text-sm leading-5 text-text-secondary">{topic.shortSummary}</span><span className="mt-2 block text-xs font-semibold text-primary">Trang {topic.pageStart}–{topic.pageEnd}</span></button>)}</div> : null}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
