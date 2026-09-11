import type { SVGProps } from 'react';

export type IconName =
  | 'add' | 'arrow_back' | 'auto_awesome' | 'auto_stories' | 'bolt' | 'check_circle' | 'chevron_left' | 'chevron_right'
  | 'close' | 'download' | 'error' | 'folder' | 'folder_open' | 'grid_view' | 'hourglass_top'
  | 'fullscreen' | 'key_off' | 'library_books' | 'menu' | 'more_vertical' | 'notifications' | 'progress_activity' | 'quiz' | 'refresh' | 'remove'
  | 'school' | 'search' | 'send' | 'settings' | 'upload' | 'upload_file' | 'assignment' | 'bar_chart' | 'visibility' | 'visibility_off';

const paths: Record<IconName, React.ReactNode> = {
  add: <path d="M12 5v14M5 12h14" />,
  arrow_back: <path d="M20 12H4m6-6-6 6 6 6" />,
  auto_awesome: <><path d="m12 3 1.5 5.2L19 10l-5.5 1.8L12 17l-1.5-5.2L5 10l5.5-1.8L12 3Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" /></>,
  auto_stories: <><path d="M4 5.5c2.8-1 5.2-.4 8 1.5 2.8-1.9 5.2-2.5 8-1.5v13c-2.8-1-5.2-.4-8 1.5-2.8-1.9-5.2-2.5-8-1.5v-13Z" /><path d="M12 7v13" /></>,
  bolt: <path d="m13 2-8 12h6l-1 8 9-13h-6l0-7Z" />,
  assignment: <><rect x="6" y="4" width="12" height="16" rx="2" /><path d="M9 4.5h6v3H9zM9 11h6M9 15h4" /></>,
  bar_chart: <path d="M5 20V11M12 20V4M19 20v-6" />,
  check_circle: <><circle cx="12" cy="12" r="8.5" /><path d="m8.5 12 2.3 2.3 4.8-5" /></>,
  chevron_left: <path d="m14.5 5-7 7 7 7" />,
  chevron_right: <path d="m9.5 5 7 7-7 7" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  download: <><path d="M12 4v10M8.5 10.5 12 14l3.5-3.5M5 19h14" /></>,
  error: <><circle cx="12" cy="12" r="8.5" /><path d="M12 8v5M12 16h.01" /></>,
  folder: <path d="M3.5 7.5a2 2 0 0 1 2-2h4l1.7 2H18.5a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-9Z" />,
  folder_open: <path d="M3.5 8a2 2 0 0 1 2-2h4l1.5 2h7.7a1.8 1.8 0 0 1 1.7 2.4l-2.1 6.3a2 2 0 0 1-1.9 1.3H4.5a2 2 0 0 1-1.9-2.6l1.6-5A2 2 0 0 1 6.1 9H20" />,
  fullscreen: <path d="M8 4H4v4m12-4h4v4M8 20H4v-4m16 0v4h-4" />,
  grid_view: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
  hourglass_top: <><path d="M6 4h12M6 20h12M7 4c0 4 2 5 5 8 3-3 5-4 5-8M7 20c0-4 2-5 5-8 3 3 5 4 5 8" /></>,
  key_off: <><circle cx="8.5" cy="14.5" r="3" /><path d="M10.6 12.4 19 4M13 15h5v2h2v2h-4M4 4l16 16" /></>,
  library_books: <><path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4Z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  more_vertical: <path d="M12 5.5h.01M12 12h.01M12 18.5h.01" strokeWidth="3.5" />,
  notifications: <><path d="M6 16h12l-1.5-2v-4a4.5 4.5 0 0 0-9 0v4L6 16Z" /><path d="M10 19h4" /></>,
  progress_activity: <path d="M20 12a8 8 0 1 1-2.3-5.7M20 5v5h-5" />,
  quiz: <><rect x="5" y="4" width="14" height="16" rx="2" /><path d="M9.5 9.5a2.5 2.5 0 1 1 4 2c-1 .8-1.5 1.3-1.5 2.5M12 17h.01" /></>,
  refresh: <path d="M19 8V4m0 0h-4m4 0-3 3a7 7 0 1 0 2.1 7.4" />,
  remove: <path d="M5 12h14" />,
  search: <><circle cx="10.5" cy="10.5" r="5.5" /><path d="m15 15 4 4" /></>,
  school: <><path d="m3 10 9-5 9 5-9 5-9-5Z" /><path d="M7 12.3V16c2.6 2 7.4 2 10 0v-3.7M21 10v6" /></>,
  send: <path d="m4 5 16 7-16 7 3-7-3-7Zm3 7h13" />,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.1 2.1-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-3v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2.1-2.1.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H5.3v-3h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.1-2.1.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2h3v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.1 2.1-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2v3h-.2a1.7 1.7 0 0 0-1.5 1Z" /></>,
  upload: <><path d="M12 16V4M8 8l4-4 4 4M5 19h14" /></>,
  upload_file: <><path d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="M14 3v5h5M12 17V10m-3 3 3-3 3 3" /></>,
  visibility: <><path d="M2.5 12s3.2-5.5 9.5-5.5 9.5 5.5 9.5 5.5-3.2 5.5-9.5 5.5S2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
  visibility_off: <><path d="m3 3 18 18M10.6 6.7A10.7 10.7 0 0 1 12 6.5c6.3 0 9.5 5.5 9.5 5.5a17.7 17.7 0 0 1-3 3.5M6.2 8.3A17.2 17.2 0 0 0 2.5 12s3.2 5.5 9.5 5.5c1.6 0 3-.4 4.2-1" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
};

export function Icon({ name, className, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>{paths[name]}</svg>;
}
