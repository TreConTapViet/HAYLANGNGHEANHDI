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
