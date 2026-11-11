import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, useAnimationFrame, useMotionValue } from 'motion/react';
import { artistSrc, calm, cover, imgFallback, play, useStore, type Artist, type Track } from './player';
import { IconClose, IconPlay, IconSearch } from './Icons';

// Bảng bài hát + trình phát tải sau để trang mở đầu hiện nhanh hơn
const Overlays = lazy(() => import('./Overlays'));

const set = useStore.setState;
const HERO_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260908_125738_eb584080-9f98-489e-adb2-014760aa34da.mp4';
const poster = (w: number) =>
  `https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260908_122011_59c97465-4d23-4fdc-ac40-f6832f573e28.png&w=${w}&q=85`;

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
          Nhạc phát từ trình phát chính thức của YouTube · Thông tin và ảnh bìa: Apple Music · Ảnh nghệ sĩ: Kênh YouTube
          hoặc Spotify chính thức. Trang không đăng nhập, không lưu dữ liệu của bạn.
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

// Video nền chỉ chạy khi đang nằm trong màn hình
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
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [query, setQuery] = useState('');

  const normQuery = norm(query);

  const filteredArtists = useMemo(() => {
    return artists.filter((a) => {
      const matchGenre = selectedGenre === 'all' || a.genre === selectedGenre;
      const matchQuery = !normQuery || norm(a.name).includes(normQuery);
      return matchGenre && matchQuery;
    });
  }, [artists, selectedGenre, normQuery]);

  // Tìm bài hát tức thì theo từ khóa
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
      <p className="hint">Kéo ngang để lướt, chạm vào nghệ sĩ để mở danh sách bài.</p>

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
          <IconSearch className="search-icon" size={17} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm nghệ sĩ, bài hát…"
            aria-label="Tìm nghệ sĩ hoặc bài hát"
          />
          {query && (
            <button className="clear-btn" aria-label="Xóa tìm kiếm" onClick={() => setQuery('')}>
              <IconClose size={14} />
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
                <span className="search-play">
                  <IconPlay size={14} />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredArtists.length === 0 ? (
        <p className="notice">Không tìm thấy nghệ sĩ nào phù hợp.</p>
      ) : (
        <ArtistRoll artists={filteredArtists} />
      )}
    </>
  );
}

/**
 * Dải nghệ sĩ tự trôi vô tận: rê chuột thì chậm lại, kéo thì cuộn theo tay rồi trôi theo quán tính, chạm để mở danh sách bài.
 * Bộ thẻ được lặp lại vài lần; vị trí x luôn quấn trong một vòng nên nhìn liền mạch. Ít thẻ không đủ phủ màn hình thì đứng yên ở giữa.
 */
