# EduDocs AI — UI Design Standard V2

**Trạng thái:** Nguồn chuẩn bắt buộc cho mọi màn hình web mới và mọi lần chỉnh sửa UI từ thời điểm ban hành.  
**Thay thế:** `WEB_HOC_TAP_UI_DESIGN_STANDARD_V1.md` (V1 chỉ còn giá trị lịch sử).  
**Nguồn thiết kế:** Figma `XWEPSRW2Tw2kk86Tv9IEhp`, frames [Thư viện tài liệu](https://www.figma.com/design/XWEPSRW2Tw2kk86Tv9IEhp/Untitled?node-id=1-573) và [Chi tiết tài liệu + AI Study](https://www.figma.com/design/XWEPSRW2Tw2kk86Tv9IEhp/Untitled?node-id=1-2).

## 1. Quy tắc nguồn chuẩn

1. Figma frames nêu trên là chuẩn thị giác và hierarchy thông tin cho Documents/AI Study.
2. Tài liệu này là chuẩn triển khai token, component, responsive, trạng thái và accessibility cho toàn bộ web EduDocs AI.
3. Không sao chép HTML export của Figma. Triển khai bằng component hiện có, dữ liệu thật và token dưới đây.
4. Không thêm font, màu, radius, shadow, gradient, icon set hoặc phong cách riêng ngoài chuẩn này nếu chưa cập nhật V2.
5. Một màn chưa có frame riêng phải tái sử dụng app shell, component và quy tắc hierarchy trong tài liệu này; không tự tạo visual language mới.

## 2. Tính cách giao diện

- Học tập chuyên sâu, sáng, gọn, ưu tiên khả năng quét thông tin và đọc dài.
- Nội dung chính dùng surface phẳng + border mảnh; không biến dữ liệu thành các card trang trí.
- AI là trợ lý nằm cạnh tài liệu, có căn cứ, không phải một dashboard độc lập.
- Mỗi vùng hành động chỉ có một CTA primary.
- Không gradient, glass effect, glow hoặc shadow nặng. Figma có khai báo gradient hai stop cùng màu cho nền; khi code dùng màu nền phẳng, không render gradient.

## 3. Design tokens

### 3.1 Màu light mode

| Token | Giá trị | Dùng cho |
| --- | --- | --- |
| `background` | `#F4F6FB` | Nền ứng dụng |
| `surface` | `#FFFFFF` | Topbar, card, bảng, input, modal |
| `surface-subtle` | `#FAFBFD` | Toolbar viewer |
| `surface-table-header` | `#F4F6FB` | Header bảng |
| `sidebar` | `#121A2E` | Sidebar desktop |
| `sidebar-border` | `#1E293B` | Divider/sidebar storage |
| `text` | `#141B2E` | Tiêu đề, dữ liệu chính |
| `text-strong` | `#192033` | Breadcrumb hiện tại, nội dung nhấn mạnh |
| `text-secondary` | `#565E75` | Body, input placeholder |
| `text-muted` | `#687188` | Metadata |
| `nav-muted` | `#94A3B8` | Điều hướng không active |
| `nav-label` | `#64748B` | Nhãn nhóm sidebar |
| `border` | `#E1E5EE` | Border/divider mặc định |
| `primary` | `#5B5CE2` | CTA, active nav, link, active tab |
| `primary-hover` | `#4849CB` | Hover CTA |
| `primary-soft` | `#F2F3FF` | Subject badge, vùng AI nhẹ |
| `success-bg` | `#ECFDF3` | Badge READY |
| `success-border` | `#ABEFCA` | Border READY |
| `success` | `#027A48` | Text READY |
| `success-dot` | `#12B76A` | Status dot READY |
| `warning-bg` | `#FFFAEB` | Badge PROCESSING |
| `warning-border` | `#FEDF89` | Border PROCESSING |
| `warning` | `#B54708` | Text PROCESSING |
| `danger-bg` | `#FEF3F2` | Badge FAILED/error |
| `danger-border` | `#FECDCA` | Border FAILED |
| `danger` | `#B42318` | Text FAILED/destructive |

Màu trạng thái chỉ dùng để truyền đạt trạng thái, luôn kèm nhãn chữ và icon/dot. Không dùng màu ngẫu nhiên theo môn học hay tài liệu.

### 3.2 Typography

Font chính: `Inter`. Fallback: `ui-sans-serif`, `system-ui`, `"Segoe UI"`, `sans-serif`.

| Style | Kích thước / line height | Weight | Dùng cho |
| --- | --- | --- | --- |
| Page title | `28/36px` | 500 | Library title, document title desktop |
| Detail title multiline | `28/38.5px` | 500 | Tên tài liệu dài |
| Section title | `20/28px` | 500 | Tiêu đề khối |
| Component title | `16/24px` | 500 | Panel/card/modal |
| Body | `14/20px` | 400 | Nội dung, input, dữ liệu bảng |
| Body emphasis | `14/20px` | 500 | Tên tài liệu, CTA, nav active |
| Metadata | `12/16px` | 400 | Loại file, trang, thời gian |
| Label/table header | `12/16px` | 500 | Nhãn, badge, table header |

- Page title mobile: `24/32px`.
- Header bảng viết hoa, tracking `0.6px`.
- Không dùng nội dung cần đọc nhỏ hơn 12px.
- Không dùng weight lớn hơn 500 trừ logo/asset đã được phê duyệt.

### 3.3 Spacing, radius, shadow

- Base grid: `4px`; spacing hợp lệ: `4, 8, 12, 16, 20, 24, 32`.
- Sidebar `260px`; header `68px`; desktop main bắt đầu tại `x = 292px` (`260 + 32`).
- Desktop main padding phải `32px`, padding dưới `28px`; các group lớn cách nhau `24px`.
- Button/input/select cao `40px`; icon button pagination `36px`; viewer control button `32px`.
- Mobile target chạm tối thiểu `44px`.

| Token | Giá trị | Dùng cho |
| --- | --- | --- |
| `radius-xs` | `6px` | Input trang, chip nhỏ, viewer control |
| `radius-sm` | `8px` | Nav active, icon button, pagination |
| `radius-md` | `10px` | Input, select, button, AI input |
| `radius-lg` | `14px` | Filter bar, table/viewer/AI card |
| `radius-pill` | `999px` | Status badge |

- Card/panel mặc định chỉ dùng `1px solid var(--border)`, không shadow.
- Primary button có thể dùng shadow viền rất nhẹ `0 1px 1px rgba(0,0,0,.05)`.
- Modal/popover mới được dùng `0 18px 45px rgba(32,39,61,.14)`.

## 4. App shell

### Desktop (>= 1024px)

- Sidebar cố định trái, `260px`, nền `sidebar`; topbar `68px`, bắt đầu sau sidebar.
- Sidebar logo ở khối `68px`, divider `sidebar-border`; navigation padding ngang `16px`, mỗi link `padding 8px 12px`, gap 4px.
- Link active nền `primary`, chữ/icon trắng, radius 8px. Link còn lại `nav-muted`.
- Khối storage nằm đáy sidebar, có divider trên; số liệu quota lấy API, không hard-code production flow.
- Header có search toàn hệ thống, notification với dot khi có thông báo, divider dọc, avatar, tên và metadata người dùng, chevron.
- Main không được chồng lên header/sidebar; dùng content width còn lại và scroll nội dung riêng của trang.

### Tablet/mobile (< 1024px)

- Chuyển sidebar thành drawer; header vẫn cao 68px.
- Padding nội dung `16px`; không cuộn ngang toàn trang ở 320px.
- Bảng có thể chuyển list row hoặc cuộn trong chính vùng bảng; không để body overflow-x.
- Viewer và AI Study xếp dọc; toolbar được wrap có kiểm soát.

## 5. Component chuẩn

### Button

- **Primary:** nền `primary`, chữ trắng, radius 10px, cao 40px, padding ngang 18px, icon + text cách 8px.
- **Secondary:** nền surface, border, chữ `text`, cao 40px, padding ngang 17px.
- **Ghost:** không nền/border, dùng cho reset filter hoặc action cấp thấp.
- Chỉ một primary CTA trong cùng action group: Library là `Tải tài liệu lên`; Detail là `Tạo câu hỏi` (chỉ active khi chức năng/sự cho phép sẵn sàng).
- Có default, hover, focus-visible, disabled, loading. Loading giữ nguyên kích thước button.

### Input, select, search

- Cao 40px, radius 10px, border `border`, padding ngang 13px; search có icon ở `14.5px` và text bắt đầu `41px`.
- Focus dùng border/ring `primary`; placeholder dùng `text-secondary`.
- Filter library desktop: grid 12 cột; search `5/12`, subject `3/12`, status `3/12`, reset ở cuối hàng.
- Không dùng placeholder thay label cho form có nghĩa vụ nhập liệu.

### Table tài liệu

- Bọc trong card radius 14px, border; table có min-width `800px` bên trong vùng scroll riêng.
- Header nền `surface-table-header`, label uppercase 12/16, tracking .6px.
- Cột: tên tài liệu ưu tiên lớn nhất; môn học; trạng thái; thời gian cập nhật; thao tác.
- Hàng chứa icon type 36px, tên 14/20 weight 500, metadata 12/16; action theo trạng thái (`Học với AI`, `Xem tiến độ`, `Tải lại file`).
- Pagination 36px, active nền primary/chữ trắng; disabled opacity 50%.

### Status và metadata badges

- Subject/file type: radius 6px, padding `4px 8px`, 12/16, primary-soft hoặc surface trung tính.
- READY: `success-bg` + `success-border` + dot `success-dot` 6px + text `success`.
- PROCESSING: `warning-bg` + `warning-border` + progress/dot + text `warning`.
- FAILED: `danger-bg` + `danger-border` + error icon/dot + text `danger`.

### Viewer và AI Study

- Detail page: breadcrumb, document title, metadata badges và header action group.
- Workspace desktop là grid 12 cột, gap `24px`: viewer `7/12`, AI panel `5/12`.
- Viewer và AI panel dùng card radius 14px; viewer toolbar cao 48px, nền `surface-subtle`, border dưới.
- AI panel gồm header, tabs `Tóm tắt` / `Chủ đề` / `Hỏi AI`, nội dung và input cố định ở đáy vùng panel khi đủ chiều cao.
- Tab active: text primary + underline primary 2px. Không dùng tab để điều hướng module lớn.
- AI answer bắt buộc hiển thị phạm vi/citation; citation có thể đưa người dùng về trang/chương liên quan.
- Nội dung AI không đủ căn cứ dùng state trung lập, không bịa đáp án/citation.

## 6. States

- **Loading:** skeleton giữ đúng geometry card/table/viewer; không dùng spinner full-page cho background job.
- **Empty:** thông điệp ngắn + một action phù hợp; không minh họa lớn.
- **Error:** xác định đối tượng gặp lỗi, nói dữ liệu có được giữ không và đưa action sửa (`Thử lại`, `Chọn file khác`). Không lộ stack trace/mã nội bộ.
- **AI not configured:** state riêng, rõ rằng AI cần được cấu hình; không mô phỏng câu trả lời.
- **Document processing:** status visible ở Library và Detail; polling không khóa UI.

## 7. Icon và asset

- Dùng một icon system nhất quán: SVG stroke nội bộ trong source web hoặc asset SVG đã được duyệt từ Figma.
- Không phụ thuộc Google Material Symbols hay font icon từ Internet.
- Icon navigation: 16–18px; icon action: 12–16px; icon-only button bắt buộc `aria-label`.
- Avatar/logo dùng asset được cấp quyền hoặc dữ liệu user thật; không copy URL asset tạm của Figma vào production code.

## 8. Accessibility và motion

- Tối thiểu WCAG AA cho text/border tương tác.
- Keyboard navigation, focus-visible, aria-label cho icon button, label gắn với input, `aria-live="polite"` cho trạng thái động.
- Màu không là tín hiệu duy nhất.
- Transition màu/border/opacity `120–180ms`; tôn trọng `prefers-reduced-motion`.
- Không parallax, animation nền, shimmer quá mức, gradient animation hoặc hiệu ứng gây nhiễu khi đọc.

## 9. Quy tắc nội dung

- Dùng tiếng Việt nhất quán: `Tài liệu`, `Môn học`, `Ngân hàng câu hỏi`, `Bài kiểm tra`, `Lượt làm`, `Căn cứ`.
- CTA bắt đầu bằng động từ: `Tải tài liệu lên`, `Tạo câu hỏi`, `Tải xuống`, `Thử lại`.
- Không dùng lorem ipsum trong UI demo; fixture phải là ngữ cảnh học tập tiếng Việt rõ ràng.
- Không hard-code tên, avatar, quota hay dữ liệu tài liệu Figma vào production flow.

## 10. Checklist nghiệm thu màn mới

- [ ] Dùng V2 tokens; không dùng token/màu/radius tự phát từ V1.
- [ ] App shell, spacing desktop/mobile và hierarchy khớp V2.
- [ ] Một CTA primary trên mỗi action group.
- [ ] Có loading, empty, error, disabled và status phù hợp.
- [ ] Nội dung AI có citation hoặc refusal rõ ràng.
- [ ] Không có scroll ngang body tại 320px.
- [ ] Không phụ thuộc font icon/network cho thành phần thiết yếu.
- [ ] Keyboard/focus/accessibility cơ bản hoạt động.

## Quyết định khóa

Từ thời điểm này, mọi task UI EduDocs AI phải viện dẫn **UI Design Standard V2**. Khi Figma có frame mới được duyệt, cập nhật V2 trước hoặc cùng lúc với implementation; không tự tạo một chuẩn song song.
