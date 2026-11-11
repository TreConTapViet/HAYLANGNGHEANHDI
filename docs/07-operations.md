# 07 – Vận hành

## Tin vui: ít thứ phải trông coi

Vì web chỉ là các file tĩnh, nên không có máy chủ nào để "sập", không có cơ sở dữ liệu để sao lưu, không có dữ liệu người dùng để bảo vệ. Việc cần chăm chủ yếu là: **dữ liệu bài hát còn đúng không** và **web còn mượt không**.

## Các môi trường

| Môi trường | Để làm gì | Cách chạy |
|---|---|---|
| Máy bạn | Phát triển | `npm run dev` |
| Xem thử bản build | Kiểm trước khi đưa lên | `npm run build && npm run preview` |
| Công khai | Người dùng thật | Hosting tĩnh (Vercel hoặc Netlify) |

## Bí mật và khóa

Với thiết kế mới, **web không cần khóa nào để chạy**:
- iTunes Search API: không cần khóa.
- YouTube: ID video được tìm sẵn, trình phát nhúng không cần khóa.
- Spotify: dùng riêng cho **ảnh chân dung nghệ sĩ**, chỉ chạy lúc chuẩn bị dữ liệu ở máy bạn. Không có khóa thì script lùi về ảnh của video chính thức.

Nếu có dùng khóa Spotify:
1. Đặt trong `.env`, và `.env` nằm trong `.gitignore`.
2. **Không dán khóa vào chat, issue hay log.**
3. Không dùng tiền tố `VITE_` cho bí mật (biến có tiền tố này sẽ bị đưa vào mã trình duyệt).
4. Lộ khóa thì vào Spotify Developer Dashboard tạo lại ngay.

## Các lệnh

```bash
npm run data      # đọc content/artists/*.md, chạy scripts/build-data.ts → songs.json + ảnh
npm run dev       # chạy thử khi đang làm
npm run build     # đóng gói → dist/
npm run preview   # xem bản đóng gói
npm run check     # kiểm lỗi, kiểm cỡ gói
```

## Mỗi lần phát hành

1. Đổi danh sách? Chạy `npm run data` và đọc báo cáo xem bài nào thiếu gì.
2. `npm run check`.
3. `npm run build` rồi `npm run preview`. Thử trên máy tính **và** điện thoại thật: chạm, vuốt, phát một bài, thử một bài video không cho nhúng nếu có.
4. Chạy Lighthouse (mobile), so với [ngân sách](05-performance.md).
5. Kiểm tra `dist/` không chứa chuỗi bí mật nào.
6. Đưa lên mạng, mở đường link thật, nghe thử một bài.

## Đưa lên mạng

- Thư mục xuất bản: `dist/`.
- Bộ nhớ đệm (cache):
  - `/assets/*` (tên có mã băm): lưu rất lâu, `immutable`.
  - `/img/*`: lưu lâu.
  - `/data/songs.json`: 5 phút, cho phép dùng bản cũ trong lúc làm mới.
  - `index.html`: luôn kiểm tra lại.
- Nén Brotli (hosting thường bật sẵn).
- Chính sách bảo mật nội dung (CSP) cho phép khung nhúng từ `youtube-nocookie.com` và tệp âm thanh từ máy chủ iTunes.

## Theo dõi sức khỏe

| Việc | Cách | Bao lâu |
|---|---|---|
| Web còn mở được | Dịch vụ kiểm tra miễn phí | 5 phút/lần |
| Lỗi phía người dùng | Tùy chọn: dịch vụ báo lỗi nhẹ, không theo dõi cá nhân | Khi có |
| Độ mượt | Lighthouse + thử trên điện thoại thật | Mỗi lần phát hành |
| Video còn sống | Chạy script kiểm tra các `youtubeId` | 2–4 tuần/lần |

Không dùng công cụ phân tích theo dõi cá nhân. Nếu muốn đếm lượt xem, chọn loại không cookie.

## Khi có chuyện (sổ tay xử lý)

### Một bài không phát được
1. Mở video trên YouTube: còn không? Có bật cho phép nhúng không?
2. Nếu hỏng: tìm video chính thức khác, thay `youtubeId` trong config. Nếu không có: để bài chỉ còn bản nghe thử, hoặc bỏ bài.
3. Chạy lại `npm run data`, build, đưa lên.

### Bản nghe thử cũng không phát
1. Đường dẫn bản nghe thử của iTunes có thể hết hạn. Chạy lại `npm run data` để lấy đường dẫn mới.

### Ảnh bìa không hiện
1. Mở `songs.json` xem đường dẫn có trỏ tới file thật trong `public/img`.
2. Chạy lại `npm run data` cho nghệ sĩ đó.

### Điện thoại bị giật
1. Ghi một bản Performance (hoặc giả lập CPU chậm 6×).
2. Tìm tác vụ dài, tìm các phần tử có `will-change` thừa.
3. Giảm lớp parallax, thay video nền bằng ảnh tĩnh cho máy yếu.
4. Ghi kết quả vào bảng theo dõi ở [file 05](05-performance.md).

### Lộ khóa
1. Tạo lại khóa ngay.
2. Cập nhật `.env`, xóa khóa cũ khỏi lịch sử git nếu lỡ commit.
3. Rà `dist/` và các nhánh.

## Sao lưu và khôi phục

Mọi thứ nằm trong git, kể cả `songs.json` và ảnh. Có thể dựng lại cả web mà không cần gọi lại bất kỳ dịch vụ nào. Không có dữ liệu người dùng nên không có gì để sao lưu.

## Tuân thủ (đọc lại trước khi công khai)

- **YouTube:** khung phát tối thiểu 200×200px, không đặt lớp phủ che; chỉ nhúng bằng trình phát chính thức; không tải video/âm thanh về.
- **iTunes / Apple:** đọc điều khoản về việc dùng ảnh bìa và bản nghe thử; ghi nguồn.
- **Ghi nguồn:** chân trang nêu nguồn và mỗi bài có link về video gốc.
- Mình chỉ đọc kỹ phần quy định khung phát của YouTube; các điều khoản còn lại cần đọc lại đầy đủ trước ngày công khai.
