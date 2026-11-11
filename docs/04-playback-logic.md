# 04 – Logic phát nhạc và cử chỉ vuốt

## Hai câu chuyện chạy song song

Web luôn kể hai câu chuyện cùng lúc, và mình giữ chúng **tách rời** để không rối:

1. **Khách đang ở đâu?** (landing, bảng bài hát, màn đĩa than)
2. **Nhạc đang ra sao?** (đang tải, đang phát, tạm dừng, lỗi)

Ví dụ: khách thu gọn màn đĩa than về mini player. Câu chuyện 1 đổi, câu chuyện 2 **không** đổi, nên nhạc không bị ngắt.

### Khách đang ở đâu

```
          chạm nghệ sĩ              chạm bài
 LANDING ──────────────► BẢNG BÀI ──────────────► ĐĨA THAN
    ▲                       │ ▲                      │
    └──── kéo xuống ────────┘ └─── thu gọn / đóng ───┘
```

### Nhạc đang ra sao

```
 nghỉ ──chọn bài──► đang tải ──sẵn sàng──► đang phát ◄──► tạm dừng
                        │                       │
                      lỗi                   hết bài ──► tự sang bài kế
```

| Trạng thái nhạc | Đĩa than | Nút chính |
|---|---|---|
| nghỉ | Đứng yên | – |
| đang tải | Đứng yên, vòng chờ nhỏ | Mờ đi |
| đang phát | Quay đều | Dừng |
| tạm dừng | Chậm dần rồi dừng (≈ 0,4 giây) | Phát |
| lỗi | Đứng yên, màu cảnh báo dịu | Thử lại / Bài kế |

## Nguồn phát và cách tự lùi (fallback)

```
Chọn bài
   │
   ▼
Bài có ID YouTube? ──có──► YouTubePlayer
   │ không                      │
   │                      lỗi 101 / 150 (không cho nhúng)
   │                      lỗi 100 (không tìm thấy), 2, 5
   ▼                            ▼
Bài có bản nghe thử? ◄──────────┘
   │ có                          │ không
   ▼                             ▼
PreviewPlayer (30s)       báo "Không phát được", 2 giây sau sang bài kế
+ dòng "Nghe đầy đủ trên YouTube" + link
```

Khi lùi về bản nghe thử, mình nói thật với người nghe là đang phát 30 giây và chỉ họ nơi nghe đủ. Không im lặng "cắt" nhạc.

## Quy tắc then chốt

1. **Chỉ một trình phát YouTube** tồn tại cùng lúc. Đổi bài thì nạp bài mới vào đúng cái đó, không tạo thêm.
2. **Chỉ tạo trình phát sau khi khách chạm.** Trình duyệt chặn tự phát nếu chưa có cử chỉ của người dùng.
3. **Khung YouTube phải nhìn thấy được và không bị che.** Tối thiểu 200×200px, không đặt lớp phủ lên (xem [ADR-007](08-decisions.md)). Đĩa than nằm *cạnh* hoặc *phía trên* khung MV, không chồng lên.
4. **Thu gọn không hủy trình phát.** Chỉ đổi cách hiển thị. Với mini player, khung YouTube vẫn phải giữ đủ kích thước tối thiểu và vẫn thấy được (có thể là một ô vuông nhỏ ở góc).
5. **Dùng tên miền `youtube-nocookie.com`** cho phần nhúng, hợp với lời hứa "không theo dõi".
6. **Tắt tab là hết.** Không ghi gì xuống máy.

## Hàng đợi bài hát

- Hàng đợi = danh sách bài của nghệ sĩ đang mở, đúng thứ tự trong config.
- **Bài kế:** hết danh sách thì quay lại bài đầu.
- **Bài trước:** nếu đã nghe quá 3 giây thì tua về đầu bài; nếu chưa thì lùi bài trước (giống các app nhạc quen thuộc).
- Mở nghệ sĩ khác khi đang phát: bài hiện tại cứ phát tiếp, đến khi khách chọn bài mới.

## Đĩa quay cùng nhịp với nhạc

- Đĩa quay bằng hiệu ứng CSS thuần, chỉ đổi `play / pause` theo trạng thái nhạc. Nhờ đó vẫn mượt kể cả lúc trình phát YouTube đang khởi động và làm trang hơi bận.
- Thanh tiến độ cập nhật khoảng 4 lần mỗi giây, ghi thẳng vào một biến CSS, không đi qua React nên không làm cả trang vẽ lại.

## Cử chỉ vuốt: cảm giác tự nhiên

| Ở đâu | Khách làm | Cần đủ | Kết quả |
|---|---|---|---|
| Landing | Vuốt ngang | > 50px, hoặc vuốt nhanh | Sang nghệ sĩ kế / trước |
| Landing | Cuộn dọc | – | Parallax, chữ hiện dần |
| Bảng bài | Kéo xuống | > 120px, hoặc vuốt nhanh | Đóng bảng |
| Đĩa than | Vuốt ngang | > 60px, hoặc vuốt nhanh | Bài kế / trước |
| Đĩa than | Vuốt xuống | > 120px | Thu thành mini player |

Vài chi tiết nhỏ làm khác biệt lớn:
- **Khóa hướng sau 8px đầu:** khách vuốt chéo thì web quyết nhanh là ngang hay dọc, tránh cảm giác "kéo hai hướng cùng lúc".
- **Thả tay thì bật lại bằng lò xo** (spring), không dừng khựng.
- **Vuốt chưa đủ ngưỡng thì nảy về chỗ cũ**, như đang kéo một sợi dây chun.
- **Mọi cử chỉ vuốt đều có phím tương ứng** (mũi tên, Esc, Space), cho người dùng bàn phím và người dùng công nghệ hỗ trợ.

## Khi có lỗi

| Tình huống | Web làm |
|---|---|
| Thư viện YouTube chưa tải xong | Hiện trạng thái đang tải, thử lại một lần sau 3 giây |
| Video không cho nhúng / đã bị gỡ | Lùi về bản nghe thử (sơ đồ ở trên) |
| Trình duyệt chặn tự phát | Hiện nút "Chạm để phát" |
| Bài lỗi cả hai nguồn | Đánh dấu bài trong phiên, tự sang bài kế |
