import type { DocumentStatus } from '../../lib/api-client';
import { Icon } from '../ui/icon';
const config: Record<DocumentStatus, [string, string, string]> = {
  READY: ['Sẵn sàng', 'border-[#abefca] bg-[#ecfdf3] text-[#027a48]', 'bg-[#027a48]'],
  PROCESSING: ['Đang xử lý', 'border-[#fedf89] bg-[#fffaeb] text-[#b54708]', 'bg-[#f79009]'],
  FAILED: ['Không thể đọc', 'border-[#fecdca] bg-[#fef3f2] text-[#b42318]', 'bg-[#f04438]'],
};

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  const [label, style, dot] = config[status];
  return <span className={'inline-flex w-fit justify-self-start whitespace-nowrap items-center gap-1.5 rounded-full border px-[11px] py-[5px] text-xs font-medium leading-4 transition-colors duration-150 ' + style}>{status === 'PROCESSING' ? <Icon name="progress_activity" className="h-3.5 w-3.5 animate-spin" /> : <span className={'h-1.5 w-1.5 rounded-full ' + dot} />}{label}</span>;
}
