# 01 – Người dùng và yêu cầu

## Web này dành cho ai?

**Lan, 19 tuổi, sinh viên.** Đang chờ xe buýt, mở web bằng điện thoại. Cô muốn nghe một bài của HIEUTHUHAI, không muốn tạo tài khoản, không muốn bị hỏi "bạn có muốn nhận thông báo không". Một tay cầm điện thoại, tay kia vuốt.

**Minh, 27 tuổi, dân văn phòng.** Mở web trên laptop lúc làm việc, nghe nền. Anh thích đổi bài nhanh bằng phím, và không muốn trang ngốn pin hay làm quạt máy kêu.

**Một người bạn nước ngoài** được gửi link để nghe thử nhạc Việt. Họ không biết ai là ai, nên cần nhìn là hiểu: *đây là các nghệ sĩ, chạm vào để nghe*.

Cả ba có chung một điều: **họ muốn nghe nhạc ngay, không thủ tục**.

## Một buổi dùng web, kể lại

1. Lan mở link. Màn hình hiện lên chữ lớn, hình nền chuyển động nhẹ. Chưa đến hai giây.
2. Cô cuộn xuống, từng nghệ sĩ hiện ra như lật trang: ảnh lớn, tên to, màu nền đổi theo từng người.
3. Vuốt sang trái, sang nghệ sĩ kế tiếp. Chạm vào một người.
4. Một bảng danh sách bài trượt lên từ dưới. Cô chạm vào một bài.
5. Đĩa than hiện ra, ảnh bìa album nằm ở giữa, bắt đầu quay. Nhạc phát.
6. Cô vuốt xuống để thu gọn. Nhạc vẫn chạy: khung MV thu thành một thẻ nhỏ ở góc màn hình (vẫn nhìn rõ, đúng quy định của YouTube) cùng một thanh điều khiển.
7. Cô tắt tab. Không có gì được lưu lại, không có gì bị theo dõi.

## Web làm gì (và không làm gì)

| Có | Không |
|---|---|
| Landing page nhiều hiệu ứng, cuộn và vuốt | Đăng ký, đăng nhập, tài khoản |
| Mỗi nghệ sĩ là một "chương" | Playlist cá nhân, lịch sử nghe |
| Chạm vào nghệ sĩ → danh sách bài | Bình luận, chia sẻ mạng xã hội |
| Chạm vào bài → đĩa than quay, nghe nhạc | Tìm kiếm động, đề xuất theo sở thích |
| Phát / dừng / tua / bài trước / bài sau | Lưu bất kỳ thứ gì (kể cả `localStorage`) |
| Mini player khi thu gọn | Tải nhạc về |
| Nhiều thể loại: rap, pop, indie, ballad | Nhạc không phải của Việt Nam |

## "Mượt" nghĩa là gì, nói bằng con số

| Cảm giác | Con số kiểm được |
|---|---|
| Cuộn và vuốt không giật | ≥ 60 khung hình/giây; mỗi khung ≤ 16,6ms |
| Mở web là thấy ngay | Nội dung chính hiện trong < 2,5 giây trên 4G |
| Không bị "nhảy" chữ, nhảy ảnh | Dịch chuyển bố cục (CLS) < 0,1 |
| Chạm là phản hồi | Độ trễ khi tương tác (INP) < 200ms |
| Tải nhẹ | JS ban đầu < 150KB sau nén |
| Dễ chịu với người nhạy cảm chuyển động | Tôn trọng cài đặt "giảm chuyển động" của hệ điều hành |
| Chạy được ở đâu | Chrome, Safari (iPhone), Firefox, Edge bản mới |
| Không lộ bí mật | Mã gửi tới trình duyệt không chứa khóa nào |

## Ràng buộc

- Một người làm, chi phí hạ tầng gần như bằng 0 (hosting tĩnh miễn phí).
- Nhạc phát qua trình phát **chính thức** của nền tảng; không tự host, không tải về.
- Ảnh phải ghi nguồn và dẫn link về nơi gốc.
- Khung phát YouTube phải **nhìn thấy được, không bị che** (điều khoản của họ).

## Giả định (nếu sai thì phải xem lại)

1. Mỗi nghệ sĩ có kênh YouTube chính thức đủ bài để nghe. *(Đã thấy đúng với HIEUTHUHAI; cần kiểm từng người.)*
2. Danh sách thay đổi chậm, vài tuần một lần, nên cập nhật thủ công là đủ.
3. Vài nghìn lượt xem mỗi ngày, hosting tĩnh chịu được thoải mái.
4. Người dùng chấp nhận có đôi lúc một bài chỉ có bản nghe thử 30 giây nếu video không cho nhúng.
5. **Chưa kiểm chứng, rủi ro cao:** trên điện thoại, khi khóa màn hình hoặc chuyển sang app khác, nhạc từ trình phát YouTube nhúng có thể dừng. Nếu đúng, web này nghe tốt khi mở màn hình, nhưng không phải kiểu "bỏ túi vẫn nghe". Cần thử trên máy thật trước khi hứa điều này với người dùng (xem phần "Cổng kiểm tra" trong [README](README.md)).
