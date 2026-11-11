# Web nghe nhạc Việt — Sổ tay dự án

Một trang web nhỏ để ai đó, vào lúc nào đó trong ngày, mở ra và nghe nhạc của những nghệ sĩ trẻ Việt Nam mà họ thích: HIEUTHUHAI, Đạt G, Sơn Tùng M-TP, MONO, tlinh…

Không đăng ký. Không đăng nhập. Không có gì được lưu lại. Bạn vào, lướt qua từng nghệ sĩ như lật những trang tạp chí, chạm vào một người, chọn một bài, và đĩa than bắt đầu quay.

Điều tụi mình muốn người dùng **cảm nhận** là: *mượt*. Cuộn mượt, vuốt mượt, đĩa quay mượt, kể cả trên chiếc điện thoại không còn mới.

## Ba lời hứa của dự án

1. **Nhẹ nhàng với người nghe.** Không bắt đăng nhập, không theo dõi, không cookie của mình.
2. **Mượt trên máy bình thường.** Mục tiêu 60 khung hình/giây trên cả máy tính lẫn điện thoại tầm trung, chứ không chỉ trên máy của người làm web.
3. **Tử tế với nghệ sĩ và nền tảng.** Nghe nhạc qua trình phát chính thức của họ, ghi nguồn ảnh, không tải trộm, không che giấu.

## Đọc theo thứ tự nào?

| File | Đọc khi bạn muốn biết… |
|---|---|
| [01 – Người dùng và yêu cầu](01-requirements.md) | Web này dành cho ai, một buổi dùng web trông thế nào, thế nào là "mượt" |
| [02 – Cách web hoạt động](02-architecture.md) | Bức tranh toàn cảnh, các phần ghép với nhau ra sao |
| [03 – Nguồn nhạc và dữ liệu](03-data-pipeline.md) | Nhạc, ảnh và ID lấy từ đâu; vì sao không chỉ dựa vào Spotify |
| [04 – Logic phát nhạc và cử chỉ vuốt](04-playback-logic.md) | Chuyện gì xảy ra khi chạm, vuốt, bài lỗi, đổi bài |
| [05 – Giữ cho web mượt](05-performance.md) | Những quy tắc nhỏ để không bị giật |
| [06 – Giao diện và cảm xúc](06-design-system.md) | Màu, chữ, chuyển động, chiếc đĩa than |
| [07 – Vận hành](07-operations.md) | Cách chạy, đưa lên mạng, xử lý khi có chuyện |
| [08 – Các quyết định và lý do](08-decisions.md) | Vì sao chọn thế này, đã bỏ gì, khi nào nên nghĩ lại |

## Bản đồ nhanh

```
Chuẩn bị (ở nhà)                          Phục vụ (trên mạng)
─────────────────                         ───────────────────
danh sách nghệ sĩ + bài                   khách mở web
   │                                         │
   ├─ iTunes   → tên bài, bìa album,         ├─ đọc songs.json (1 lần, vài chục KB)
   │             bản nghe thử 30s            ├─ lướt landing, chạm nghệ sĩ, chọn bài
   ├─ YouTube  → ID video chính thức         └─ nhạc phát từ YouTube chính thức
   ▼                                             (hỏng thì lùi về bản nghe thử 30s)
songs.json + ảnh đã tối ưu  ─────────────►  không có máy chủ riêng, chỉ file tĩnh
```

## Những điều mình đã kiểm chứng thật (không phải đoán)

- Tìm bài qua iTunes Search API chạy được, **không cần khóa**; trả về tên bài, album, ảnh bìa và đường dẫn bản nghe thử.
- Ảnh bìa lấy được cỡ 600×600 chỉ bằng cách đổi kích thước trong đường dẫn.
- Tìm video YouTube trả về ID, tên kênh và thời lượng. Với HIEUTHUHAI, kết quả đúng kênh chính thức của anh ấy, nên có thể lọc để chỉ nhận video chính chủ.
- Điều khoản YouTube: khung phát tối thiểu 200×200px và không được che bất kỳ phần nào của nó (xem [ADR-007](08-decisions.md)).

## Cổng kiểm tra: phải xong trước khi viết code giao diện

Trạng thái hiện tại: **chưa có dòng code nào trong repo, chỉ có tài liệu và dữ liệu `.md`.** Một lần thử dựng khung đã được gỡ bỏ để làm việc này cho chắc.

### Đã có bằng chứng

