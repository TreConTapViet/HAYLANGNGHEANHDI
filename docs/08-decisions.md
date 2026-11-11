# 08 – Các quyết định và lý do

Mỗi mục trả lời bốn câu: *Chuyện gì khiến phải chọn? Chọn gì? Đổi lại mất gì? Khi nào nên nghĩ lại?*

---

## ADR-001 · Web tĩnh, không có máy chủ riêng

- **Chuyện gì:** không đăng nhập, không lưu dữ liệu, ngân sách gần bằng 0.
- **Chọn:** làm sẵn mọi thứ ở giai đoạn chuẩn bị, đưa file tĩnh lên CDN.
- **Đổi lại:** thêm bài phải chạy lại bước chuẩn bị; không có tìm kiếm động hay gợi ý theo người dùng.
- **Nghĩ lại khi:** cần nội dung đổi mỗi ngày, hoặc cần số liệu người dùng.

## ADR-002 · Vite + React + TypeScript, hiệu ứng nặng đặt ngoài React

- **Chuyện gì:** cần 60fps trên điện thoại; có nhiều màn chồng nhau (landing, bảng, đĩa than).
- **Chọn:** React lo cấu trúc; CSS lo đĩa quay; GSAP + Lenis lo cuộn; Motion lo kéo/vuốt; Zustand giữ trạng thái.
- **Đổi lại:** thêm vài thư viện; React có chi phí khởi động nhất định.
- **Đã cân nhắc:** HTML/CSS/JS thuần (nhẹ nhất nhưng khó quản trạng thái khi lớn); Astro (hợp trang nội dung, ít lợi vì gần cả trang là tương tác); Svelte (nhẹ, nhưng ít tài liệu mẫu cho GSAP và vuốt).
- **Nghĩ lại khi:** gói JS vượt ngân sách mà chia nhỏ không đủ.

## ADR-003 · Không phụ thuộc một nền tảng: YouTube để nghe, iTunes để lấy thông tin, bản nghe thử để dự phòng

- **Chuyện gì:** Spotify chỉ cho khách chưa đăng nhập nghe 30 giây, và khóa của chủ web không đổi được điều đó. Bạn muốn tìm nguồn ở bên ngoài.
- **Chọn:**
  1. **YouTube kênh chính thức** để nghe trọn bài.
  2. **iTunes Search API** để lấy tên bài, album, ảnh bìa, bản nghe thử.
  3. **Bản nghe thử 30s** (thẻ `<audio>`) khi video không nhúng được.
  4. Spotify chỉ là tùy chọn (ảnh chân dung nghệ sĩ).
- **Đã kiểm chứng:** iTunes trả đủ dữ liệu không cần khóa; ảnh bìa lên 600×600; tìm YouTube trả ID + kênh + thời lượng, lọc được theo kênh chính thức.
- **Đổi lại:** ID video phải tìm và duy trì (có thể đổi/gỡ); có video cấm nhúng nên cần dự phòng; quảng cáo trong video có thể xuất hiện theo chính sách YouTube.
- **Chưa kiểm chứng:** Deezer (không nhận được phản hồi), Zing MP3 / NhacCuaTui (chưa tìm được cách nhúng chính thức), nên chưa đưa vào.
- **Nghĩ lại khi:** điều khoản nhúng đổi, hoặc có thỏa thuận cấp phép để phát trực tiếp.

## ADR-004 · Ảnh từ nguồn chính thức, tải về trước

- **Chọn:** bìa album từ iTunes; ảnh chân dung nghệ sĩ từ Spotify (khóa của bạn), lùi về ảnh thu nhỏ của video chính thức nếu không khớp; tải về, đổi WebP, phục vụ từ CDN của mình, ghi nguồn và dẫn link.
- **Chưa giải quyết (chặn việc công khai, không chặn việc làm thử):** mình **chưa đọc** điều khoản của Apple, Spotify và YouTube về việc tải ảnh về và phục vụ lại từ máy chủ của mình. Có thể một trong ba nơi chỉ cho phép dùng ảnh theo đường link gốc. Nếu vậy, phương án dự phòng là hiển thị ảnh trực tiếp từ link gốc (đổi lại: phụ thuộc bên thứ ba, có thể chậm hơn và dùng thêm kết nối). Giai đoạn làm thử: ảnh để trong `.gitignore`, không commit, không công khai.
- **Đổi lại:** ảnh nằm trong repo (tốn dung lượng); phải theo dõi điều khoản.
- **Không làm:** cào ảnh từ các trang nhạc khác.
- **Nghĩ lại khi:** điều khoản đổi, hoặc số nghệ sĩ lớn khiến repo nặng (chuyển ảnh sang kho riêng).

