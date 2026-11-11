import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { calm, cover, play, useStore, type Artist, type Track } from './player';

// Bảng bài hát + trình phát (kèm thư viện kéo/vuốt) tải sau, để trang mở đầu hiện nhanh hơn
const Overlays = lazy(() => import('./Overlays'));

const set = useStore.setState;
const HERO_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260908_125738_eb584080-9f98-489e-adb2-014760aa34da.mp4';
const poster = (w: number) =>
  `https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260908_122011_59c97465-4d23-4fdc-ac40-f6832f573e28.png&w=${w}&q=85`;

// Video nền nặng gần 20MB: chỉ tải trên màn hình rộng, điện thoại dùng ảnh tĩnh có chuyển động nhẹ bằng CSS
const showVideo = !calm && matchMedia('(min-width: 900px)').matches;
const GENRE: Record<string, string> = { all: 'Tất cả', rap: 'Rap', pop: 'Pop', indie: 'Indie', ballad: 'Ballad' };

function norm(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim();
}

export default function App() {
  const artists = useStore((s) => s.artists);
  const failed = useStore((s) => s.failed);

  useEffect(() => {
    fetch('/data/songs.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((list: Artist[]) => {
        set({ artists: list });
        // Kiểm tra deep link URL (?artist=...&track=...)
        try {
          const params = new URLSearchParams(window.location.search);
          const aId = params.get('artist');
          const tId = params.get('track');
          if (aId) {
            const foundA = list.find((a) => a.id === aId);
            if (foundA) {
              if (tId) {
                const foundT = foundA.tracks.find((t) => t.id === tId);
                if (foundT) play(foundA, foundT);
                else set({ sheet: foundA });
              } else {
                set({ sheet: foundA });
              }
            }
          }
        } catch {}
      })
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
          <p className="notice" aria-busy="true">Đang tải danh sách bài hát…</p>
        )}
      </main>
      <footer>
        <p>
          Nhạc phát từ trình phát chính thức của YouTube · Thông tin và ảnh bìa: Apple Music · Ảnh nghệ sĩ: Spotify hoặc video
          chính thức. Trang không đăng nhập, không lưu dữ liệu của bạn.
        </p>
        <p className="shortcuts-hint">
          Phím tắt: <kbd>Space</kbd> Phát/Dừng · <kbd>←</kbd> <kbd>→</kbd> Đổi bài · <kbd>M</kbd> Tắt tiếng · <kbd>S</kbd> Ngẫu nhiên · <kbd>R</kbd> Lặp lại · <kbd>F</kbd> Thu/Mở player
        </p>
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
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [query, setQuery] = useState('');

  const nudge = (dir: number) => {
    if (!list.current || !list.current.firstElementChild) return;
    list.current.scrollBy({ left: dir * list.current.firstElementChild.clientWidth, behavior: 'smooth' });
  };

  const normQuery = norm(query);

  const filteredArtists = useMemo(() => {
    return artists.filter((a) => {
      const matchGenre = selectedGenre === 'all' || a.genre === selectedGenre;
      const matchQuery = !normQuery || norm(a.name).includes(normQuery);
      return matchGenre && matchQuery;
    });
  }, [artists, selectedGenre, normQuery]);

  // Tìm bài hát theo từ khóa nếu có nhập tìm kiếm
  const matchedTracks = useMemo(() => {
    if (!normQuery) return [];
    const results: { artist: Artist; track: Track }[] = [];
    for (const a of artists) {
      for (const t of a.tracks) {
        if (norm(t.title).includes(normQuery) || (t.feat && norm(t.feat).includes(normQuery))) {
          results.push({ artist: a, track: t });
          if (results.length >= 8) return results;
        }
      }
    }
    return results;
  }, [artists, normQuery]);

  return (
    <>
      <h2>Chọn một nghệ sĩ</h2>
      <p className="hint">Vuốt ngang để lướt, chạm để mở danh sách bài.</p>

      {/* Bộ lọc thể loại & tìm kiếm */}
      <div className="flow-filter">
        <div className="genre-pills" role="tablist" aria-label="Thể loại nhạc">
          {Object.entries(GENRE).map(([k, label]) => (
            <button
              key={k}
              role="tab"
              aria-selected={selectedGenre === k}
              className="pill-tab"
              data-active={selectedGenre === k}
              onClick={() => setSelectedGenre(k)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="search-wrap">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm nghệ sĩ, bài hát…"
            aria-label="Tìm nghệ sĩ hoặc bài hát"
          />
          {query && (
            <button className="clear-btn" aria-label="Xóa tìm kiếm" onClick={() => setQuery('')}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Kết quả tìm bài hát tức thì */}
      {matchedTracks.length > 0 && (
        <div className="search-results" aria-label="Kết quả tìm kiếm bài hát">
          <p className="search-title">Bài hát tìm thấy:</p>
          <div className="search-grid">
            {matchedTracks.map(({ artist, track }) => (
              <button
                key={track.id}
                className="search-item"
                onClick={() => play(artist, track)}
              >
                <img src={cover(track, 100)} alt="" loading="lazy" />
                <div className="search-meta">
                  <strong>{track.title}</strong>
                  <small>{artist.name}{track.feat && ` ft. ${track.feat}`}</small>
                </div>
                <span className="search-play">▶</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredArtists.length === 0 ? (
        <p className="notice">Không tìm thấy nghệ sĩ nào phù hợp.</p>
      ) : (
        <>
          <ul ref={list} tabIndex={0} aria-label="Nghệ sĩ, vuốt ngang để xem thêm">
            {filteredArtists.map((a) => (
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
      )}
    </>
  );
}