| Điều | Bằng chứng |
|---|---|
| iTunes Search trả tên bài, album, bìa 600×600, bản nghe thử, không cần khóa | Đã gọi thật, có kết quả |
| Tìm YouTube trả ID + kênh + thời lượng, lọc được theo kênh chính thức | Đã gọi thật cho 8 nghệ sĩ |
| Khung YouTube phải ≥ 200×200px và không bị che | Đã đọc điều khoản "Required Minimum Functionality" |
| 50 bài của 8 nghệ sĩ đã có ID video chính thức trong [content/artists/](../content/artists/) | Đối chiếu tên kênh trong kết quả tìm kiếm |
| Cả 50 video **tồn tại** và tên kênh khớp kênh chính thức (oEmbed trả HTTP 200 cho 50/50) | Gọi thật ngày 11/11/2026; tên tác giả: HIEUTHUHAI, DatG Music, Sơn Tùng M-TP Official, Đen Vâu Official, Mono Official, tlinh, Wren Evans Official, ST.319 Entertainment |

### Chưa kiểm chứng (mỗi mục là một "thử nghiệm nhỏ" phải qua trước khi dựng giao diện)

| # | Câu hỏi cần trả lời | Cách thử | Nếu kết quả xấu |
|---|---|---|---|
| T1 | Trên iPhone và Android thật, trình phát YouTube nhúng có **tiếp tục phát khi khóa màn hình** không? | Trang thử tối thiểu: một iframe + nút phát | Ghi rõ giới hạn; cân nhắc bản nghe thử cho nghe nền |
| T2 | Hết bài thì **tự chuyển bài kế** có chạy trên di động không? | Cùng trang thử, nạp bài thứ hai sau sự kiện hết bài | Hiện nút "Chạm để phát bài kế" |
| T3 | Có bài nào trong 50 bài **cấm nhúng** không? | oEmbed cho từng ID: **đã chạy, 50/50 trả 200** (không có 401/404). Nhưng mình chưa có ví dụ video cấm nhúng để đối chứng rằng "cấm nhúng = 401", nên kết luận *tạm tin*, xác nhận thật bằng trang thử bên dưới | Đổi video khác hoặc để "chỉ nghe thử" |
| T4 | Đĩa quay + trình phát YouTube có giữ được **60fps** trên điện thoại tầm trung? | DevTools + máy thật | Đơn giản hóa hiệu ứng, bớt lớp parallax |
| T5 | Điều khoản **tải ảnh về và phục vụ lại** của Apple, Spotify, YouTube | Đọc điều khoản | Dùng link ảnh gốc (xem ADR-004) |
| T6 | Spotify trả ảnh chân dung **khớp tên** cho cả 8 nghệ sĩ không (đặc biệt "Đen", "MONO", "tlinh") | Chạy một lượt tìm với khóa của bạn | Dùng ảnh video chính thức cho người không khớp |

**Quy tắc:** chưa qua T1–T4 thì không dựng giao diện hoàn chỉnh; T5 và T6 phải xong trước khi công khai. Kết quả mỗi thử nghiệm ghi vào đây.

| # | Ngày | Kết quả |
|---|---|---|
| T3 | 11/11/2026 | 50/50 oEmbed = 200 (tạm tin: không có video cấm nhúng; chưa đối chứng) |
| T1, T2, T4 | | Trang thử đã dựng (nằm ngoài repo); **chờ bạn thử trên máy thật** |
| T5, T6 | | chưa làm |

## Bản dựng đầu tiên (11/11/2026): code khác tài liệu ở đâu

Website đã được dựng. Chạy: `npm install`, `npm run dev`. Dữ liệu: `npm run data`. Bản phát hành: `npm run build`.

Code đơn giản hơn thiết kế trong các file 02–06 ở những điểm sau (các file đó chưa sửa lại):

| Tài liệu ghi | Code thật | Lý do |
|---|---|---|
| Tải ảnh về, đổi WebP bằng sharp | Chỉ lưu **link ảnh gốc** (iTunes, YouTube, Spotify) | Bỏ được cả bước xử lý ảnh lẫn câu hỏi T5 về việc phục vụ lại ảnh |
| Tính màu chủ đạo lúc chuẩn bị | Nền trình phát là ảnh bìa phóng to làm mờ | Không cần tính màu |
| GSAP + Lenis + Embla | CSS thuần: `scroll-snap` và `animation-timeline: view()` | Chạy trên compositor, không tốn JS. Firefox chưa hỗ trợ nên thấy dải lướt phẳng |
| Thanh tiến độ và tua riêng | Dùng thanh của chính khung YouTube | Khung YouTube bắt buộc hiển thị, không cần làm hai lần |
| `songs.json` có nhiều trường | Rút gọn: xem kiểu `Track` trong `src/player.ts` | |
| Video nền ở mọi thiết bị | Chỉ màn hình rộng từ 900px; điện thoại dùng ảnh tĩnh có chuyển động nhẹ | Video nặng 19,7MB |