function ArtistRoll({ artists }: { artists: Artist[] }) {
  const box = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [loop, setLoop] = useState(0); // bề rộng một bộ thẻ (px); 0 = đứng yên
  const st = useRef({
    speed: 0,
    fling: 0, // vận tốc quán tính (px/giây), tắt dần
    slow: false,
    visible: true,
    moved: false,
    drag: null as null | { x0: number; v0: number; lastX: number; lastT: number },
  });
  const copies = loop ? Math.max(2, Math.ceil((box.current?.clientWidth ?? innerWidth) / loop) + 1) : 1;
  const wrap = (v: number) => ((v % loop) - loop) % loop; // giữ x trong khoảng (-loop, 0]

  // đo bề rộng một bộ thẻ; chưa đủ phủ khung thì không cuộn
  useLayoutEffect(() => {
    const measure = () => {
      const cards = track.current!.children;
      const first = cards[0] as HTMLElement;
      const last = cards[artists.length - 1] as HTMLElement;
      const gap = parseFloat(getComputedStyle(track.current!).columnGap) || 0;
      const w = last.offsetLeft + last.offsetWidth + gap - first.offsetLeft;
      setLoop(w > box.current!.clientWidth ? w : 0);
    };
    measure();
    x.set(0);
    const ro = new ResizeObserver(measure);
    ro.observe(box.current!);
    const io = new IntersectionObserver(([e]) => (st.current.visible = e.isIntersecting));
    io.observe(box.current!);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [artists, x]);

  useAnimationFrame((_, dt) => {
    const s = st.current;
    const { now, mini } = useStore.getState();
    // không cuộn khi đang kéo, khi nằm ngoài màn hình, hoặc khi trình phát lớn đang che trang
    if (!loop || s.drag || !s.visible || (now && !mini)) return;
    const target = calm ? 0 : s.slow ? 6 : 36; // px mỗi giây
    s.speed += (target - s.speed) * Math.min(1, dt / 400);
    s.fling = Math.abs(s.fling) < 1 ? 0 : s.fling * Math.exp(-dt / 325); // tắt dần như cuộn trên điện thoại
    x.set(wrap(x.get() + ((s.fling - s.speed) * dt) / 1000));
  });

  const onPointerMove = (e: React.PointerEvent) => {
    const s = st.current;
    const d = s.drag;
    if (!d) return;
    if (!s.moved && Math.abs(e.clientX - d.x0) > 6) {
      s.moved = true;
      box.current!.setPointerCapture(e.pointerId);
    }
    if (!s.moved) return;
    const dt = e.timeStamp - d.lastT;
    if (dt > 0) s.fling = 0.8 * (((e.clientX - d.lastX) / dt) * 1000) + 0.2 * s.fling;
    d.lastX = e.clientX;
    d.lastT = e.timeStamp;
    x.set(wrap(d.v0 + e.clientX - d.x0));
  };
  const endDrag = (e: React.PointerEvent) => {
    const d = st.current.drag;
    if (d && e.timeStamp - d.lastT > 80) st.current.fling = 0; // giữ tay đứng yên rồi mới thả thì không trôi
    st.current.drag = null;
  };

  return (
    <div
      ref={box}
      className="roll"
      data-static={!loop}
      aria-label="Nghệ sĩ: kéo ngang để lướt, phím mũi tên để trôi nhanh"
      onPointerDown={(e) => {
        if (!loop) return;
        st.current.moved = false;
        st.current.fling = 0;
        st.current.drag = { x0: e.clientX, v0: x.get(), lastX: e.clientX, lastT: e.timeStamp };
      }}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerEnter={(e) => e.pointerType === 'mouse' && (st.current.slow = true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && (st.current.slow = false)}
      onFocus={() => (st.current.slow = true)}
      onBlur={() => (st.current.slow = false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') st.current.fling -= 900; // ~ một thẻ
        else if (e.key === 'ArrowLeft') st.current.fling += 900;
      }}
    >
      <motion.div ref={track} className="roll-track" style={{ x }}>
        {Array.from({ length: copies }, (_, copy) =>
          artists.map((a) => (
            <button
              key={`${copy}-${a.id}`}
              className="roll-card"
              // bản lặp chỉ để nhìn liền mạch: không cho đọc màn hình và phím Tab đi vào
              aria-hidden={copy > 0 || undefined}
              tabIndex={copy > 0 ? -1 : undefined}
              // e.detail === 0: kích hoạt bằng bàn phím, không phải cú thả tay sau khi kéo
              onClick={(e) => (e.detail === 0 || !st.current.moved) && set({ sheet: a })}
            >
              <div className="card-thumb" data-initial={a.name[0]}>
                {/* không lazy: thẻ trôi từ ngoài màn hình vào, lazy làm ảnh trống lúc đang lướt */}
                <img
                  src={artistSrc(a, 480)}
                  alt={copy === 0 ? a.name : ''}
                  draggable={false}
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={imgFallback(a)}
                />
                <div className="card-glass-glow" />
              </div>
              <div className="card-meta">
                <strong>{a.name}</strong>
                <small>
                  {GENRE[a.genre] ?? a.genre} · {a.tracks.length} bài
                </small>
              </div>
            </button>
          )),
        )}
      </motion.div>
    </div>
  );
}