## ADR-005 · Không lưu bất cứ gì về người dùng

- **Chọn:** mọi trạng thái nằm trong RAM; không `localStorage`, không cookie của mình.
- **Đổi lại:** tải lại trang là mất vị trí. Bù lại, không có vấn đề riêng tư, không cần banner cookie.

## ADR-006 · Tính màu chủ đạo trước, không tính lúc chạy

- **Chọn:** tính trong bước chuẩn bị, lưu vào `songs.json`.
- **Đổi lại:** thêm một bước ở quy trình. Bù lại, máy khách đỡ việc, đổi bài không giật.

## ADR-007 · Khung YouTube luôn nhìn thấy và không bị che

- **Chuyện gì:** bản nháp đầu của mình định ẩn khung hình, chỉ dùng tiếng; đĩa than đè lên khung cho đẹp. Khi kiểm lại điều khoản YouTube thì thấy quy định: khung phát tối thiểu **200×200px**, và **không được đặt lớp phủ hay khung che bất kỳ phần nào** của player, kể cả nút điều khiển.
- **Chọn:** thiết kế lại. Đĩa than và khung MV nằm **cạnh nhau** (dọc trên điện thoại, ngang trên máy tính), không chồng lên nhau. Mini player là một **thẻ MV nhỏ (≥ 200×200px, không bị che)** ở góc cùng thanh điều khiển, không phải một thanh mỏng. Điều này chiếm khá nhiều chỗ trên điện thoại; cách bố trí cụ thể (góc nào, có kéo di chuyển được không) cần thử trên màn hình thật và quyết định ở chặng thiết kế giao diện.
- **Đổi lại:** màn đĩa than bớt "sạch" hơn so với ý tưởng ban đầu. Bù lại, đúng điều khoản và an toàn lâu dài.
- **Cần làm thêm:** đọc toàn bộ điều khoản YouTube API Services trước ngày công khai (mình mới đọc phần quy định khung phát).
- **Nghĩ lại khi:** muốn giao diện chỉ có đĩa thuần túy. Lúc đó phải đổi sang nguồn khác được phép phát không kèm khung hình.
- **Cập nhật 12/11/2026:** khi chuyển sang lời bài hát làm phần chính, người dùng muốn "xóa video/MV". Không xóa hẳn được vì quy định trên, nên chọn **thu video thành ô nhỏ** (≥200×200px, không phủ gì lên) ở cột phải hoặc dưới lời. Thẻ nhỏ chỉnh lại khung video từ 195px lên đúng 200px.

## ADR-008 · Lời bài hát từ LRCLIB, giờ từng chữ là ước lượng

- **Chuyện gì:** người dùng muốn lời hiện như Spotify: chữ sáng lên khi nhạc hát tới, phần còn lại mờ đi.
- **Chọn:** lấy lời đồng bộ từ **LRCLIB** (miễn phí, không cần khóa) lúc chuẩn bị dữ liệu, mỗi bài một file `public/data/lyrics/<id>.json`, chỉ tải khi bài đó được phát. Đã thử: 102/103 bài có lời.
- **Đổi lại:**
  - LRCLIB chỉ có giờ **theo dòng**, không bài nào có giờ theo từng chữ. Giờ từng chữ được **ước lượng**: chia thời gian hát của dòng theo độ dài chữ, tối đa khoảng 0,42 giây mỗi chữ. Đoạn ngân dài hoặc rap nhanh có thể lệch nhẹ trong một dòng; dòng thì luôn đúng giờ.
  - Lời được canh theo **bản thu gốc**. Video phải có tiếng giống hệt bản thu thì lời mới khớp; video bị cắt, đổi tốc độ hay có đoạn mở đầu dài sẽ lệch. Trình phát so độ dài video với bản lời, lệch hơn 3 giây thì báo cho người nghe; mỗi bài chỉnh tay được bằng `lyricsOffset`.
  - **Bản quyền:** lời bài hát là tác phẩm có bản quyền, LRCLIB do cộng đồng đóng góp, không có giấy phép. Dùng cá nhân thì ổn; công khai thì phải cân nhắc (bỏ lời, hoặc dùng nhà cung cấp có giấy phép như Musixmatch hay LyricFind, đều tốn phí).
- **Nghĩ lại khi:** có nguồn lời có giờ từng chữ (định dạng LRC mở rộng), hoặc trước khi công khai trang.

## ADR-010 · Chỉ dùng video của kênh chính thức hoặc kênh Topic của nghệ sĩ