Đủ 16 nghệ sĩ, 103 bài (94 bài có bản nghe thử dự phòng; 9 bài không có trên iTunes Việt Nam).

Đã kiểm bằng Edge không giao diện (máy tính 1280×800 và khung điện thoại 390×844): YouTube phát được; kéo phần đầu bảng bài hát xuống thì đóng; vuốt trái trên đĩa sang bài kế; vuốt xuống thu thành thẻ nhỏ (khung video 278×200); video nền dừng khi cuộn khỏi màn hình; console không lỗi. JS ban đầu 72KB sau nén, phần trình phát 49KB tải sau.

## Bản dựng hoàn thiện lần 2 (11/11/2026): các tính năng bổ sung

Bản hoàn thiện thứ hai đã bổ sung đầy đủ các tính năng cho trải nghiệm nghe nhạc hiện đại:

1. **Tích hợp Media Session API (`navigator.mediaSession`):**
   - Hỗ trợ hiển thị tên bài hát, nghệ sĩ, album và ảnh bìa chất lượng cao trên màn hình khóa điện thoại (iOS / Android), thanh thông báo hệ thống và phím media trên bàn phím / tai nghe Bluetooth.
   - Thao tác Play / Pause, Next, Previous, Seek trực tiếp từ màn hình khóa và thiết bị ngoại vi.
2. **Thanh tiến độ & tua nhạc (Scrubber Timeline):**
   - Hiển thị thời gian trôi qua và tổng thời lượng (`mm:ss`).
   - Hỗ trợ kéo / chạm thanh scrubber để tua nhạc cả khi xem YouTube lẫn khi phát bản nghe thử 30s.
   - Thanh tiến độ mini player mảnh tinh tế ở cạnh dưới thẻ nhỏ.
3. **Bộ lọc thể loại & Tìm kiếm tức thì (Instant Search):**
   - Tab phân loại: *Tất cả*, *Rap*, *Pop*, *Indie*, *Ballad*.
   - Khung tìm kiếm nghệ sĩ & bài hát hỗ trợ gõ không dấu (ví dụ: gõ "hieu", "son tung", "cat doi noi sau" ra ngay kết quả).
   - Danh sách bài hát khớp từ khóa hiển thị ngay bên dưới để nghe ngay bằng một chạm.
4. **Hàng đợi phát (Queue Drawer trong Player):**
   - Nút `☰` trong trình phát mở danh sách bài của nghệ sĩ đang nghe, có hiệu ứng sóng nhạc ở bài đang phát. Khách chọn bài khác mà không cần thu nhỏ player.
5. **Chế độ Lặp lại & Phát ngẫu nhiên:**
   - Nút Lặp lại: Lặp danh sách (`🔁`), Lặp 1 bài (`🔂`), Tắt lặp (`➡`).
   - Nút Phát ngẫu nhiên (`🔀`).
6. **Điều chỉnh âm lượng & Tắt tiếng (Mute):**
   - Nút tắt tiếng và thanh trượt âm lượng trên màn hình rộng; phím tắt `M` để bật/tắt tiếng, mũi tên `↑`/`↓` tăng/giảm âm lượng.
7. **Chia sẻ liên kết trực tiếp (Deep Link & Toast):**
   - Hỗ trợ URL tham số `?artist=...&track=...` (mở web là tự phát ngay bài được chia sẻ).
   - Nút sao chép liên kết `🔗` kèm thông báo Toast nổi dịu mắt.
8. **Mở rộng mini player trực quan:**
   - Chạm vào thẻ nhỏ ở bất kỳ vị trí nào để phóng to lại trình phát.
   - Sửa vị trí nút mở rộng khi phát audio nghe thử (khung video ẩn).
9. **Khắc phục triệt để race condition phần tử `#yt`:**
   - Chờ React commit thẻ chứa `#yt` vào DOM trước khi gọi `YT.Player`, loại bỏ lỗi khi người dùng bật tắt nhanh hoặc đổi bài.

## Bản dựng lần 3 (12/11/2026): lời bài hát chạy theo nhạc, bố cục ba cột, biểu tượng Lucide

Theo yêu cầu: bỏ video/MV làm phần chính, thay bằng lời bài hát; danh sách bài nằm bên trái lời; đổi toàn bộ biểu tượng sang SVG gốc; sửa ảnh nghệ sĩ lúc thấy lúc không.

