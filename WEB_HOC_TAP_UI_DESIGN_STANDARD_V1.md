# WEB TÀI LIỆU HỌC TẬP — UI DESIGN STANDARD V1

**Trạng thái:** Nguồn tham chiếu bắt buộc cho Technical Spec và triển khai frontend  
**Prototype tham chiếu:** Hai màn hình Stitch `Thư viện tài liệu` và `Chi tiết tài liệu + AI`  
**Phạm vi:** Toàn bộ MVP web responsive

> Bản cập nhật sau khi nhận file ZIP Stitch. Khi có mâu thuẫn, `EDUDOCS_AI_MASTER_SPEC_V1.md` và `DESIGN.md` trong ZIP được ưu tiên.

---

## 1. Quy tắc nguồn chuẩn

1. Prototype hai màn hình khóa phong cách thị giác và cách tổ chức thông tin.
2. Tài liệu này khóa design token, component, responsive, trạng thái và accessibility.
3. Technical Spec phải viện dẫn prototype và tài liệu này; không mô tả một phong cách UI khác.
4. Khi code, không tự thêm màu, font, radius, shadow hoặc kiểu component ngoài danh sách đã quy định.
5. Các màn hình chưa có prototype phải tái sử dụng app shell và component đã khóa, không cần sáng tạo lại giao diện.

## 2. Tính cách giao diện

- Hiện đại, sáng sủa, tập trung vào việc học.
- Mật độ thông tin vừa phải, ưu tiên bảng và nội dung thật hơn card trang trí.
- AI xuất hiện như một công cụ trong tài liệu, không chiếm toàn bộ sản phẩm.
- Trạng thái hệ thống rõ ràng, luôn có nhãn chữ và hành động tiếp theo.
- Không dùng hiệu ứng thị giác làm người dùng mất tập trung khi đọc tài liệu hoặc làm bài.

## 3. Color tokens

### Light mode

| Token | Giá trị | Mục đích |
| --- | --- | --- |
| `background` | `#F4F6FB` | Nền ứng dụng |
| `surface` | `#FFFFFF` | Card, bảng, topbar, modal |
| `surface-soft` | `#F8F9FC` | Header bảng, vùng phụ |
| `sidebar` | `#121A2E` | Thanh điều hướng desktop |
| `text-primary` | `#192033` | Nội dung chính |
| `text-secondary` | `#687188` | Metadata, mô tả |
| `border` | `#E1E5EE` | Đường phân cách |
| `primary` | `#5B5CE2` | CTA, liên kết, focus |
| `primary-hover` | `#4849CB` | Hover CTA |
| `primary-soft` | `#EEEFFF` | Nền chọn, vùng AI nhẹ |
| `success` | `#16866F` | Thành công/Sẵn sàng |
| `success-soft` | `#E8F7F2` | Nền success badge |
| `warning` | `#B76519` | Đang xử lý/Cảnh báo |
| `warning-soft` | `#FFF3E4` | Nền warning badge |
| `danger` | `#BD4141` | Lỗi/Xóa |
| `danger-soft` | `#FFF0F0` | Nền danger badge |

### Dark mode tham khảo — chưa bắt buộc trong MVP

| Token | Giá trị |
| --- | --- |
| `background` | `#0D1118` |
| `surface` | `#151B25` |
| `surface-soft` | `#1B2230` |
| `sidebar` | `#0A0F18` |
| `text-primary` | `#EDF1F8` |
| `text-secondary` | `#A7B0C2` |
| `border` | `#2A3342` |
| `primary` | `#8586FF` |
| `primary-hover` | `#9C9DFF` |
| `primary-soft` | `#25274C` |
| `success` | `#4EC9A9` |
| `success-soft` | `#17372F` |
| `warning` | `#F1A552` |
| `warning-soft` | `#3A2A18` |
| `danger` | `#F17A7A` |
| `danger-soft` | `#3B2024` |

### Quy tắc màu

