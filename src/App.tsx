import { useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { AnimatePresence, motion, useDragControls } from 'motion/react';
import { cover, play, step, stop, toggle, useStore, type Artist } from './player';

const set = useStore.setState;
const HERO_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260908_125738_eb584080-9f98-489e-adb2-014760aa34da.mp4';
const HERO_POSTER = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260908_122011_59c97465-4d23-4fdc-ac40-f6832f573e28.png&w=1920&q=85';
const GENRE: Record<string, string> = { rap: 'Rap', pop: 'Pop', indie: 'Indie', ballad: 'Ballad' };
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches || (navigator as any).connection?.saveData;

// Chuyển cảnh mượt giữa trình phát lớn và thẻ nhỏ nếu trình duyệt hỗ trợ
const morph = (change: () => void) =>
  'startViewTransition' in document && !calm ? document.startViewTransition(() => flushSync(change)) : change();

function useKey(active: boolean, onKey: (e: KeyboardEvent) => void) {
  const fn = useRef(onKey);
  fn.current = onKey;
  useEffect(() => {
    if (!active) return;
    const h = (e: KeyboardEvent) => fn.current(e);
    addEventListener('keydown', h);
    return () => removeEventListener('keydown', h);
  }, [active]);
}

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
      <Sheet />
      <Player />
    </>
  );
}

function Hero() {
  return (
    <header className="hero">
      <div className="hero-media">
        <img src={HERO_POSTER} alt="Mâm đĩa than trên tảng đá phủ rêu giữa đồng cỏ lúc hoàng hôn" />
        {!calm && (
          <video
            src={HERO_VIDEO}
            poster={HERO_POSTER}
            autoPlay
            muted
            loop
            playsInline
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
                e.currentTarget.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
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

function Sheet() {
  const artist = useStore((s) => s.sheet);
  const now = useStore((s) => s.now);
  const playing = useStore((s) => s.status === 'playing');
  const drag = useDragControls();
  const close = () => set({ sheet: null });
  useKey(!!artist, (e) => e.key === 'Escape' && close());

  return (
    <AnimatePresence>
      {artist && (
        <>
          <motion.div className="scrim" onClick={close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={`Bài hát của ${artist.name}`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="y"
            dragListener={false} // chỉ kéo ở phần đầu, để danh sách vẫn cuộn được
            dragControls={drag}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 1 }}
            onDragEnd={(_, i) => (i.offset.y > 120 || i.velocity.y > 500) && close()}
          >
            <header onPointerDown={(e) => drag.start(e)}>
              <img src={artist.image} alt="" />
              <div>
                <h2>{artist.name}</h2>
                <small>{artist.tracks.length} bài · kéo xuống để đóng</small>
              </div>
              <button autoFocus aria-label="Đóng" onPointerDown={(e) => e.stopPropagation()} onClick={close}>✕</button>
            </header>
            <ol>
              {artist.tracks.map((t) => {
                const current = now?.track === t;
                return (
                  <li key={t.id}>
                    <button
                      aria-current={current || undefined}
                      onClick={() => {
                        set({ sheet: null, mini: false });
                        play(artist, t);
                      }}
                    >
                      <img src={cover(t, 100)} alt="" loading="lazy" decoding="async" />
                      <span>
                        {t.title}
                        <small>{[t.feat && `ft. ${t.feat}`, t.album].filter(Boolean).join(' · ') || artist.name}</small>
                      </span>
                      {current ? <i className="wave" data-on={playing}><b /><b /><b /><b /></i> : <small>{t.kind.toUpperCase()}</small>}
                    </button>
                  </li>
                );
              })}
            </ol>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Player() {
  const now = useStore((s) => s.now);
  const mini = useStore((s) => s.mini);
  const status = useStore((s) => s.status);
  const preview = useStore((s) => s.preview);
  const setMini = (mini: boolean) => morph(() => set({ mini }));
  useKey(!!now && !mini, (e) => {
    if (e.key === 'Escape') setMini(true);
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === ' ' && !(e.target instanceof HTMLButtonElement)) (e.preventDefault(), toggle());
  });
  if (!now) return null;
  const { artist, track } = now;
  const playing = status === 'playing';

  return (
    <section className="player" data-mini={mini} aria-label="Trình phát">
      <img className="backdrop" src={cover(track, 100)} alt="" />
      <button className="size" aria-label={mini ? 'Mở rộng trình phát' : 'Thu gọn trình phát'} onClick={() => setMini(!mini)}>
        {mini ? '⌃' : '⌄'}
      </button>

      {/* Vuốt ngang trên đĩa: đổi bài. Vuốt xuống: thu gọn. */}
      <motion.div
        className="vinyl"
        drag
        dragDirectionLock
        dragSnapToOrigin
        dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
        dragElastic={0.5}
        onDragEnd={(_, i) => {
          if (Math.abs(i.offset.x) > 60) step(i.offset.x < 0 ? 1 : -1);
          else if (i.offset.y > 120) setMini(true);
        }}
      >
        <div className="disc" data-spin={playing}>
          <img src={cover(track, 300)} alt={`Bìa ${track.album ?? track.title}`} draggable={false} />
        </div>
        <img className="face" src={artist.image} alt={artist.name} draggable={false} />
      </motion.div>

      <div className="panel">
        {/* Khung YouTube: luôn nhìn thấy, ≥200×200, không phủ gì lên (điều khoản YouTube) */}
        <div className="frame" hidden={preview}><div id="yt" /></div>
        <div className="meta" aria-live="polite">
          <h2>{track.title}</h2>
          <p>{artist.name}{track.feat && ` ft. ${track.feat}`}</p>
          {preview && (
            <p className="note">
              Video không phát được ở đây nên bạn đang nghe bản thử 30 giây.{' '}
              <a href={`https://www.youtube.com/watch?v=${track.id}`} target="_blank" rel="noreferrer">Nghe đầy đủ trên YouTube</a>
            </p>
          )}
          {status === 'error' && <p className="note">Không phát được bài này, đang thử bài kế…</p>}
        </div>
        <div className="controls">
          <button aria-label="Bài trước" onClick={() => step(-1)}>⏮</button>
          <button className="main" aria-label={playing ? 'Tạm dừng' : 'Phát'} onClick={toggle}>
            {status === 'loading' ? '…' : playing ? '❚❚' : '▶'}
          </button>
          <button aria-label="Bài kế" onClick={() => step(1)}>⏭</button>
          <button aria-label="Tắt nhạc" onClick={stop}>✕</button>
        </div>
      </div>
    </section>
  );
}
