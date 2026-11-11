import { lazy, Suspense, useEffect, useRef } from 'react';
import { calm, useStore, type Artist } from './player';

// Bảng bài hát + trình phát (kèm thư viện kéo/vuốt) tải sau, để trang mở đầu hiện nhanh hơn
const Overlays = lazy(() => import('./Overlays'));

const set = useStore.setState;
const HERO_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260908_125738_eb584080-9f98-489e-adb2-014760aa34da.mp4';
const poster = (w: number) =>
  `https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260908_122011_59c97465-4d23-4fdc-ac40-f6832f573e28.png&w=${w}&q=85`;
// Video nền nặng gần 20MB: chỉ tải trên màn hình rộng, điện thoại dùng ảnh tĩnh có chuyển động nhẹ bằng CSS
const showVideo = !calm && matchMedia('(min-width: 900px)').matches;
const GENRE: Record<string, string> = { rap: 'Rap', pop: 'Pop', indie: 'Indie', ballad: 'Ballad' };

export default function App() {
  const artists = useStore((s) => s.artists);
  const failed = useStore((s) => s.failed);

  useEffect(() => {
    fetch('/data/songs.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((artists: Artist[]) => set({ artists }))
      .catch(() => set({ failed: true }));
  }, []);

  return (
    <>
      <Hero />
      <main id="nghe-si" className="flow">
        {failed ? (
          <p className="notice">
            Không tải được danh sách bài hát. <button onClick={() => location.reload()}>Thử lại</button>
          </p>
        ) : artists ? (
          <Flow artists={artists} />
        ) : (
          <p className="notice" aria-busy="true">Đang tải…</p>
        )}
      </main>
      <footer>
        Nhạc phát từ trình phát chính thức của YouTube · Thông tin và ảnh bìa: Apple Music · Ảnh nghệ sĩ: Spotify hoặc video
        chính thức. Trang không đăng nhập, không lưu dữ liệu của bạn.
      </footer>
      <Suspense>
        <Overlays />
      </Suspense>
    </>
  );
}

// Video nền chỉ chạy khi đang nằm trong màn hình, đỡ tốn pin và GPU lúc nghe nhạc
function playInView(video: HTMLVideoElement | null) {
  if (!video) return;
  // rootMargin -1px: bấm "Nghe ngay" thì mép dưới video nằm khít mép trên màn hình, vẫn phải tính là đã ra ngoài
  const io = new IntersectionObserver(([e]) => (e.isIntersecting ? video.play().catch(() => {}) : video.pause()), {
    rootMargin: '-1px',
  });
  io.observe(video);
  return () => io.disconnect();
}

function Hero() {
  return (
    <header className="hero">
      <div className="hero-media">
        <img
          src={poster(1920)}
          srcSet={`${poster(828)} 828w, ${poster(1920)} 1920w`}
          sizes="100vw"
          fetchPriority="high"
          alt="Mâm đĩa than trên tảng đá phủ rêu giữa đồng cỏ lúc hoàng hôn"
        />
        {showVideo && (
          <video
            ref={playInView}
            src={HERO_VIDEO}
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
            onLoadedData={(e) => e.currentTarget.classList.add('is-ready')}
          />
        )}
      </div>
      <nav className="rise">
        <span className="brand">NHẠC VIỆT</span>
        <a className="pill" href="#nghe-si">Nghe ngay</a>
      </nav>
      <div className="hero-inner">
        <h1>
          <span className="line"><span>Chạm một lần,</span></span>
          <span className="line"><span>đĩa bắt đầu quay.</span></span>
        </h1>
        <p className="rise">Nhạc của những nghệ sĩ trẻ Việt Nam. Không đăng nhập, không lưu gì cả.</p>
      </div>
    </header>
  );
}

function Flow({ artists }: { artists: Artist[] }) {
  const list = useRef<HTMLUListElement>(null);
  const nudge = (dir: number) =>
    list.current!.scrollBy({ left: dir * list.current!.firstElementChild!.clientWidth, behavior: 'smooth' });
  return (
    <>
      <h2>Chọn một nghệ sĩ</h2>
      <p className="hint">Vuốt ngang để lướt, chạm để mở danh sách bài.</p>
      <ul ref={list} tabIndex={0} aria-label="Nghệ sĩ, vuốt ngang để xem thêm">
        {artists.map((a) => (
          <li key={a.id}>
            <button
              onClick={(e) => {
                e.currentTarget.parentElement!.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
                set({ sheet: a });
              }}
            >
              <img src={a.image} alt="" loading="lazy" decoding="async" />
              <strong>{a.name}</strong>
              <small>{GENRE[a.genre] ?? a.genre} · {a.tracks.length} bài</small>
            </button>
          </li>
        ))}
      </ul>
      <div className="flow-nav">
        <button aria-label="Nghệ sĩ trước" onClick={() => nudge(-1)}>←</button>
        <button aria-label="Nghệ sĩ kế tiếp" onClick={() => nudge(1)}>→</button>
      </div>
    </>
  );
}