- Primary chỉ dùng cho hành động chính, liên kết, lựa chọn hiện tại và focus.
- Mỗi vùng chỉ có tối đa một nút Primary.
- Success/Warning/Danger chỉ thể hiện trạng thái, không dùng trang trí.
- Không dùng gradient ngoài biểu tượng logo.
- Không tạo thêm màu ngẫu nhiên cho từng card hoặc từng môn học.
- Màu không được là tín hiệu duy nhất; phải kèm icon hoặc nhãn chữ.

## 4. Typography

Font chính: `Inter`. Fallback: `ui-sans-serif`, `system-ui`, `Segoe UI`, `sans-serif`.

| Style | Size/Line height | Weight | Dùng cho |
| --- | --- | --- | --- |
| Page title | `28/34px` | 500 | Tiêu đề màn hình desktop |
| Section title | `20/28px` | 500 | Tiêu đề khu vực |
| Component title | `16/24px` | 500 | Card, modal, panel |
| Body | `14/21px` | 400 | Nội dung chính |
| Body emphasis | `14/21px` | 500 | Tên tài liệu, dữ liệu quan trọng |
| Secondary | `12/18px` | 400 | Metadata, chú thích |
| Label | `12/16px` | 500 | Field label, badge, table header |

Quy tắc:

- Không dùng weight lớn hơn 500 trong MVP.
- Mobile page title giảm còn `24/30px`.
- Không dùng chữ nhỏ hơn 12px cho nội dung cần đọc.
- Tiêu đề dùng sentence case; không viết hoa toàn bộ, trừ table header ngắn.

## 5. Spacing và kích thước

Base grid: `4px`.

- Khoảng cách hợp lệ: `4, 8, 12, 16, 20, 24, 32, 40px`.
- Content padding desktop: `24–32px`.
- Content padding mobile: `16px`.
- Khoảng cách giữa các section lớn: `24px`.
- Khoảng cách trong card/panel: `16–20px`.
- Button/input desktop cao tối thiểu `40px`.
- Mục tiêu chạm mobile cao/rộng tối thiểu `44px`.
- Icon inline: `16px`; icon điều hướng: `18px`; icon trạng thái: `12–14px`.

Không dùng khoảng cách tùy ý như `13px`, `27px` trong code chính thức; phải quy về token gần nhất.

## 6. Radius và shadow

| Token | Giá trị | Dùng cho |
| --- | --- | --- |
| `radius-sm` | `8px` | Icon button, input nhỏ |
| `radius-md` | `10px` | Button, input, tab item |
| `radius-lg` | `14px` | Card, bảng, panel |
| `radius-xl` | `18px` | Modal lớn, app preview |
| `radius-pill` | `999px` | Badge trạng thái |

- Card thông thường không dùng shadow; dùng border `1px`.
- Modal/popover dùng một shadow mềm: `0 18px 45px rgba(32,39,61,0.14)`.
- Không dùng glassmorphism, glow hoặc shadow nhiều lớp.
- Không bo tròn mọi phần tử; hàng bảng và vùng nội dung dài giữ bề mặt phẳng.

## 7. Layout hệ thống

### Desktop từ 1024px

- Sidebar rộng `260px`, nền tối, nằm bên trái.
- Topbar cao `68px`.
- Main content chiếm phần còn lại, padding ngang `32px`, dọc `28–32px`.
- Chi tiết tài liệu dùng hai cột: trình đọc `minmax(0, 1.45fr)` và AI panel `minmax(300px, 0.75fr)`.
- Bảng tài liệu ưu tiên độ rộng cột tên tài liệu.

### Tablet 768–1023px

- Sidebar có thể thu gọn chỉ còn icon hoặc chuyển thành thanh điều hướng ngang.
- Chi tiết tài liệu chuyển thành một cột; AI panel nằm dưới trình đọc.
- Toolbar được phép wrap thành hai hàng.

### Mobile dưới 768px

- Dùng topbar + menu drawer; không giữ sidebar cố định.
- Padding nội dung `16px`.
- Nút chính có thể full width khi đứng riêng.
- Bảng tài liệu chuyển thành list row hoặc ẩn các cột phụ; phải giữ tên và trạng thái.
- Không có cuộn ngang toàn trang.
- Trình đọc và AI panel luôn xếp dọc.

