# 03 – Nguồn nhạc và dữ liệu

## Vì sao không chỉ dựa vào Spotify

Spotify rất tốt về dữ liệu, nhưng với một web **không đăng nhập** thì nó chỉ cho nghe 30 giây, và khóa API của chủ web không đổi được điều đó (quyền nghe trọn bài gắn với tài khoản của *người nghe*). Nên mình tách thành ba việc và chọn nguồn phù hợp cho từng việc:

| Việc cần làm | Nguồn chọn | Vì sao |
|---|---|---|
| Nghe **trọn bài**, không đăng nhập | YouTube (kênh chính thức) | Ai cũng mở được, nhúng chính thức |
| Tên bài, album, **ảnh bìa** | iTunes Search API | Không cần khóa, đã chạy thử được, bìa đến 600×600 |
| Phương án **dự phòng** | Bản nghe thử 30s của iTunes | Là file âm thanh thẳng, không iframe, nhẹ |

## Các nguồn đã cân nhắc

| Nguồn | Dùng được cho | Ghi chú thật thà |
|---|---|---|
| **YouTube** | Nghe trọn bài | Đã thử: tìm ra ID, tên kênh, thời lượng. Phải giữ khung phát nhìn thấy được. Có video cấm nhúng, chỉ biết khi chạy thật |
| **iTunes Search API** | Thông tin, bìa, nghe thử 30s | Đã thử, chạy tốt, không khóa. Không có ảnh nghệ sĩ riêng |
| **Spotify Web API** | Ảnh chân dung nghệ sĩ | Cần khóa của bạn (đặt trong `.env`, chỉ chạy lúc chuẩn bị). Không dùng để phát nhạc: nghe trọn bài cần người nghe đăng nhập Premium |
| **Spotify Embed** | Nghe | 30s nếu khách chưa đăng nhập Spotify |
| **SoundCloud** | Nghe (widget) | Hợp với nghệ sĩ indie tự đăng; nghệ sĩ lớn hiếm khi có bản chính thức ở đây. Công cụ tra cứu không lộ link stream |
| **Deezer API** | Thông tin, nghe thử | Mình gọi thử nhưng không nhận được phản hồi từ máy này, nên **chưa kiểm chứng**, chưa đưa vào |
| **Zing MP3 / NhacCuaTui** | — | Mình chưa kiểm tra được cách nhúng chính thức, nên chưa đưa vào |

## Ảnh trên đĩa than lấy ở đâu

| Ảnh | Nguồn | Ghi chú |
|---|---|---|
| Bìa album (nhãn đĩa) | iTunes | Đổi `100x100` thành `600x600` trong đường dẫn |
| Hình nghệ sĩ / cảnh MV | Ảnh thu nhỏ của video chính thức trên kênh nghệ sĩ | Ghi nguồn và dẫn về video gốc |
| Ảnh chân dung nghệ sĩ | Spotify API (khóa của bạn) | Chỉ nhận kết quả **khớp tên chính xác**; không khớp thì lùi về ảnh video chính thức, không đoán. Nghệ sĩ đăng ký tên khác (ví dụ "Đen" thay vì "Đen Vâu") ghi ở `spotifyQuery` trong file `.md` |

Mình không cào ảnh từ các trang nhạc khác: rủi ro bản quyền, và link ảnh hay chết.

## Danh sách nghệ sĩ (đề xuất, bạn chỉnh)

| Nhóm | Nghệ sĩ |
|---|---|
| Rap / Hip-hop | HIEUTHUHAI, Đạt G, Đen Vâu, Low G, Obito, Wren Evans |
| Pop | Sơn Tùng M-TP, AMEE, tlinh, Hoàng Dũng, Vũ., Phương Ly |
| Indie / Ballad | MONO, Bích Phương, Hà Anh Tuấn, Justatee |

Mỗi người 5–8 bài. **Bài do bạn chọn**, không để máy tự quyết "bài hot".

## Quy trình chuẩn bị dữ liệu

```
Với mỗi (nghệ sĩ, tên bài) trong content/artists/*.md:

 1. iTunes (quốc gia vn) → tên bài chuẩn, album, ảnh bìa, thời lượng, link nghe thử
 2. YouTube → tìm "tên nghệ sĩ + tên bài"
        giữ lại kết quả có channel_id == kênh chính thức của nghệ sĩ
        ưu tiên tiêu đề có "Official"; chọn video khớp tên bài nhất
 3. Tải ảnh → thu nhỏ 64/300/640 → WebP → tính màu chủ đạo
 4. Bài có ít nhất một nguồn (YouTube hoặc nghe thử) thì được giữ
 5. Ghi songs.json + báo cáo: bài nào thiếu gì, bài nào đáng nghi
```

