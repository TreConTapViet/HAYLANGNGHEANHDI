# Nội dung nhạc (content/)

Mỗi nghệ sĩ là **một file `.md`** trong [artists/](artists/). Đây là nguồn dữ liệu duy nhất cho danh sách bài. Script `npm run data` đọc các file này rồi sinh `public/data/songs.json` và ảnh.

## Cách viết một file

```markdown
---
id: ten-khong-dau            # dùng trong đường dẫn ảnh
order: 1                     # thứ tự chương trên landing
name: Tên Hiển Thị
genre: rap                   # rap | pop | indie | ballad
youtubeChannel: UCxxxxxxxx   # kênh chính thức của nghệ sĩ hoặc hãng đĩa
spotifyQuery: Tên trên Spotify   # dùng để tìm ảnh chân dung
tracks:
  - title: "Tên Bài"
    feat: "Ca sĩ khách mời"   # tùy chọn
    youtube: ID11KYTU         # 11 ký tự, lấy từ video chính thức
    kind: mv                  # mv | video | lyric | audio
---

Phần dưới là ghi chú tự do cho người quản lý, script bỏ qua.
```

## Quy tắc chọn video

1. Chỉ lấy video của **kênh chính thức** hoặc hãng đĩa của nghệ sĩ.
2. Ưu tiên MV; nếu MV quá dài hoặc có đoạn dẫn dài thì dùng bản Audio / Lyric.
3. Không lấy bản live, remix, nhạc tổng hợp hoặc video do fan đăng.
4. Có video **cấm nhúng** hay không thì chỉ biết khi chạy thật. Web sẽ tự lùi về bản nghe thử 30 giây.

## Trạng thái danh sách

| Nghệ sĩ | File | Số bài | Trạng thái |
|---|---|---|---|
| HIEUTHUHAI | hieuthuhai.md | 6 | Xong |
| Đạt G | dat-g.md | 7 | Xong |
| Sơn Tùng M-TP | son-tung-mtp.md | 7 | Xong |
| Đen Vâu | den-vau.md | 6 | Xong |
| MONO | mono.md | 6 | Xong |
| tlinh | tlinh.md | 6 | Xong |
| Wren Evans | wren-evans.md | 6 | Xong |
| AMEE | amee.md | 6 | Xong |
| Low G | low-g.md | 7 | Xong (4 bài không có trên iTunes) |
| Obito | obito.md | 7 | Xong (3 bài không có trên iTunes) |
| Hoàng Dũng | hoang-dung.md | 6 | Xong |
| Vũ. | vu.md | 7 | Xong |
| Phương Ly | phuong-ly.md | 6 | Xong (1 bài không có trên iTunes) |
| Bích Phương | bich-phuong.md | 7 | Xong (1 bài không có trên iTunes) |
| Hà Anh Tuấn | ha-anh-tuan.md | 6 | Xong |
| JustaTee | justatee.md | 7 | Xong |

Tổng: 16 nghệ sĩ, 103 bài. Các ID được tra trên YouTube ngày 11/11/2026 và đối chiếu ID kênh chính thức. `npm run data` kiểm tra lại từng video qua oEmbed mỗi lần chạy và báo bài nào đã mất.

Bài "không có trên iTunes" vẫn nghe được trọn bài qua YouTube; chỉ thiếu ảnh bìa album (dùng ảnh video thay) và bản nghe thử 30 giây dự phòng.
