# 06 – Giao diện và cảm xúc

## Cảm xúc muốn tạo ra

Hãy nghĩ tới **một buổi tối nghe đĩa than ở nhà**: đèn dịu, màu ấm, tiếng kim đĩa chạm nhẹ. Nhưng chất liệu là của thế hệ nghệ sĩ trẻ: đậm, trẻ trung, có chút ngông.

Ba từ khóa: **ấm · sống động · gọn gàng.**

Giao diện không nên khoe hiệu ứng vì hiệu ứng. Mỗi chuyển động phải trả lời được câu "nó giúp người dùng hiểu điều gì?" (đĩa quay = nhạc đang chạy; bảng trượt lên = bạn vừa mở một nghệ sĩ).

## Mượn cảm hứng từ đâu (MotionSites, gói free)

| Mẫu | Mượn gì | Dùng ở |
|---|---|---|
| Album Flow | Chữ lớn, video nền, nhịp cuộn | Hero và chuyển chương |
| Vinyl | Mâm đĩa than, tông hoài cổ | Màn đĩa than |
| murmur | Bố cục "danh sách tập" | Danh sách bài |
| Audio Showcase | Widget player nhỏ | Mini player |

Gói free cho mở 3 prompt, nên lấy Album Flow, Vinyl, murmur; mini player tự viết theo ý tưởng.

## Chiếc đĩa than

Đây là "nhân vật chính" của web. Hình dung từ ngoài vào trong:

```
 ╭─────────────────────────────╮
 │ lớp ngoài: vân đĩa tối,     │
 │ có vệt sáng quét ngang      │
 │   ╭─────────────────────╮   │
 │   │ nhãn đĩa = ảnh bìa  │   │
 │   │ album (cắt tròn)    │   │
 │   │      ( ● ) lỗ giữa  │   │
 │   ╰─────────────────────╯   │
 ╰─────────────────────────────╯
        ◯ vòng nhỏ: hình nghệ sĩ / cảnh MV

   ┌─────────────────┐
   │  KHUNG MV        │  ← trình phát YouTube, ≥ 200×200,
   │  (nhìn thấy,     │    nằm cạnh đĩa, KHÔNG bị che
   │   không bị che)  │
   └─────────────────┘
```

Vài điều đã cân nhắc kỹ:
- **Đĩa quay, vệt sáng đứng yên.** Lớp ánh sáng đặt chồng lên và không quay, nên trông như ánh đèn phản chiếu thật.
- **Chỉ một phần tử quay** (bằng CSS), bên trong là ảnh và chuyển sắc tĩnh. Rẻ và mượt.
- **Khung MV nằm cạnh, không nằm dưới đĩa.** Điều khoản YouTube không cho che khung phát bằng bất cứ thứ gì, kể cả đĩa đẹp.
- **Điện thoại:** đĩa ở trên, khung MV ngay bên dưới. **Máy tính:** đĩa bên trái, khung MV bên phải.
- Ảnh bìa dùng cỡ 300px; chỉ lên 640px khi đĩa phóng to.

## Màu sắc

Màu nền và màu nhấn **đổi theo bài đang phát** (lấy từ ảnh bìa, tính sẵn lúc chuẩn bị).

```css
:root {
  --bg: #0b0b10;          /* nền tối, ấm một chút */
  --surface: #14141c;
  --text: #f4f1ea;        /* trắng ngà, đỡ chói hơn trắng thuần */
  --text-dim: #a8a59d;

  --c-dominant: #3a2a5c;  /* đổi theo bài */
  --c-accent: #ff7a45;    /* đổi theo bài */
}
```

Quy tắc: chữ trên nền động luôn đạt độ tương phản ≥ 4,5:1. Màu quá nhạt hoặc quá chói bị loại ngay trong bước chuẩn bị, để khỏi phải "chữa cháy" khi chạy.

## Chữ

| Vai trò | Gợi ý |
|---|---|
| Tên nghệ sĩ, tiêu đề lớn | Chữ đậm, cỡ rất lớn, **phải có đủ dấu tiếng Việt** |
| Nội dung thường | Sans trung tính, tối thiểu 16px trên điện thoại |
| Số, thời gian | Chữ số đều nhau (tabular) để không nhảy khi đếm |

Cỡ chữ dùng `clamp()` nên co giãn mượt từ điện thoại tới màn hình lớn.

## Khoảng cách và bo góc

Thang 4px: `4 8 12 16 24 32 48 64 96`. Bo góc: `8 / 16 / 28 / 999px`.

## Chuyển động

| Tên | Giá trị | Dùng cho |
|---|---|---|
| ease-out | `cubic-bezier(0.16, 1, 0.3, 1)` | Xuất hiện, trượt vào |
| ease-in-out | `cubic-bezier(0.65, 0, 0.35, 1)` | Chuyển chương |
| nhanh | 150ms | Hover, nhấn nút |
| vừa | 350ms | Mở / đóng bảng bài |
| chậm | 700ms | Chuyển chương, parallax |
| spring | độ cứng 300, giảm chấn 30 | Thả tay sau khi kéo |
| đĩa quay | 1 vòng / 6 giây, `linear` | Khi đang phát |

## Các mảnh ghép

| Mảnh | Trạng thái | Ghi chú |
|---|---|---|
| Chương nghệ sĩ | thường, đang xem, đã qua | Ảnh lớn, tên to, nút "Nghe" |
| Chấm điều hướng | – | Đồng bộ với vuốt ngang |
| Bảng bài hát | đóng, mở, đang kéo | Có "tay nắm" ở trên |
| Dòng bài hát | thường, đang phát, lỗi | Bìa nhỏ, tên, thời lượng |
| Đĩa than | nghỉ, quay, dừng, lỗi | Xem phần trên |
| Khung MV | tải, phát | Luôn nhìn thấy, ≥ 200×200 |
| Nút điều khiển | phát, dừng, trước, sau | Vùng chạm ≥ 44px |
| Thanh tiến độ | thường, đang kéo | |
| Mini player | ẩn, hiện | Có ô vuông MV nhỏ nhưng đủ tối thiểu |
| Ghi nguồn | chân trang | "Nhạc: YouTube · Ảnh bìa: Apple Music" + link |

## Dễ dùng cho mọi người (a11y)

- Mọi nút có nhãn tiếng Việt cho trình đọc màn hình; nút phát/dừng báo rõ trạng thái.
- Mở bảng bài thì tiêu điểm nằm trong bảng; nhấn Esc để đóng.
- Cử chỉ vuốt nào cũng có phím tương ứng.
- Không chỉ dùng màu để báo lỗi.
- Tôn trọng "giảm chuyển động".

## Về ngôn ngữ

Giao diện bằng tiếng Việt có dấu đầy đủ, giọng thân thiện như nói chuyện với bạn ("Chạm để nghe", "Bài này chỉ nghe thử được 30 giây"). Tên nghệ sĩ và bài giữ nguyên chính tả gốc: "HIEUTHUHAI", "tlinh", "Vũ.".
