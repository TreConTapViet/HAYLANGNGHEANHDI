# 02 – Cách web hoạt động

## Bức tranh trong một đoạn

Hãy hình dung một quán cà phê. **Nhà bếp** chuẩn bị sẵn mọi thứ từ sáng sớm: nguyên liệu, ly tách, thực đơn in đẹp. **Khách** vào quán chỉ việc chọn món, không ai phải vào bếp nấu từ đầu. Web này làm đúng như vậy: mọi việc tìm bài, lấy ảnh, tìm video đều làm **trước**, gói thành một tệp `songs.json` cùng bộ ảnh. Lúc khách vào, trình duyệt chỉ đọc tệp đó và biểu diễn.

Hệ quả: không cần máy chủ riêng, không cơ sở dữ liệu, ít thứ để hỏng, chạy nhanh, và gần như không tốn tiền.

## Hai giai đoạn

```
┌──────────── GIAI ĐOẠN 1: CHUẨN BỊ (ở nhà) ─────────────────┐
│                                                              │
│  content/artists/*.md (mỗi nghệ sĩ một file, bạn chỉnh tay)  │
│          │                                                   │
│          ├──► iTunes Search ─► tên bài, album, bìa, nghe thử │
│          └──► YouTube        ─► ID video chính thức          │
│                      │                                       │
│                      ▼                                       │
│        tải ảnh → thu nhỏ → đổi sang WebP → tính màu          │
│                      │                                       │
│                      ▼                                       │
│        public/data/songs.json  +  public/img/*               │
└──────────────────────┬───────────────────────────────────────┘
                       │  build
                       ▼
              dist/  →  đưa lên hosting tĩnh (CDN)
                       │
┌──────────── GIAI ĐOẠN 2: PHỤC VỤ (trình duyệt) ─────────────┐
│                                                              │
│  tải songs.json một lần                                      │
│      │                                                       │
│      ▼                                                       │
│  Bộ nhớ tạm trong RAM  (đang ở màn nào, đang phát bài nào)   │
│      │                                                       │
│  ┌───┴──────────┬────────────┬──────────────┐                │
│  ▼              ▼            ▼              ▼                │
│ Landing     Bảng bài hát   Màn đĩa than   Mini player        │
│                                │                             │
│                                ▼                             │
│                     "Người điều phối phát nhạc"              │
│                  ┌─────────────┴──────────────┐              │
│                  ▼                            ▼              │
│          Trình phát YouTube         Bản nghe thử 30s         │
│          (nghe trọn bài)            (dự phòng, thẻ audio)    │
└──────────────────────────────────────────────────────────────┘
```

## Các phần chính, nói bằng lời thường

| Phần | Làm gì | Cố ý **không** làm |
|---|---|---|
| **Script chuẩn bị** | Tìm bài, lấy ảnh, ghi `songs.json` | Không chạy trên máy khách |
| **Bộ nhớ tạm** | Nhớ khách đang ở màn nào, bài nào | Không ghi gì xuống ổ đĩa |
| **Landing** | Hero, các chương nghệ sĩ, hiệu ứng cuộn và vuốt | Không biết gì về YouTube |
| **Bảng bài hát** | Danh sách bài, kéo xuống để đóng | Không tự phát nhạc |
| **Màn đĩa than** | Đĩa quay, khung MV, nút điều khiển, vuốt đổi bài | Không biết nhạc đến từ đâu |
| **Mini player** | Cho thấy bài đang phát khi đã thu gọn | |
| **Người điều phối phát nhạc** | Chọn nguồn phát, tự lùi sang nguồn dự phòng khi lỗi | Không chứa giao diện |

Ý tưởng then chốt là **người điều phối**: giao diện chỉ nói "phát bài này", còn việc bài đó đến từ YouTube hay bản nghe thử là chuyện của điều phối viên. Sau này thêm nguồn mới (ví dụ SoundCloud cho nghệ sĩ indie) chỉ cần viết thêm một "người phát" mới.

```ts
interface Player {
  mount(container: HTMLElement): Promise<void>;
  load(track: Track): void;       // chỉ gọi sau khi khách đã chạm
  play(): void;
  pause(): void;
  seek(seconds: number): void;
  destroy(): void;
  on(event: 'state' | 'time' | 'ended' | 'error', cb: (p: unknown) => void): void;
}
// Hai bản cài đặt: YouTubePlayer, PreviewPlayer (thẻ <audio>)
```

## Thư mục

```
d:\MUSIC
├─ docs/                  # bạn đang đọc
├─ content/
│  └─ artists/*.md        # mỗi nghệ sĩ một file: danh sách bài + ID YouTube (nguồn dữ liệu gốc)
├─ scripts/
│  └─ build-data.ts       # đọc content/*.md, gọi iTunes (+ Spotify cho ảnh), xử lý ảnh, ghi songs.json
├─ public/
│  ├─ data/songs.json     # sinh tự động, được commit
│  └─ img/                # ảnh đã tối ưu
└─ src/
   ├─ store/              # bộ nhớ tạm (Zustand)
   ├─ player/             # điều phối + YouTubePlayer + PreviewPlayer
   ├─ components/         # landing, sheet, vinyl, mini-player…
   ├─ motion/             # cuộn, vuốt, spring
   └─ styles/             # token, global
```

## Dữ liệu đi qua web ra sao

1. Mở trang → đọc `songs.json` → dựng các chương.
2. Chạm nghệ sĩ → bảng bài hát trượt lên.
3. Chạm bài → màn đĩa than mở → trình phát YouTube được tạo ra **lúc này** (không tạo sớm, vì chưa có cử chỉ của khách thì trình duyệt cũng không cho tự phát).
4. YouTube báo "đang phát / dừng / hết bài" → đĩa quay hay dừng theo.
5. Thu gọn → nhạc vẫn chạy; khung MV thu thành một thẻ nhỏ (vẫn ≥ 200×200px, không bị che) cùng thanh điều khiển.

## Khi có chuyện không hay

| Chuyện xảy ra | Web làm gì |
|---|---|
| `songs.json` không tải được | Hiện thông báo thân thiện và nút "Thử lại" |
| Video không cho nhúng / bị gỡ | Lùi về bản nghe thử 30s, kèm dòng "Bản đầy đủ có trên YouTube" và link |
| Cả hai nguồn đều hỏng | Báo nhẹ nhàng, 2 giây sau tự sang bài kế |
| Ảnh lỗi | Hiện nền chuyển sắc theo màu của bài |
| Mạng chập chờn | Giữ nguyên giao diện, chỉ trình phát báo lỗi mềm |
