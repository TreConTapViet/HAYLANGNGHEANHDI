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

## Lời bài hát (thêm 12/11/2026)

| Hiệu ứng | Cách làm | Ghi chú hiệu năng |
|---|---|---|
| Quét sáng từng chữ | Chữ là `inline-block`, nền gradient `background-clip: text`; ranh giới sáng–mờ dời theo `--p`, có vùng chuyển mềm 30% | Chỉ chữ của dòng đang hát đổi mỗi khung hình |
| Quầng sáng màu bìa | `drop-shadow` theo `--glow`. Màu lấy bằng cách thu ảnh bìa về 8×8 điểm ảnh rồi lấy trung bình, làm sáng lên | Chỉ áp cho dòng đang hát |
| Chữ trồi lên, phóng nhẹ | Chữ đang hát có `data-on`: dịch lên 0,07em, phóng 1,08 lần, chuyển 0,35 giây | Chỉ dùng `transform` |
| Dòng xa mờ và nhòe | Độ mờ `1 − d×0,17`, nhòe `d×0,55px`, với d là khoảng cách tới dòng đang hát (tối đa 4) | Chỉ đổi khi chuyển dòng (vài giây một lần) |
| Tự cuộn | Cả khối lời dịch bằng `transform` để dòng đang hát nằm ở khoảng 42% chiều cao | Chạy trên compositor |
| Lời vào/ra | Khối lời mờ dần vào và trồi lên 28px khi mở trình phát | |

Chữ lời bài hát: Inter 700, cỡ `clamp(1.45rem, 2.5vw, 2.4rem)` (điện thoại `clamp(1.25rem, 5.4vw, 1.75rem)`). Khi bật "giảm chuyển động": tắt nhòe, tắt trồi chữ, tắt chuyển tiếp.

## Kính lỏng cho danh sách và thẻ thu gọn (thêm 12/11/2026)

Theo phong cách Liquid Glass của Apple, viết bằng CSS thuần trong `src/styles.css` (mục "Kính lỏng"):

| Lớp | Cách làm |
|---|---|
| Thân kính | `backdrop-filter: blur(32px) saturate(190%) brightness(1.08)` trên nền gradient nhuộm `rgba(var(--glow), 0.32 → 0.1)` |
| Viền bắt sáng | `inset 0 1px 0` trắng 55% ở mép trên, viền mảnh trắng 22% quanh kính |
| Ánh màu bên trong và bên ngoài | `inset 0 0 36px` và `0 0 64px` theo `--glow` |
| Bóng loáng | `::before` có điểm sáng góc trên trái và vệt chéo 115°, đặt `z-index: -1` để nằm dưới nội dung (không phủ khung YouTube) |
| Bài đang phát | Viên kính sáng hơn: gradient trắng → màu bài, viền sáng phía trên |
| Bo góc | 28px cho cột danh sách, 24px cho thẻ thu gọn |

`--glow` là màu chủ đạo của ảnh bìa bài đang phát (thu ảnh về 8×8 điểm ảnh, lấy trung bình, làm sáng lên), đặt trên `.player`; lời, danh sách và thẻ thu gọn cùng dùng. Đổi bài thì màu kính chuyển dần trong 0,8 giây.

## Dải chọn nghệ sĩ (cập nhật 12/11/2026)

Dải cuộn tự trôi, 36px/giây (rê chuột: 6px/giây; giảm chuyển động: đứng yên). Thẻ rộng `clamp(150px, 40vw, 210px)`, cách nhau 20px; hai mép mờ dần bằng `mask-image`. Rê chuột hoặc dùng phím Tab tới thẻ thì thẻ nhấc lên 6px và phóng 1,04 lần, có viền sáng. Không còn nút ← →. Lăn chuột trên dải: mỗi nấc (~100px) cộng quán tính để trôi mượt khoảng một thẻ; dải đứng yên thì lăn chuột cuộn trang như thường.

## Biểu tượng (cập nhật 12/11/2026)

Dùng **Lucide** (nét 2px, bo tròn, khung 24×24), mã SVG chép nguyên vào `src/Icons.tsx`. Nút Phát/Tạm dừng lớn tô đặc (`fill="currentColor"`) cho nổi bật; các nút khác để nét. Bài có lời đồng bộ có biểu tượng micro (`mic-vocal`) trong danh sách.

## Về ngôn ngữ

Giao diện bằng tiếng Việt có dấu đầy đủ, giọng thân thiện như nói chuyện với bạn ("Chạm để nghe", "Bài này chỉ nghe thử được 30 giây"). Tên nghệ sĩ và bài giữ nguyên chính tả gốc: "HIEUTHUHAI", "tlinh", "Vũ.".