## 8. App shell

- Logo/tên sản phẩm ở đầu sidebar.
- Điều hướng theo thứ tự: Tổng quan, Môn học, Tài liệu, Ngân hàng câu hỏi, Bài kiểm tra, Kết quả, Cài đặt.
- Chỉ một mục active; active dùng `primary-soft` hoặc nền tím trong suốt kèm nhãn.
- Topbar gồm tìm kiếm toàn hệ thống, thông báo và tài khoản.
- Nút `Tải tài liệu lên` là CTA ưu tiên trong khu vực Tài liệu.
- Không đặt AI thành một mục điều hướng riêng.
- Dùng Material Symbols Outlined như bản Stitch hoặc ánh xạ toàn bộ sang đúng một icon set; không trộn nhiều bộ icon.

## 9. Component standards

### Button

- `Primary`: nền primary, chữ trắng; tối đa một nút mỗi nhóm hành động.
- `Secondary`: nền surface, border, chữ chính.
- `Ghost`: không nền/border, dùng cho hành động cấp thấp.
- `Danger`: chỉ xuất hiện trong bước xác nhận xóa.
- Có trạng thái default, hover, focus-visible, disabled và loading.
- Loading giữ nguyên chiều rộng nút và thay icon bằng spinner; không đổi label gây nhảy layout.

### Input, select và search

- Cao `40px` desktop, `44px` mobile.
- Border mặc định; focus dùng ring primary rõ ràng.
- Label luôn hiển thị với form quan trọng; placeholder không thay thế label.
- Error hiển thị dưới field bằng danger text và mô tả cách sửa.

### Card/panel

- Chỉ dùng để nhóm một chức năng hoặc đối tượng có ranh giới rõ.
- Không bọc card bên trong card nếu chỉ để trang trí.
- Card có surface, border và `radius-lg`; không shadow mặc định.

### Table tài liệu

- Header dùng surface-soft và label 12px/500.
- Hàng cao tối thiểu `60px`.
- Tên tài liệu là liên kết/hành động chính của hàng.
- Metadata nằm dưới tên, màu secondary.
- Hover chỉ thay nền nhẹ; không dịch chuyển hàng.
- Mobile giữ ít nhất tên tài liệu và trạng thái.

### Status badge

- `Sẵn sàng`: success.
- `Đang xử lý`: warning + spinner/progress.
- `Không đọc được`: danger + icon lỗi.
- Badge luôn có nhãn chữ; không chỉ hiển thị chấm màu.

### Tabs

- Dùng cho các nội dung cùng ngữ cảnh, ví dụ `Tóm tắt`, `Chủ đề`, `Hỏi AI`.
- Chỉ một tab active; active có underline primary và chữ primary.
- Không dùng tab để thay thế điều hướng giữa các module lớn.

### Modal upload

- Tiêu đề, mô tả định dạng, file input/dropzone và hai hành động `Hủy`/`Tải lên`.
- Validation trước khi gửi: định dạng, dung lượng, file rỗng.
- Sau khi upload, đóng modal và hiển thị tài liệu ở trạng thái `Đang xử lý`.
- Không khóa người dùng ở modal trong suốt thời gian AI xử lý.

## 10. Chuẩn UI dành riêng cho AI

1. Mọi nội dung AI phải ghi rõ phạm vi tài liệu đã dùng.
2. Câu trả lời phải có `Căn cứ`: tên file, trang/chương hoặc đoạn trích.
3. Nếu không đủ căn cứ, hiển thị thông báo trung lập và gợi ý chọn lại nguồn; không hiển thị câu trả lời suy đoán.
4. Phân biệt rõ `Đang tạo`, `Đã tạo`, `Không đủ căn cứ`, `Model lỗi`.
5. Nội dung AI chưa được người dùng duyệt phải có trạng thái `Bản nháp`.
6. Nút `Tạo câu hỏi` chỉ hoạt động khi tài liệu ở trạng thái `Sẵn sàng`.
7. Không dùng hiệu ứng lấp lánh/gradient quá mức; icon sparkles chỉ dùng cạnh hành động AI chính.

