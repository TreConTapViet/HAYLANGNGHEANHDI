# 05 – Giữ cho web mượt

## Một câu để nhớ

> Để 60 khung hình mỗi giây, mỗi khung chỉ có **16,6 mili-giây**. Mọi quyết định ở đây đều để bảo vệ khoảng thời gian bé xíu đó.

## Ngân sách

| Chỉ số | Mục tiêu | Nói đời thường |
|---|---|---|
| Thời gian mỗi khung | ≤ 16,6ms | Không giật khi vuốt |
| Tác vụ dài | Không có tác vụ > 50ms lúc cuộn / chuyển cảnh | Trang không "đơ" nửa giây |
| LCP | < 2,5s (4G giả lập, CPU chậm 4×) | Thấy nội dung chính nhanh |
| CLS | < 0,1 | Không nhảy chữ, nhảy ảnh |
| INP | < 200ms | Chạm là có phản hồi |
| JS ban đầu | < 150KB nén | Tải nhẹ trên 4G |
| Ảnh hero | < 200KB | |
| Ảnh bìa trong danh sách | ≤ 20KB mỗi ảnh | |

## Luật chuyển động (ngắn gọn, dễ nhớ)

1. **Chỉ làm động `transform` và `opacity`.** Hai thứ này chạy trên GPU, không bắt trình duyệt tính lại bố cục. Đừng làm động `width`, `height`, `top`, `left`.
2. **Đĩa quay bằng CSS thuần.** Nó chạy ở "luồng riêng", nên dù trang đang bận khởi động trình phát YouTube, đĩa vẫn quay đều.
3. **Cuộn:** Lenis làm cuộn mềm, GSAP ScrollTrigger lo parallax; các cập nhật được gom vào cùng một nhịp vẽ.
4. **Đọc xong rồi mới ghi.** Đừng xen kẽ "đo kích thước" với "đổi kiểu" trong cùng một khung, vì mỗi lần xen kẽ bắt trình duyệt tính lại bố cục.
5. **`will-change` chỉ khi sắp dùng, xong thì bỏ.** Dùng tràn lan làm tốn bộ nhớ GPU và khiến máy yếu chậm hơn.
6. **Tiến độ bài hát ghi vào biến CSS**, không cập nhật state của React mỗi khung.
7. **Đừng lạm dụng làm mờ nền lớn** (`backdrop-filter`, `blur` rộng). Dùng ảnh vẽ sẵn hoặc chuyển sắc cho nhẹ.

## Với tài nguyên

| Thứ | Cách chăm |
|---|---|
| Ảnh | WebP (AVIF thêm sau nếu đo thấy đáng), ba cỡ (64/300/640), đặt sẵn `width`/`height`, `loading="lazy"`, `decoding="async"` |
| Nạp trước | Chương kế tiếp (ảnh nghệ sĩ + 1–2 bìa đầu) khi khách sắp tới |
| Video nền | Nén nhẹ, `muted loop playsinline`, tạm dừng khi cuộn ra khỏi màn hình |
| Máy yếu | Nhận biết qua `hardwareConcurrency`, `deviceMemory`, `saveData`: thay video bằng ảnh tĩnh, bớt lớp parallax |
| Font | Tự host, chỉ lấy ký tự tiếng Việt + Latin, `font-display: swap` |
| Trình phát YouTube | Chỉ tạo khi khách chạm bài đầu tiên; tải thư viện của họ lúc đó chứ không tải lúc mở trang |
| Bản nghe thử | Thẻ `<audio>`, rất nhẹ, không iframe |
| Chia mã | Landing là gói chính; màn đĩa than và trình phát tải thêm khi cần |

## Phần nặng nhất là… trình phát YouTube

Đó là lý do mình xử lý riêng:
- Tạo muộn, chỉ một cái, dùng lại cho mọi bài.
- Không để nó chạy khi chưa cần.
- Đĩa than quay bằng CSS nên không "chết theo" khi trình phát bận.
- Trên máy rất yếu, có thể chọn **chỉ dùng bản nghe thử** (không iframe), đổi lại chỉ nghe 30 giây.

## Tôn trọng người dùng

- **Giảm chuyển động:** nếu hệ điều hành bật, tắt parallax, chuyển cảnh chỉ còn mờ dần, đĩa quay chậm hoặc đứng yên.
- Có một nút nhỏ ở chân trang để tắt hiệu ứng nặng (chỉ trong phiên, không lưu).

## Cách đo cho chắc

| Công cụ | Dùng để |
|---|---|
| Chrome DevTools → Performance | Xem từng khung, tác vụ dài, chỗ tính lại bố cục |
| DevTools → Rendering → FPS meter | Xem nhanh số khung hình khi vuốt |
| Lighthouse (mobile) | LCP, CLS, thời gian bị chặn |
| Giả lập CPU chậm 4×–6× | Tưởng tượng điện thoại tầm trung |
| **Điện thoại thật** (một Android tầm trung, một iPhone) | Không công cụ nào thay thế được |

Cách làm việc: sau mỗi chặng lớn (landing, bảng bài, đĩa than), đo và ghi vào bảng dưới đây. Con số cũ giúp phát hiện chuyện "mới thêm gì đó là chậm hẳn".

| Ngày | Chặng | Thiết bị | FPS khi cuộn | LCP | JS nén | Ghi chú |
|---|---|---|---|---|---|---|
| | | | | | | |