| Thay đổi | Chi tiết | Ở đâu |
|---|---|---|
| **Lời bài hát chạy theo nhạc** | Dòng đang hát sáng lên đúng giờ; trong dòng, màu sáng quét qua từng chữ, chữ đang hát trồi lên và phóng nhẹ, có quầng sáng theo màu ảnh bìa; dòng càng xa càng mờ và nhòe; tự cuộn để dòng đang hát ở giữa; chạm một dòng để nhảy tới đó | `src/Lyrics.tsx`, `src/lrc.ts`, [04](04-playback-logic.md), [06](06-design-system.md) |
| **Nguồn lời** | LRCLIB (miễn phí, không cần khóa): 102/103 bài có lời đồng bộ, chỉ thiếu "Túi 3 Gang". Lời chỉ có giờ **theo dòng**; giờ **từng chữ là ước lượng** | `scripts/build-data.mjs`, [ADR-008](08-decisions.md) |
| **Video thu thành ô nhỏ** | Không xóa hẳn được vì điều khoản YouTube bắt khung phát luôn hiện, tối thiểu 200×200px. Ô video nằm ở cột phải (màn rộng) hoặc dưới lời (điện thoại) | [ADR-007](08-decisions.md) |
| **Bố cục ba cột** (màn từ 1100px) | `[danh sách] [lời] [đĩa · tên bài · video · nút]`. Chọn bài trong bảng nghệ sĩ: bảng trượt dần sang trái thành cột danh sách, lời hiện lên. Nút danh sách mở/đóng cột, lời dịch theo. Màn hẹp: danh sách là ngăn kéo từ trái, chọn bài xong tự đóng | `src/Overlays.tsx`, `src/styles.css` |
| **Biểu tượng** | 18 biểu tượng chép nguyên mã SVG từ Lucide 1.72.0 (giấy phép ISC), thêm biểu tượng micro cho bài có lời | `src/Icons.tsx`, [ADR-009](08-decisions.md) |
| **Sửa ảnh nghệ sĩ** | Bỏ tải chậm (`lazy`) ở dải nghệ sĩ; lấy ảnh 480px thay 900px; ảnh lỗi thì đổi sang ảnh video của nghệ sĩ, lỗi nữa thì hiện chữ cái đầu; thẻ hiện kín bề ngang màn hình; thẻ quay vòng không còn bay ngang qua giữa màn hình | `src/App.tsx`, `src/player.ts` |
| Gọn code | Bảng nghệ sĩ và cột danh sách dùng chung một danh sách bài (`TrackList`); nút trong trình phát dùng chung `Btn` | `src/Overlays.tsx` |
| Kiểm thử | `npm test`: 4 bài kiểm tra phần tính giờ lời | `scripts/lyrics.test.mjs` |

**Vấn đề dữ liệu phát hiện khi kiểm tra (chưa sửa, chờ quyết định):** ở lần chuyển sang video lyric trước đó, **70/103 bài** đã bị đổi sang video do người khác tải lại, không phải kênh chính thức. Nhiều bản bị cắt hoặc đổi tốc độ (ví dụ "Ngủ Một Mình" dài 2:28 trong khi bản thu dài khoảng 3:00; "Bùa Yêu" là bản dài 19 phút) nên **56 bài lệch lời hơn 3 giây**. Khi video lệch bản thu hơn 3 giây, trình phát hiện cảnh báo và người nghe có thể chạm vào dòng để chỉnh. Mỗi bài cũng có thể chỉnh tay bằng trường `lyricsOffset` (xem [content/artists/README.md](../content/artists/README.md)).

Đã kiểm bằng Edge không giao diện (1440×900 và 390×844): bảng nghệ sĩ trượt sang thành cột danh sách bên trái, chữ quét sáng theo giờ phát, chạm dòng thì tua tới, ngăn kéo trên điện thoại đóng sau khi chọn bài, thẻ nhỏ giữ khung video 288×200, 16/16 ảnh nghệ sĩ tải xong, console không lỗi. **Chưa thử trên điện thoại thật**, chưa đo FPS của hiệu ứng nhòe chữ trên máy yếu.

## Những điều còn chờ

- Quyết định nguồn video cho 70 bài đang dùng video không chính thức (xem mục trên).
- Chốt danh sách nghệ sĩ và bài cuối cùng.
- Có video nào đó cấm nhúng hay không thì chỉ biết khi chạy thật; vì vậy mới có phương án lùi về bản nghe thử.
- Đọc lại điều khoản các nền tảng một lần nữa trước ngày công khai.
