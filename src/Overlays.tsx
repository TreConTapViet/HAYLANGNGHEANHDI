import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { AnimatePresence, motion, useDragControls } from 'motion/react';
import {
  calm,
  cover,
  cycleRepeat,
  getDuration,
  getTime,
  play,
  seek,
  setVolume,
  showToast,
  step,
  stop,
  toggle,
  toggleMute,
  toggleShuffle,
  useStore,
} from './player';

const set = useStore.setState;

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

function formatTime(s: number) {
  if (!s || isNaN(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function Overlays() {
  return (
    <>
      <Sheet />
      <Player />
      <Toast />
    </>
  );
}

function Toast() {
  const toast = useStore((s) => s.toast);
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          className="toast"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
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
                const current = now?.track.id === t.id;
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

function ProgressBar({ mini }: { mini: boolean }) {
  const status = useStore((s) => s.status);
  const preview = useStore((s) => s.preview);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);

  useEffect(() => {
    const update = () => {
      if (!scrubbing) {
        setTime(getTime());
        setDuration(getDuration());
      }
    };
    update();
    const id = setInterval(update, 250);
    return () => clearInterval(id);
  }, [status, preview, scrubbing]);

  const cur = scrubbing ? scrubTime : time;
  const dur = duration > 0 ? duration : preview ? 30 : 0;
  const pct = dur > 0 ? Math.min(100, Math.max(0, (cur / dur) * 100)) : 0;

  if (mini) {
    return (
      <div className="mini-progress" aria-hidden>
        <div className="mini-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    );
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dur <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const target = ratio * dur;
    seek(target);
    setTime(target);
  };

  return (
    <div className="progress-wrap">
      <span className="time">{formatTime(cur)}</span>
      <div
        className="scrubber"
        role="slider"
        tabIndex={0}
        aria-label="Tiến độ bài hát"
        aria-valuemin={0}
        aria-valuemax={dur}
        aria-valuenow={cur}
        aria-valuetext={`${formatTime(cur)} trên ${formatTime(dur)}`}
        onClick={handleSeek}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') seek(Math.min(dur, cur + 5));
          else if (e.key === 'ArrowLeft') seek(Math.max(0, cur - 5));
        }}
      >
        <div className="bar">
          <div className="fill" style={{ width: `${pct}%` }} />
          <div className="thumb" style={{ left: `${pct}%` }} />
        </div>
      </div>
      <span className="time">{formatTime(dur)}</span>
    </div>
  );
}

function Player() {
  const now = useStore((s) => s.now);
  const mini = useStore((s) => s.mini);
  const status = useStore((s) => s.status);
  const preview = useStore((s) => s.preview);
  const repeat = useStore((s) => s.repeat);
  const shuffle = useStore((s) => s.shuffle);
  const muted = useStore((s) => s.muted);
  const volume = useStore((s) => s.volume);
  const queueOpen = useStore((s) => s.queueOpen);

  const setMini = (mini: boolean) => morph(() => set({ mini }));

  useKey(!!now, (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (e.key === 'Escape') {
      if (queueOpen) set({ queueOpen: false });
      else if (!mini) setMini(true);
    } else if (e.key === 'ArrowRight' && !mini) {
      step(1);
    } else if (e.key === 'ArrowLeft' && !mini) {
      step(-1);
    } else if (e.key === ' ' && !(e.target instanceof HTMLButtonElement)) {
      e.preventDefault();
      toggle();
    } else if (e.key === 'm' || e.key === 'M') {
      toggleMute();
    } else if (e.key === 'f' || e.key === 'F') {
      setMini(!mini);
    } else if (e.key === 's' || e.key === 'S') {
      toggleShuffle();
    } else if (e.key === 'r' || e.key === 'R') {
      cycleRepeat();
    } else if (e.key === 'ArrowUp' && !mini) {
      e.preventDefault();
      setVolume(Math.min(100, volume + 5));
    } else if (e.key === 'ArrowDown' && !mini) {
      e.preventDefault();
      setVolume(Math.max(0, volume - 5));
    }
  });

  if (!now) return null;
  const { artist, track } = now;
  const playing = status === 'playing';

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}?artist=${artist.id}&track=${track.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => showToast('Đã sao chép liên kết bài hát!'))
        .catch(() => showToast('Không thể sao chép liên kết'));
    } else {
      showToast('Đã tạo liên kết bài hát');
    }
  };

  const repeatIcon = repeat === 'one' ? '🔂' : repeat === 'off' ? '➡' : '🔁';

  return (
    <section
      className="player"
      data-mini={mini}
      data-preview={preview}
      aria-label="Trình phát nhạc"
      onClick={() => {
        if (mini) setMini(false);
      }}
    >
      <img className="backdrop" src={cover(track, 100)} alt="" />
      <button
        className="size"
        aria-label={mini ? 'Mở rộng trình phát' : 'Thu gọn trình phát'}
        onClick={(e) => {
          e.stopPropagation();
          setMini(!mini);
        }}
      >
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
        onPointerDown={(e) => {
          const player = e.currentTarget.parentElement!;
          player.dataset.drag = '';
          addEventListener('pointerup', () => delete player.dataset.drag, { once: true });
        }}
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

      <div className="panel" onClick={(e) => mini && e.stopPropagation()}>
        {/* Khung YouTube: luôn nhìn thấy, ≥200×200, không phủ gì lên (điều khoản YouTube) */}
        <div className="frame" hidden={preview}>
          <div id="yt" />
        </div>

        <div className="meta" aria-live="polite">
          <h2>{track.title}</h2>
          <p>{artist.name}{track.feat && ` ft. ${track.feat}`}</p>
          {preview && (
            <p className="note">
              Video không phát được ở đây nên bạn đang nghe bản thử 30 giây.{' '}
              <a href={`https://www.youtube.com/watch?v=${track.id}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                Nghe đầy đủ trên YouTube
              </a>
            </p>
          )}
          {status === 'error' && <p className="note">Không phát được bài này, đang thử bài kế…</p>}
        </div>

        <ProgressBar mini={mini} />

        <div className="controls">
          {!mini && (
            <button
              className="extra"
              aria-label="Phát ngẫu nhiên"
              data-active={shuffle}
              onClick={(e) => {
                e.stopPropagation();
                toggleShuffle();
              }}
            >
              🔀
            </button>
          )}

          <button
            aria-label="Bài trước"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
          >
            ⏮
          </button>
          <button
            className="main"
            aria-label={playing ? 'Tạm dừng' : 'Phát'}
            onClick={(e) => {
              e.stopPropagation();
              toggle();
            }}
          >
            {status === 'loading' ? '…' : playing ? '❚❚' : '▶'}
          </button>
          <button
            aria-label="Bài kế"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
          >
            ⏭
          </button>

          {!mini && (
            <>
              <button
                className="extra"
                aria-label="Chế độ lặp lại"
                data-active={repeat !== 'off'}
                onClick={(e) => {
                  e.stopPropagation();
                  cycleRepeat();
                }}
              >
                {repeatIcon}
              </button>
              <button
                className="extra"
                aria-label="Danh sách phát của nghệ sĩ"
                data-active={queueOpen}
                onClick={(e) => {
                  e.stopPropagation();
                  set({ queueOpen: !queueOpen });
                }}
              >
                ☰
              </button>
              <button
                className="extra"
                aria-label="Sao chép liên kết chia sẻ bài hát"
                onClick={handleShare}
              >
                🔗
              </button>
              <div className="volume-wrap">
                <button
                  className="extra"
                  aria-label={muted ? 'Bật âm thanh' : 'Tắt tiếng'}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                >
                  {muted || volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊'}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={muted ? 0 : volume}
                  aria-label="Âm lượng"
                  className="volume-slider"
                  onChange={(e) => setVolume(Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </>
          )}

          <button
            aria-label="Tắt nhạc"
            onClick={(e) => {
              e.stopPropagation();
              stop();
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Danh sách bài hát hiện tại (Queue drawer trong Full Player) */}
      <AnimatePresence>
        {!mini && queueOpen && (
          <motion.aside
            className="player-queue"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
          >
            <header>
              <div>
                <h3>Danh sách bài hát</h3>
                <small>{artist.name} · {artist.tracks.length} bài</small>
              </div>
              <button aria-label="Đóng danh sách" onClick={() => set({ queueOpen: false })}>✕</button>
            </header>
            <ol>
              {artist.tracks.map((t) => {
                const current = track.id === t.id;
                return (
                  <li key={t.id}>
                    <button
                      aria-current={current || undefined}
                      onClick={() => play(artist, t)}
                    >
                      <img src={cover(t, 100)} alt="" loading="lazy" />
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
        )}
      </AnimatePresence>
    </section>
  );
}
