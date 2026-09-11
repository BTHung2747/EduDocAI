import { apiUrl } from './api-url';

export type DocumentStatus = 'PROCESSING' | 'READY' | 'FAILED';
export type Subject = { id: string; name: string; description?: string | null };
export type SubjectAssignmentSource = 'MANUAL' | 'AI';
export type DocumentItem = { id: string; subjectId?: string | null; displayName: string; originalName: string; mimeType: string; extension: string; sizeBytes: number; status: DocumentStatus; pageCount?: number | null; errorCode?: string | null; errorMessage?: string | null; subjectAssignmentSource?: SubjectAssignmentSource | null; subjectConfidence?: number | null; subjectAssignedAt?: string | null; createdAt: string; updatedAt: string; subject?: Subject | null };
export type DocumentSection = { id: string; title?: string | null; pageStart?: number | null; pageEnd?: number | null; contentText: string };
export type AnalysisStatus = 'NOT_GENERATED' | 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
type AnalysisPending = { status: 'NOT_GENERATED' | 'QUEUED' | 'RUNNING' };
type AnalysisFailed = { status: 'FAILED'; errorCode?: string; errorMessage?: string; retryAllowed?: boolean };
type AnalysisSucceeded = { status: 'SUCCEEDED'; documentId: string; documentName: string; provider?: string | null; model?: string | null; promptVersion: string; completedAt?: string | null };
export type SummaryView = AnalysisPending | AnalysisFailed | (AnalysisSucceeded & { summary: { summary: string; scope: { pageStart: number; pageEnd: number; chunkIds: string[] } } });
export type TopicsView = AnalysisPending | AnalysisFailed | (AnalysisSucceeded & { topics: { topics: Array<{ title: string; shortSummary: string; pageStart: number; pageEnd: number; chunkIds: string[] }> } });
export type Citation = { chunkId: string; documentName: string; pageStart: number | null; pageEnd: number | null; section: string | null; excerpt: string };
export type GroundedAnswer = { grounded: true; answer: string; citations: Citation[] } | { grounded: false; answer: null; citations: []; refusalReason: 'NOT_FOUND_IN_SELECTED_DOCUMENTS' };

export type QuestionSourceType = 'AI' | 'MANUAL' | 'IMPORT';
export type QuestionStatus = 'DRAFT' | 'APPROVED';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type QuestionOptions = { A: string; B: string; C: string; D: string };
export type QuestionItem = { id: string; subjectId: string | null; sourceType: QuestionSourceType; status: QuestionStatus; text: string; options: QuestionOptions; correctOptionKey: keyof QuestionOptions; explanation: string; difficulty: Difficulty; citations: Array<{ documentId: string; chunkId: string; pageStart: number | null; pageEnd: number | null; quote: string }>; createdAt: string; updatedAt: string };
export type AiJob = { id: string; type: 'DOCUMENT_ANALYSIS' | 'QUESTION_GENERATION'; status: 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED'; errorCode?: string | null; errorMessage?: string | null; createdAt: string; startedAt?: string | null; finishedAt?: string | null; resultJson?: { questionCount?: number } | null };
export type ImportItem = { id: string; orderIndex: number; text: string | null; options: QuestionOptions | null; correctOptionKey: keyof QuestionOptions | null; explanation: string | null; difficulty: Difficulty; isValid: boolean; errors: Array<{ field: string; message: string }> };
export type QuestionImport = { id: string; fileName: string; status: 'PREVIEW' | 'COMMITTED'; totalCount: number; validCount: number; invalidCount: number; items: ImportItem[] };

type Envelope<T> = { data: T; meta?: Record<string, unknown> };
export class ApiError extends Error { constructor(message: string, public code?: string) { super(message); } }

async function refreshAccessToken() {
  const response = await fetch(apiUrl('/auth/refresh'), { method: 'POST', credentials: 'include' });
  if (!response.ok) return null;
  const payload = await response.json() as { data?: { accessToken?: string } };
  if (!payload.data?.accessToken) return null;
  localStorage.setItem('edudocs_access_token', payload.data.accessToken);
  return payload.data.accessToken;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, retried = false): Promise<Envelope<T>> {
  const token = typeof window === 'undefined' ? null : localStorage.getItem('edudocs_access_token');
  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      ...init,
      credentials: 'include',
      headers: { ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers },
    });
  } catch {
    throw new ApiError('Không thể kết nối API. Hãy bảo đảm web và API đang chạy, sau đó thử lại.', 'API_UNREACHABLE');
  }
  if (response.status === 401 && !retried && typeof window !== 'undefined') {
    if (await refreshAccessToken()) return apiFetch<T>(path, init, true);
    localStorage.removeItem('edudocs_access_token');
    window.location.assign('/auth/login');
    throw new ApiError('Phiên đăng nhập đã hết hạn.', 'UNAUTHORIZED');
  }
  if (!response.ok) {
    const value = await response.json().catch(() => null);
    throw new ApiError(value?.error?.message || 'Không thể hoàn thành yêu cầu.', value?.error?.code);
  }
  if (response.status === 204) return { data: undefined as T };
  return response.json() as Promise<Envelope<T>>;
}

export async function downloadDocument(path: string, filename: string) {
  const token = localStorage.getItem('edudocs_access_token');
  const response = await fetch(apiUrl(path), { credentials: 'include', headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!response.ok) {
    const value = await response.json().catch(() => null);
    throw new ApiError(value?.error?.message || 'Không thể tải tài liệu.', value?.error?.code);
  }
  const url = URL.createObjectURL(await response.blob());
  const anchor = window.document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function createDocumentObjectUrl(path: string, retried = false): Promise<string> {
  const token = localStorage.getItem('edudocs_access_token');
  let response: Response;
  try {
    response = await fetch(apiUrl(path), { credentials: 'include', headers: token ? { Authorization: `Bearer ${token}` } : {} });
  } catch {
    throw new ApiError('Không thể kết nối API. Hãy bảo đảm web và API đang chạy, sau đó thử lại.', 'API_UNREACHABLE');
  }
  if (response.status === 401 && !retried) {
    if (await refreshAccessToken()) return createDocumentObjectUrl(path, true);
    localStorage.removeItem('edudocs_access_token');
    window.location.assign('/auth/login');
    throw new ApiError('Phiên đăng nhập đã hết hạn.', 'UNAUTHORIZED');
  }
  if (!response.ok) {
    const value = await response.json().catch(() => null);
    throw new ApiError(value?.error?.message || 'Không thể tải tài liệu.', value?.error?.code);
  }
  return URL.createObjectURL(await response.blob());
}

export const bytes = (value: number) => value < 1024 * 1024 ? `${Math.max(1, Math.round(value / 1024))} KB` : `${(value / 1024 / 1024).toFixed(1)} MB`;
