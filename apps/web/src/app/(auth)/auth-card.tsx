'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { apiUrl } from '../../lib/api-url';
import { Icon, IconName } from '../../components/ui/icon';

type Mode = 'login' | 'register' | 'forgot';
type AuthUser = { id: string; email: string; displayName: string; role: string };

const content: Record<Mode, { title: string; description: string; action: string }> = {
  login: { title: 'Đăng nhập vào không gian học tập', description: 'Quản lý tài liệu, giáo trình và khai thác kiến thức học thuật cùng AI.', action: 'Đăng nhập vào không gian học tập' },
  register: { title: 'Tạo tài khoản học tập', description: 'Bắt đầu tổ chức tài liệu và xây dựng không gian học tập cá nhân.', action: 'Tạo tài khoản' },
  forgot: { title: 'Khôi phục mật khẩu', description: 'Nhập email đào tạo để nhận hướng dẫn đặt lại mật khẩu.', action: 'Gửi hướng dẫn' },
};

const features: Array<{ icon: IconName; title: string; text: string }> = [
  { icon: 'folder', title: 'Quản lý thư viện giáo trình', text: 'Lưu trữ PDF, slide bài giảng và tài liệu DOCX trong một không gian riêng.' },
  { icon: 'auto_awesome', title: 'Hỏi đáp AI theo ngữ cảnh', text: 'Truy xuất nội dung có nguồn dẫn từ chính tài liệu bạn đã tải lên.' },
  { icon: 'quiz', title: 'Ngân hàng câu hỏi ôn tập', text: 'Tạo và quản lý câu hỏi để củng cố kiến thức trước kỳ thi.' },
];