- **Chuyện gì:** người dùng nghe thấy một số bài sai nốt, sai nhịp (ví dụ "Thằng Điên"). Kiểm tra cho thấy 70/103 bài đang dùng video do người khác tải lại. Các bản này thường bị đổi tông hoặc tốc độ để né hệ thống bản quyền, mà độ dài vẫn có thể gần bằng bản gốc, nên **không thể chỉ dựa vào độ dài để phát hiện**.
- **Chọn:** chỉ nhận video có kênh đăng (`videoDetails.channelId`) là kênh chính thức trong file `.md`, hoặc kênh "<nghệ sĩ> - Topic" do YouTube tự tạo từ bản phát hành của hãng đĩa. Loại các bản remix, karaoke, live, beat, cover, 360°. Trong các bản đạt, ưu tiên bản có độ dài khớp một phiên bản lời.
- **Đổi lại:** MV chính thức hay có đoạn mở đầu hoặc kết thúc riêng, làm lời lệch vài giây ở một số bài. Kênh Topic thì đúng bản thu nhưng hình chỉ là ảnh bìa (không sao, vì video giờ chỉ là ô nhỏ).
- **Nghĩ lại khi:** không bao giờ quay lại dùng video tải lại.

## ADR-009 · Biểu tượng chép nguyên từ Lucide

- **Chọn:** chép nguyên mã SVG của 18 biểu tượng từ `lucide-static@1.72.0` vào `src/Icons.tsx` (giấy phép ISC, chỉ cần giữ ghi chú nguồn). Không thêm thư viện vào dự án.
- **Đổi lại:** muốn thêm biểu tượng phải chép thêm bằng tay. Bộ chung một kiểu nét, không lẫn kiểu như các biểu tượng vẽ tay trước đó.
- **Không chọn:** SVG Repo (mỗi biểu tượng một giấy phép khác nhau, phải kiểm từng cái).

---

## Khi web lớn lên, cái gì sẽ chật trước?

| Khi nào | Vấn đề | Hướng xử lý |
|---|---|---|
| > 30 nghệ sĩ | `songs.json` và ảnh nặng | Tách JSON theo nghệ sĩ, tải khi cần |
| Cần tìm kiếm | Không có máy chủ | Tìm ngay trên máy khách với chỉ mục nhỏ |
| Muốn thêm ngôn ngữ | Chuỗi chữ đang cứng tiếng Việt | Tách ra file ngôn ngữ riêng |
| Người dùng đòi playlist riêng | Trái với "không lưu" | Xem lại yêu cầu từ đầu, đừng tự thêm |

## Rủi ro đang mở

| Rủi ro | Mức | Giảm bằng cách |
|---|---|---|
| Video bị gỡ, đổi ID hoặc cấm nhúng | Trung bình | Tự lùi về bản nghe thử; script kiểm tra định kỳ |
| Điều khoản nhúng / dùng ảnh thay đổi | Trung bình | Đọc lại trước khi công khai; nguồn phát tách riêng nên dễ thay |
| Trình phát YouTube làm máy yếu bị giật | Trung bình | Tạo muộn, chỉ một cái, đĩa quay bằng CSS, có chế độ chỉ nghe thử |
| iPhone chặn tự phát | Thấp | Chỉ phát sau khi chạm; có nút "Chạm để phát" |
| Đường dẫn bản nghe thử hết hạn | Thấp | Chạy lại `npm run data` |
| **Điện thoại khóa màn hình / chuyển app thì nhạc YouTube nhúng dừng** | **Cao** (chưa kiểm chứng) | Thử trên iPhone và Android thật trước khi dựng giao diện. Nếu đúng: nói rõ giới hạn này trên web, và cân nhắc dùng bản nghe thử (thẻ `<audio>`, hỗ trợ Media Session) cho trường hợp nghe nền |
| Tự chuyển sang bài kế sau khi hết bài bị trình duyệt di động chặn (không có cử chỉ mới) | Trung bình (chưa kiểm chứng) | Thử trên máy thật; nếu bị chặn thì hiện nút "Chạm để phát bài kế" |
| Tải ảnh về và phục vụ lại có thể trái điều khoản Apple / Spotify / YouTube | Trung bình–cao (chưa đọc điều khoản) | Đọc điều khoản trước khi công khai; có phương án dùng link ảnh gốc (xem ADR-004) |
| Gõ nhầm ID video trong file `.md` | Thấp | Bước kiểm tra dữ liệu của script (xem file 03) |
| Một video đổi chủ / bị thay nội dung nhưng ID vẫn còn | Thấp | Kiểm tra định kỳ tên kênh và tiêu đề so với lúc ghi |
