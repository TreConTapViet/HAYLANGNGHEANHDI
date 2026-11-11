import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { AnimatePresence, motion, useDragControls, type Variants } from 'motion/react';
import {
  artistSrc,
  calm,
  cover,
  cycleRepeat,
  getDuration,
  getTime,
  imgFallback,
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
  type Artist,
  type Track,
} from './player';
import Lyrics from './Lyrics';
import {
  IconChevronDown,
  IconChevronUp,
  IconClose,
  IconLyrics,
  IconNext,
  IconPause,
  IconPlay,
  IconPrev,
  IconQueue,
  IconRepeat,
  IconRepeatOne,
  IconShare,
  IconShuffle,
  IconVolume,
  IconVolumeMute,
} from './Icons';

const set = useStore.setState;
const spring = { type: 'spring', stiffness: 300, damping: 32 } as const;

/** Màn đủ rộng cho ba cột (danh sách | lời | đĩa); hẹp hơn thì danh sách là ngăn kéo phủ lên lời. */
const wide = () => matchMedia('(min-width: 1100px)').matches;

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

/** Danh sách bài dùng chung cho bảng nghệ sĩ và cột danh sách trong trình phát. */
function TrackList({ artist, onPick }: { artist: Artist; onPick: (t: Track) => void }) {
  const nowId = useStore((s) => s.now?.track.id);
  const playing = useStore((s) => s.status === 'playing');
  return (
    <ol>
      {artist.tracks.map((t) => {
        const current = nowId === t.id;
        return (
          <li key={t.id}>
            <button aria-current={current || undefined} onClick={() => onPick(t)}>
              <img src={cover(t, 100)} alt="" loading="lazy" decoding="async" />
              <span>
                {t.title}
                <small>{[t.feat && `ft. ${t.feat}`, t.album].filter(Boolean).join(' · ') || artist.name}</small>
              </span>
              {current ? (
                <i className="wave" data-on={playing}>
                  <b />
                  <b />
                  <b />
                  <b />
                </i>
              ) : (
                t.lyrics && (
                  <span className="has-lyrics" title="Có lời chạy theo nhạc">
                    <IconLyrics size={16} />
                  </span>
                )
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

// Cách bảng nghệ sĩ rời màn hình: chọn bài trên màn rộng thì bảng "bay" sang trái thành cột danh sách
// (layoutId lo phần di chuyển, bảng chỉ mờ đi); màn hẹp thì trượt sang trái; đóng thường thì trượt xuống.
type Exit = 'move' | 'slide' | 'close';
const sheetMotion: Variants = {
  hidden: { y: '100%' },
  shown: { y: 0, x: 0, opacity: 1 },
  gone: (how: Exit) =>
    how === 'move' ? { opacity: 0, transition: { duration: 0.2 } } : how === 'slide' ? { x: '-100%', opacity: 0 } : { y: '100%' },
};

function Sheet() {
  const artist = useStore((s) => s.sheet);
  const drag = useDragControls();
  const exit = useRef<Exit>('close');
  const close = () => {
    exit.current = 'close';
    set({ sheet: null });
  };
  useKey(!!artist, (e) => e.key === 'Escape' && close());

  return (
    <AnimatePresence custom={exit.current}>
      {artist && (
        <>
          <motion.div className="scrim" onClick={close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={`Bài hát của ${artist.name}`}
            layoutId={wide() ? 'tracklist' : undefined}
            variants={sheetMotion}
            custom={exit.current}
            initial="hidden"
            animate="shown"
            exit="gone"
            transition={spring}
            drag="y"
            dragListener={false}
            dragControls={drag}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 1 }}
            onDragEnd={(_, i) => (i.offset.y > 120 || i.velocity.y > 500) && close()}
          >
            <header onPointerDown={(e) => drag.start(e)}>
              <img src={artistSrc(artist, 120)} alt={artist.name} referrerPolicy="no-referrer" onError={imgFallback(artist)} />
              <div>
                <h2>{artist.name}</h2>
                <small>{artist.tracks.length} bài · kéo xuống để đóng</small>
              </div>
              <button autoFocus aria-label="Đóng" onPointerDown={(e) => e.stopPropagation()} onClick={close}>
                <IconClose size={20} />
              </button>
            </header>
            <TrackList
              artist={artist}
              onPick={(t) => {
                const w = wide();
                exit.current = w ? 'move' : 'slide';
                // màn rộng: mở cột danh sách để bảng nối tiếp thành cột đó; màn hẹp: để lời chiếm màn hình
                set({ sheet: null, mini: false, queueOpen: w });
                play(artist, t);
              }}
            />
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

  useEffect(() => {
    const update = () => {
      setTime(getTime());
      setDuration(getDuration());
    };
    update();
    const id = setInterval(update, 250);
    return () => clearInterval(id);
  }, [status, preview]);

  const dur = duration > 0 ? duration : preview ? 30 : 0;
  const pct = dur > 0 ? Math.min(100, Math.max(0, (time / dur) * 100)) : 0;

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
    const target = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * dur;
    seek(target);
    setTime(target);
  };

  return (
    <div className="progress-wrap">
      <span className="time">{formatTime(time)}</span>
      <div
        className="scrubber"
        role="slider"
        tabIndex={0}
        aria-label="Tiến độ bài hát"
        aria-valuemin={0}
        aria-valuemax={dur}
        aria-valuenow={time}
        aria-valuetext={`${formatTime(time)} trên ${formatTime(dur)}`}
        onClick={handleSeek}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') seek(Math.min(dur, time + 5));
          else if (e.key === 'ArrowLeft') seek(Math.max(0, time - 5));
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

/** Nút trong trình phát: chặn sự kiện để chạm vào nút trên thẻ nhỏ không làm thẻ mở rộng. */
function Btn({ onPress, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { onPress: () => void }) {
  return (
    <button
      {...props}
      onClick={(e) => {
        e.stopPropagation();
        onPress();
      }}
    />
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
    } else if (e.key === 'ArrowRight' && !mini) step(1);
    else if (e.key === 'ArrowLeft' && !mini) step(-1);
    else if (e.key === ' ' && !(e.target instanceof HTMLButtonElement)) {
      e.preventDefault();
      toggle();
    } else if (e.key === 'm' || e.key === 'M') toggleMute();
    else if (e.key === 'f' || e.key === 'F') setMini(!mini);
    else if (e.key === 's' || e.key === 'S') toggleShuffle();
    else if (e.key === 'r' || e.key === 'R') cycleRepeat();
    else if (e.key === 'l' || e.key === 'L') set({ queueOpen: !queueOpen });
    else if (e.key === 'ArrowUp' && !mini) {
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
  const showQueue = !mini && queueOpen;

  const share = () => {
    const url = `${location.origin}${location.pathname}?artist=${artist.id}&track=${track.id}`;
    if (!navigator.clipboard) return showToast('Trình duyệt không cho sao chép, hãy chép địa chỉ trên thanh trình duyệt');
    navigator.clipboard
      .writeText(url)
      .then(() => showToast('Đã sao chép liên kết bài hát!'))
      .catch(() => showToast('Không thể sao chép liên kết'));
  };

  // Thứ tự con trong section phải giữ cố định: khung #yt chứa iframe YouTube, React đổi chỗ là iframe bị tạo lại.
  return (
    <section
      className="player"
      data-mini={mini}
      data-preview={preview}
      data-queue={showQueue}
      aria-label="Trình phát nhạc"
      onClick={() => mini && setMini(false)}
    >
      <img className="backdrop" src={artistSrc(artist, 200)} alt="" referrerPolicy="no-referrer" onError={imgFallback(artist)} />
      <Btn className="size" aria-label={mini ? 'Mở rộng trình phát' : 'Thu gọn trình phát'} onPress={() => setMini(!mini)}>
        {mini ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
      </Btn>

      <AnimatePresence>
        {showQueue && (
          <motion.aside
            className="player-queue"
            layoutId={wide() ? 'tracklist' : undefined}
            initial={{ opacity: 0, x: wide() ? -40 : '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: wide() ? -40 : '-100%' }}
            transition={spring}
          >
            <header>
              <img src={artistSrc(artist, 120)} alt="" referrerPolicy="no-referrer" onError={imgFallback(artist)} />
              <div>
                <h3>{artist.name}</h3>
                <small>{artist.tracks.length} bài</small>
              </div>
              <Btn aria-label="Đóng danh sách" onPress={() => set({ queueOpen: false })}>
                <IconClose size={18} />
              </Btn>
            </header>
            <TrackList
              artist={artist}
              onPick={(t) => {
                play(artist, t);
                if (!wide()) set({ queueOpen: false }); // màn hẹp: đóng ngăn kéo để thấy lời
              }}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {!mini && <Lyrics track={track} />}

      {/* Vuốt ngang trên đĩa: đổi bài. Vuốt xuống: thu gọn. */}
      <motion.div
        className="vinyl"
        drag
        dragDirectionLock
        dragSnapToOrigin
        dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
        dragElastic={0.5}
        // đang kéo thì tắt nhận chuột của khung YouTube (CSS), nếu không iframe sẽ nuốt mất sự kiện khi con trỏ đi qua nó
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
        <img className="face" src={artistSrc(artist, 120)} alt={artist.name} draggable={false} referrerPolicy="no-referrer" onError={imgFallback(artist)} />
      </motion.div>

      <div className="meta" aria-live="polite">
        <h2>{track.title}</h2>
        <p>
          {artist.name}
          {track.feat && ` ft. ${track.feat}`}
        </p>
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

      {/* Khung YouTube: luôn nhìn thấy, tối thiểu 200×200px, không phủ gì lên (điều khoản YouTube, ADR-007) */}
      <div className="frame" hidden={preview}>
        <div id="yt" />
      </div>

      <ProgressBar mini={mini} />

      <div className="controls">
        {!mini && (
          <Btn className="extra" aria-label="Phát ngẫu nhiên toàn bộ nghệ sĩ" data-active={shuffle} onPress={toggleShuffle}>
            <IconShuffle size={18} />
          </Btn>
        )}
        <Btn className="step-btn" aria-label="Bài trước" onPress={() => step(-1)}>
          <IconPrev size={20} />
        </Btn>
        <Btn className="main" aria-label={playing ? 'Tạm dừng' : 'Phát'} onPress={toggle}>
          {status === 'loading' ? '…' : playing ? <IconPause size={24} fill="currentColor" /> : <IconPlay size={24} fill="currentColor" />}
        </Btn>
        <Btn className="step-btn" aria-label="Bài kế" onPress={() => step(1)}>
          <IconNext size={20} />
        </Btn>
        {!mini && (
          <>
            <Btn className="extra" aria-label="Chế độ lặp lại" data-active={repeat !== 'off'} onPress={cycleRepeat}>
              {repeat === 'one' ? <IconRepeatOne size={18} /> : <IconRepeat size={18} />}
            </Btn>
            <Btn className="extra" aria-label="Danh sách bài hát của nghệ sĩ" data-active={queueOpen} onPress={() => set({ queueOpen: !queueOpen })}>
              <IconQueue size={18} />
            </Btn>
            <Btn className="extra" aria-label="Sao chép liên kết chia sẻ bài hát" onPress={share}>
              <IconShare size={18} />
            </Btn>
            <div className="volume-wrap">
              <Btn className="extra" aria-label={muted ? 'Bật âm thanh' : 'Tắt tiếng'} onPress={toggleMute}>
                {muted || volume === 0 ? <IconVolumeMute size={18} /> : <IconVolume size={18} />}
              </Btn>
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
        <Btn className="close-btn" aria-label="Tắt nhạc" onPress={stop}>
          <IconClose size={18} />
        </Btn>
      </div>
    </section>
  );
}