## 11. Loading, empty và error states

### Loading

- Skeleton giữ gần đúng bố cục nội dung sắp xuất hiện.
- Tác vụ dài hiển thị status + tiến trình nếu có.
- Không dùng spinner toàn trang cho tác vụ nền.

### Empty

- Một câu giải thích ngắn.
- Một hành động phù hợp, ví dụ `Tải tài liệu đầu tiên`.
- Không dùng minh họa lớn làm lấn át nội dung.

### Error

- Nói rõ đối tượng nào lỗi và dữ liệu có được giữ hay không.
- Có hành động cụ thể: `Thử lại`, `Chọn file khác` hoặc `Xem hướng dẫn`.
- Không chỉ hiển thị mã lỗi kỹ thuật.

## 12. Accessibility

- Tương phản chữ đạt tối thiểu WCAG AA.
- Tất cả thao tác dùng được bằng bàn phím.
- Focus-visible không được bị xóa.
- Icon-only button bắt buộc có `aria-label`.
- Form field có label liên kết đúng.
- Trạng thái động dùng `aria-live="polite"`; lỗi validation dùng `role="alert"`.
- Không phụ thuộc chỉ vào màu sắc.
- Tôn trọng `prefers-reduced-motion`.

## 13. Motion

- Transition UI ngắn `120–180ms` cho màu, border và opacity.
- Không dùng animation lặp vô hạn ngoài spinner đang xử lý.
- Không dùng parallax, background animation hoặc hiệu ứng nảy.
- Khi người dùng bật reduced motion, tắt toàn bộ chuyển động không cần thiết.

## 14. Content writing

- Giao diện MVP dùng tiếng Việt nhất quán.
- Nút bắt đầu bằng động từ: `Tải lên`, `Tạo câu hỏi`, `Thử lại`, `Lưu thay đổi`.
- Thông báo lỗi nói rõ cách sửa, tránh câu chung chung như “Đã có lỗi xảy ra”.
- Thuật ngữ cố định: `Tài liệu`, `Ngân hàng câu hỏi`, `Bài kiểm tra`, `Lượt làm`, `Căn cứ`.

## 15. Các điều Codex không được tự ý làm

- Không dựng thêm màn hình chỉ để “đẹp” khi chưa có trong task.
- Không thay primary color hoặc font.
- Không dùng quá nhiều card, gradient, glassmorphism, emoji hoặc icon cỡ lớn.
- Không biến Dashboard thành trang quảng cáo/hero.
- Không tạo layout desktop cố định gây cuộn ngang mobile.
- Không ẩn nguồn/căn cứ AI để giao diện gọn hơn.
- Không sử dụng dữ liệu lorem ipsum; dùng nội dung học tập tiếng Việt giống prototype.
- Không tự thêm dark/light toggle nếu task chưa yêu cầu; giao diện chỉ cần hỗ trợ theme bằng token.
- Không cài UI library mới nếu Technical Spec chưa chốt.

## 16. Checklist nghiệm thu UI

- [ ] Màn hình khớp app shell và design token.
- [ ] Chỉ có một CTA primary trong mỗi nhóm.
- [ ] Có đủ hover, focus, disabled, loading, empty và error states liên quan.
- [ ] Trạng thái tài liệu có icon + nhãn.
- [ ] AI answer có căn cứ hoặc thông báo không đủ nguồn.
- [ ] Dùng tốt ở 1440px, 1024px, 768px, 390px và 320px.
- [ ] Không có cuộn ngang toàn trang.
- [ ] Target chạm mobile tối thiểu 44px.
- [ ] Không có text dưới 12px cần đọc.
- [ ] Không thêm màu/font/radius ngoài token.
- [ ] Điều hướng và form dùng được bằng bàn phím.
- [ ] Không dựng thêm màn hình ngoài phạm vi task.

---

## Quyết định khóa

Hai màn hình prototype không phải toàn bộ UI của sản phẩm. Chúng là **mẫu chuẩn** để mọi màn hình còn lại được suy ra trong Technical Spec bằng cách tái sử dụng app shell, component, design token và trạng thái đã quy định ở trên.