export function AuthCard({ mode }: { mode: Mode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const view = content[mode];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true); setMessage(null); setIsError(false);
    const form = new FormData(event.currentTarget);
    const body = mode === 'register'
      ? { displayName: form.get('displayName'), email: form.get('email'), password: form.get('password'), confirmPassword: form.get('confirmPassword') }
      : mode === 'login' ? { email: form.get('email'), password: form.get('password') } : { email: form.get('email') };
    try {
      const response = await fetch(apiUrl(`/auth/${mode === 'forgot' ? 'forgot-password' : mode}`), { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const payload = await response.json() as { data?: { accessToken?: string; user?: AuthUser }; error?: { message?: string } };
      if (!response.ok) throw new Error(payload.error?.message ?? 'Không thể hoàn thành yêu cầu.');
      if (mode === 'login' && payload.data?.accessToken) {
        localStorage.setItem('edudocs_access_token', payload.data.accessToken);
        if (payload.data.user) localStorage.setItem('edudocs_user', JSON.stringify(payload.data.user));
        window.location.assign('/documents');
        return;
      }
      if (mode === 'register') {
        window.location.assign('/auth/login?registered=1');
        return;
      }
      setMessage('Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.');
    } catch (error) { setIsError(true); setMessage(error instanceof Error ? error.message : 'Không thể kết nối máy chủ. Vui lòng thử lại.'); }
    finally { setIsPending(false); }
  }

  return <section className="auth-shell">
    <div className="auth-form-column">
      <div className="auth-form-content">
        <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-white"><Icon name="auto_stories" className="h-5 w-5" /></span><div className="flex items-center gap-1"><span className="text-xl font-semibold tracking-[-.025em] text-[#111827]">EduDocs</span><span className="text-xl font-semibold tracking-[-.025em] text-primary">.ai</span><span className="ml-1 rounded bg-[#eef0ff] px-2 py-0.5 text-xs font-medium text-primary">Cổng Học Tập</span></div></div>
        <div className="mt-8"><h1 className="text-[26px] font-medium leading-8 tracking-[-.025em] text-[#111827]">{view.title}</h1><p className="mt-2 text-sm leading-5 text-[#6b7280]">{view.description}</p></div>
        {mode === 'login' && <><button type="button" disabled title="Đăng nhập SSO trường học chưa được cấu hình" className="auth-sso-button mt-6"><Icon name="school" className="h-4 w-4 text-primary" />Đăng nhập bằng Email Trường học (.edu.vn)</button><div className="auth-divider"><span>HOẶC MÃ SINH VIÊN / EMAIL</span></div></>}
        <form className="mt-6 space-y-4" onSubmit={submit}>
          {mode === 'register' && <AuthField label="Tên hiển thị" name="displayName" autoComplete="name" placeholder="Ví dụ: Nguyễn Minh Tuấn" />}
          <AuthField label={mode === 'login' ? 'Mã số sinh viên hoặc Email đào tạo' : 'Email đào tạo'} name="email" type="email" autoComplete="email" placeholder={mode === 'login' ? 'Ví dụ: 21020088 hoặc tuan.nm@edu.vn' : 'tuan.nm@edu.vn'} icon="school" />
          {mode !== 'forgot' && <div><div className="mb-1.5 flex items-center justify-between"><label className="text-xs font-semibold text-[#374151]" htmlFor="password">Mật khẩu</label>{mode === 'login' && <Link className="text-xs font-semibold text-primary hover:underline" href="/auth/forgot-password">Quên mật khẩu?</Link>}</div><div className="relative"><Icon name="key_off" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" /><input id="password" name="password" required minLength={8} type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="••••••••" className="auth-input has-leading-icon has-trailing-action" /><button aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-text-muted hover:bg-surface-soft"><Icon name={showPassword ? 'visibility_off' : 'visibility'} className="h-4 w-4" /></button></div></div>}
          {mode === 'register' && <AuthField label="Xác nhận mật khẩu" name="confirmPassword" type="password" autoComplete="new-password" placeholder="Nhập lại mật khẩu" icon="key_off" />}
          {mode === 'login' && <label className="flex items-center gap-2 pt-1 text-xs text-[#4b5563]"><input type="checkbox" className="h-4 w-4 rounded border-border accent-primary" />Ghi nhớ thiết bị này trong 30 ngày</label>}
          {message && <p aria-live="polite" className={`rounded-lg px-3 py-2 text-sm ${isError ? 'bg-danger-soft text-danger' : 'bg-success-soft text-success'}`}>{message}</p>}
          <button className="auth-submit" disabled={isPending} type="submit">{isPending ? 'Đang xử lý...' : view.action}<Icon name="chevron_right" className="h-4 w-4" /></button>
        </form>
      </div>
      <div className="auth-footer"><span>{mode === 'login' ? 'Chưa có tài khoản?' : mode === 'register' ? 'Đã có tài khoản?' : 'Nhớ mật khẩu?'}</span><Link href={mode === 'login' ? '/auth/register' : '/auth/login'}>{mode === 'login' ? 'Tạo tài khoản' : 'Đăng nhập'}</Link><span className="hidden sm:inline">Quy chuẩn bảo mật</span><span className="hidden sm:inline">•</span><span className="hidden sm:inline">Hỗ trợ kỹ thuật</span></div>
    </div>
    <aside className="auth-showcase">
      <div><span className="auth-showcase-chip"><i />Trợ lý học thuật cá nhân hoá AI</span><h2>Số hoá tài liệu, trích xuất tri thức & tối ưu hoá điểm số</h2><p>Được thiết kế riêng cho sinh viên và giảng viên các khối ngành kỹ thuật, kinh tế và công nghệ thông tin.</p></div>
      <div className="space-y-3">{features.map((feature) => <div key={feature.title} className="auth-feature"><span><Icon name={feature.icon} className="h-4 w-4" /></span><div><h3>{feature.title}</h3><p>{feature.text}</p></div></div>)}</div>
      <blockquote className="auth-quote">“Trợ lý AI giúp mình tra cứu nhanh khái niệm và ôn tập hiệu quả hơn từ chính tài liệu đã tải lên.”<footer><b>T</b><span><strong>Sinh viên EduDocs</strong><small>Không gian học tập cá nhân</small></span></footer></blockquote>
    </aside>
  </section>;
}

function AuthField({ label, name, type = 'text', autoComplete, placeholder, icon }: { label: string; name: string; type?: string; autoComplete: string; placeholder: string; icon?: IconName }) {
  return <label className="block text-xs font-semibold text-[#374151]">{label}<span className="relative mt-1.5 block">{icon && <Icon name={icon} className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />}<input name={name} type={type} autoComplete={autoComplete} placeholder={placeholder} required className={'auth-input' + (icon ? ' has-leading-icon' : '')} /></span></label>;
}
