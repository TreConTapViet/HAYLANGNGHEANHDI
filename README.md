# Web Nghe Nhạc Việt · Chạm là quay 🎵

Một trang web nhỏ gọn, mượt mà để nghe nhạc của những nghệ sĩ trẻ Việt Nam: HIEUTHUHAI, Đạt G, Sơn Tùng M-TP, Đen Vâu, MONO, tlinh, Wren Evans, AMEE, Low G, Obito, Hoàng Dũng, Vũ., Phương Ly, Bích Phương, Hà Anh Tuấn, JustaTee...

Không đăng ký. Không đăng nhập. Không lưu trữ cookie hay dữ liệu cá nhân.

---

## Tính năng chính

- 💿 **Trải nghiệm đĩa than Vinyl:** Đĩa quay mượt mà đồng nhịp với bài hát, vệt sáng phản chiếu tĩnh, vuốt ngang để chuyển bài, vuốt xuống để thu nhỏ.
- 📱 **Tích hợp Media Session API:** Điều khiển nhạc trực tiếp từ màn hình khóa (iOS, Android), thanh thông báo và tai nghe Bluetooth.
- ⏱️ **Thanh tiến độ & tua nhạc (Scrubber Timeline):** Hiển thị thời gian thực và thời lượng bài hát, hỗ trợ kéo tua mượt mà cho cả YouTube và bản nghe thử 30s.
- 🔍 **Tìm kiếm & Bộ lọc thể loại tức thì:** Lọc theo Rap, Pop, Indie, Ballad; tìm kiếm tên nghệ sĩ và bài hát không cần gõ dấu.
- 📋 **Hàng đợi phát (Queue Drawer):** Duyệt và chọn bài hát cùng nghệ sĩ ngay bên trong màn hình đĩa than.
- 🔁 **Lặp lại & Phát ngẫu nhiên:** Hỗ trợ lặp danh sách (`🔁`), lặp 1 bài (`🔂`), tắt lặp (`➡`) và phát ngẫu nhiên (`🔀`).
- 🔗 **Chia sẻ trực tiếp (Deep Linking):** Sao chép liên kết trực tiếp bài hát (`?artist=...&track=...`) kèm thông báo Toast nổi.
- 🎛️ **Âm lượng & Phím tắt:** Điều chỉnh âm lượng, phím tắt nhanh (`Space`, `←`/`→`, `M`, `S`, `R`, `F`).

---

## Cài đặt & Chạy dự án

```bash
# Cài đặt thư viện
npm install

# Chạy môi trường phát triển (localhost:5173)
npm run dev

# Đóng gói xuất bản ra thư mục dist/
npm run build

# Xem thử bản đóng gói
npm run preview

# Cập nhật dữ liệu từ content/artists/*.md
npm run data
```

---

## Tài liệu chi tiết

Toàn bộ tài liệu kiến trúc, luồng dữ liệu, hiệu năng và thiết kế nằm trong thư mục [`docs/`](docs/):

- [`docs/README.md`](docs/README.md) – Sổ tay dự án & nhật ký các bản dựng
- [`docs/01-requirements.md`](docs/01-requirements.md) – Chân dung người dùng và yêu cầu
- [`docs/02-architecture.md`](docs/02-architecture.md) – Kiến trúc hệ thống
- [`docs/03-data-pipeline.md`](docs/03-data-pipeline.md) – Quy trình thu thập dữ liệu (iTunes, YouTube, Spotify)
- [`docs/04-playback-logic.md`](docs/04-playback-logic.md) – Logic phát nhạc & cử chỉ vuốt
- [`docs/05-performance.md`](docs/05-performance.md) – Giữ cho web mượt 60fps
- [`docs/06-design-system.md`](docs/06-design-system.md) – Thiết kế giao diện & đĩa than
- [`docs/07-operations.md`](docs/07-operations.md) – Vận hành & đưa lên mạng
- [`docs/08-decisions.md`](docs/08-decisions.md) – Các quyết định kiến trúc (ADR)
