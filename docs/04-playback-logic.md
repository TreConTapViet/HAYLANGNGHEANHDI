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

## Lời bài hát chạy theo nhạc (thêm 12/11/2026)

**Dữ liệu:** mỗi bài một file `public/data/lyrics/<id>.json` dạng `{ duration, lines: [[giây, "lời"], ...] }`, chỉ tải khi bài đó được phát. Dòng trống là đoạn nhạc dạo, chỉ dùng làm mốc kết thúc dòng trước.

**Tính giờ** (`src/lrc.ts`, có bài kiểm tra trong `scripts/lyrics.test.mjs`):
- Dòng đang hát = dòng cuối cùng đã bắt đầu. Trong đoạn nhạc dạo vẫn giữ dòng vừa hát.
- Giờ từng chữ là **ước lượng**: thời gian hát của dòng = min(tới dòng sau − 0,1 giây, số chữ × 0,42 giây), chia cho các chữ theo độ dài.
- `lyricsOffset` của bài (giây) được cộng vào mọi mốc giờ.

**Vòng chạy** (`src/Lyrics.tsx`): React chỉ vẽ lời một lần mỗi bài. Một vòng `requestAnimationFrame` đọc giờ của trình phát rồi ghi thẳng vào biến CSS, không render lại React mỗi khung hình:
- `--d` trên mỗi dòng = khoảng cách tới dòng đang hát (0–4), dùng để làm mờ và nhòe.
- `--p` trên mỗi chữ của dòng đang hát = tiến độ hát (0–1), dùng để quét màu.
- `data-on` trên chữ đang được hát, dùng để chữ trồi lên.
- YouTube chỉ cập nhật giờ vài lần mỗi giây, nên vòng chạy tự nội suy giữa hai lần đọc để chữ chạy mượt.

**Khi lời có thể sai:**

| Tình huống | Web làm |
|---|---|
| Bài không có lời đồng bộ | Hiện "Bài này chưa có lời đồng bộ" |
| Đang phát bản nghe thử 30 giây | Ẩn lời (bản thử bắt đầu giữa bài nên lời không khớp) |
| Độ dài video lệch bản lời hơn 3 giây | Hiện cảnh báo; người nghe chạm vào một dòng để nhảy tới đó |

## Bố cục trình phát (thêm 12/11/2026)

- **Màn từ 1100px:** ba cột `[danh sách] [lời] [đĩa · tên bài · video · tiến độ · nút]`. Cột danh sách chỉ hiện khi mở; lúc đó lời dịch sang phải (chuyển cột 0,5 giây).
- **Chọn bài trong bảng nghệ sĩ (màn rộng):** bảng và cột danh sách cùng `layoutId` nên bảng "bay" dần sang trái thành cột danh sách, lời hiện lên ở giữa.
- **Màn hẹp:** đĩa nhỏ và tên bài ở trên cùng, lời ở giữa, video và nút ở dưới. Danh sách là ngăn kéo trượt từ trái phủ lên lời, chọn bài xong tự đóng. Chọn bài trong bảng nghệ sĩ thì bảng trượt sang trái rồi biến mất.
- **Phím tắt mới:** `L` mở/đóng danh sách.
- Thứ tự các phần tử con trong trình phát phải giữ cố định: khung `#yt` chứa iframe YouTube, React đổi chỗ là iframe bị tạo lại và nhạc ngắt.