**Về việc tìm ID YouTube:** mình làm bước này cùng bạn ngay trong phiên làm việc, bằng công cụ tra cứu, rồi ghi kết quả thẳng vào các file `content/artists/*.md` (đã làm cho 8 nghệ sĩ, xem [content/README.md](../content/README.md)). Nhờ vậy khi web chạy thật, nó không phụ thuộc vào công cụ tra cứu nào. Mỗi lần tra cứu tốn vài credit, nên chỉ chạy khi thêm bài mới.

**Về việc kiểm tra video có cho nhúng không:** lúc chuẩn bị không biết được. Chỉ khi trình phát YouTube báo lỗi 101/150 thì mới rõ, và lúc đó web tự lùi về bản nghe thử (xem [04](04-playback-logic.md)).

## Kiểm tra dữ liệu trước khi dùng (để không có "lỗ hổng" âm thầm)

Script phải **dừng và báo lỗi rõ ràng** thay vì lặng lẽ bỏ qua khi gặp:

| Kiểm tra | Nếu sai |
|---|---|
| File `.md` thiếu `id`, `name`, `youtubeChannel` | Dừng |
| ID YouTube không đúng 11 ký tự | Dừng |
| Trùng `id` nghệ sĩ hoặc trùng ID video trong cùng nghệ sĩ | Dừng |
| Video có tồn tại và **cho phép nhúng** không | Cảnh báo, đánh dấu bài "chỉ nghe thử" |
| Kênh của video có đúng `youtubeChannel` không | Cảnh báo |

Về kiểm tra nhúng: mình tin rằng điểm oEmbed của YouTube trả mã **401** cho video cấm nhúng và **404** cho video không còn, nên đây là cách kiểm không cần khóa. **Chưa thử, cần kiểm chứng** trước khi dựa vào nó. Nếu đúng, ta biết ngay lúc chuẩn bị bài nào cấm nhúng, không phải đợi người nghe gặp lỗi.

## Hình dạng của `songs.json`

```ts
type Catalog = { generatedAt: string; artists: Artist[] };

type Artist = {
  id: string;                    // "hieuthuhai"
  name: string;                  // "HIEUTHUHAI"
  genre: 'rap' | 'pop' | 'indie' | 'ballad';
  youtubeChannelId: string;      // dùng để lọc video chính chủ
  image: ImageSet;               // từ ảnh thu nhỏ video chính thức
  color: { dominant: string; accent: string };
  tracks: Track[];
};

type Track = {
  id: string;
  title: string;
  album: string;
  cover: ImageSet;               // bìa album (iTunes)
  color: { dominant: string; accent: string };
  durationMs: number;
  sources: {
    youtube?: { id: string; title: string };   // nghe trọn bài
    preview?: { url: string };                 // 30s, dự phòng
  };
  links: { youtube?: string; itunes?: string };  // để ghi nguồn
};

type ImageSet = { w64: string; w300: string; w640: string; width: number; height: number };
```

Màu chủ đạo được tính ngay lúc chuẩn bị, để web không phải tính khi chạy (đỡ tốn pin, đỡ giật khi đổi bài).

## Quy tắc xử lý tình huống

| Tình huống | Làm gì |
|---|---|
| Không tìm thấy trên iTunes | Giữ bài nếu có YouTube; dùng thumbnail video làm bìa; ghi cảnh báo |
| Không có video từ kênh chính thức | Chỉ dùng bản nghe thử, đánh dấu "chỉ nghe thử" |
| Trùng bài (remix, live) | Chỉ giữ bản bạn ghi trong config |
| Video tên giống nhưng khác kênh | Bỏ, không đoán |
| Cả hai nguồn đều không có | Loại bài khỏi danh sách |

## Lời bài hát (thêm 12/11/2026)

`npm run data` hỏi thêm **LRCLIB** (`lrclib.net/api/search`, không cần khóa) cho từng bài:
1. Chỉ nhận kết quả có lời đồng bộ, tên nghệ sĩ khớp `spotifyQuery`, tên bài bắt đầu bằng tên bài trong file `.md`, không phải bản remix/live/karaoke.
2. Có nhiều phiên bản thì chọn bản có độ dài gần bài trên iTunes nhất.
3. Chuyển lời LRC (`[mm:ss.xx] lời`) thành `[[giây, "lời"], ...]`, ghi vào `public/data/lyrics/<id>.json` kèm độ dài bản lời. Thư mục này được xóa và ghi lại mỗi lần chạy.
4. Bài không có lời được ghi vào báo cáo cuối lượt chạy, và `songs.json` đánh dấu `lyrics: false`.

Kết quả lần chạy 12/11/2026: 102/103 bài có lời (thiếu "Túi 3 Gang").

## Ghi nguồn

Chân trang ghi rõ: nhạc phát từ YouTube, thông tin và ảnh bìa từ iTunes/Apple Music, và mỗi bài có link về video gốc. Trước khi công khai mình sẽ đọc lại điều khoản của từng nền tảng.
