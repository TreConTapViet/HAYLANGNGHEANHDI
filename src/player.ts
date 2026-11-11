import { create } from 'zustand';

export type Track = {
  id: string; // ID video YouTube
  title: string;
  feat: string | null;
  kind: string;
  album: string | null;
  art: string | null; // bìa iTunes 100x100, đổi cỡ bằng cover()
  preview: string | null; // bản nghe thử 30s
};
export type Artist = { id: string; name: string; genre: string; image: string; tracks: Track[] };

export type RepeatMode = 'off' | 'all' | 'one';

type State = {
  artists: Artist[] | null;
  failed: boolean;
  sheet: Artist | null; // bảng bài hát đang mở
  now: { artist: Artist; track: Track } | null;
  mini: boolean;
  status: 'loading' | 'playing' | 'paused' | 'error';
  preview: boolean; // đang phát bản nghe thử thay cho YouTube
  repeat: RepeatMode;
  shuffle: boolean;
  muted: boolean;
  volume: number; // 0 - 100
  queueOpen: boolean; // mở danh sách bài trong trình phát
  toast: string | null;
};

export const useStore = create<State>(() => ({
  artists: null,
  failed: false,
  sheet: null,
  now: null,
  mini: false,
  status: 'loading',
  preview: false,
  repeat: 'all',
  shuffle: false,
  muted: false,
  volume: 100,
  queueOpen: false,
  toast: null,
}));

const set = useStore.setState;
const get = useStore.getState;

export const cover = (t: Track, size: number) =>
  t.art?.replace('100x100bb', `${size}x${size}bb`) ?? `https://i.ytimg.com/vi/${t.id}/mqdefault.jpg`;

/** Khách muốn ít chuyển động hoặc đang tiết kiệm dữ liệu: bỏ video nền và chuyển cảnh. */
export const calm: boolean =
  matchMedia('(prefers-reduced-motion: reduce)').matches || !!(navigator as any).connection?.saveData;

declare const YT: any;
let yt: any;
let api: Promise<void> | undefined;
let fails = 0;
let toastTimeout: any;
const audio = new Audio();

audio.onplaying = () => {
  fails = 0;
  set({ status: 'playing' });
  syncMediaSessionPlayback('playing');
};
audio.onpause = () => {
  if (get().preview) {
    set({ status: 'paused' });
    syncMediaSessionPlayback('paused');
  }
};
audio.onended = () => onTrackEnded();
audio.onerror = () => get().preview && fail();

const loadApi = () =>
  (api ??= new Promise<void>((resolve) => {
    (window as any).onYouTubeIframeAPIReady = resolve;
    document.head.append(Object.assign(document.createElement('script'), { src: 'https://www.youtube.com/iframe_api' }));
  }));

function syncMediaSessionPlayback(state: 'playing' | 'paused' | 'none') {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = state;
  }
}

function updateMediaSession(artist: Artist, track: Track) {
  if (!('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: artist.name + (track.feat ? ` ft. ${track.feat}` : ''),
      album: track.album || artist.name,
      artwork: [
        { src: cover(track, 100), sizes: '100x100', type: 'image/jpeg' },
        { src: cover(track, 300), sizes: '300x300', type: 'image/jpeg' },
        { src: cover(track, 600), sizes: '600x600', type: 'image/jpeg' },
      ],
    });
    navigator.mediaSession.setActionHandler('play', () => toggle());
    navigator.mediaSession.setActionHandler('pause', () => toggle());
    navigator.mediaSession.setActionHandler('previoustrack', () => step(-1));
    navigator.mediaSession.setActionHandler('nexttrack', () => step(1));
    navigator.mediaSession.setActionHandler('stop', () => stop());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime != null) seek(details.seekTime);
    });
  } catch {}
}

export function syncUrl(artist?: Artist | null, track?: Track | null) {
  try {
    const url = new URL(window.location.href);
    if (artist) url.searchParams.set('artist', artist.id);
    else url.searchParams.delete('artist');
    if (track) url.searchParams.set('track', track.id);
    else url.searchParams.delete('track');
    window.history.replaceState({}, '', url.toString());
  } catch {}
}

export function showToast(message: string) {
  clearTimeout(toastTimeout);
  set({ toast: message });
  toastTimeout = setTimeout(() => set({ toast: null }), 2600);
}

async function ensureYtElement(): Promise<HTMLElement | null> {
  for (let i = 0; i < 30; i++) {
    const el = document.getElementById('yt');
    if (el) return el;
    await new Promise((r) => requestAnimationFrame(r));
  }
  return null;
}

/** Chỉ gọi từ cử chỉ của khách (trình duyệt chặn tự phát nếu không có). */
export async function play(artist: Artist, track: Track) {
  audio.pause();
  set({ now: { artist, track }, status: 'loading', preview: false });
  updateMediaSession(artist, track);
  syncUrl(artist, track);

  await loadApi();
  if (get().now?.track !== track) return; // khách đã đổi bài trong lúc chờ
  if (yt?.loadVideoById) {
    yt.loadVideoById(track.id);
    return;
  }
  if (yt) return; // trình phát đang khởi tạo, onReady sẽ nạp bài hiện tại

  const target = await ensureYtElement();
  if (!target || get().now?.track !== track) return;

  yt = new YT.Player('yt', {
    host: 'https://www.youtube-nocookie.com',
    width: '100%',
    height: '100%',
    videoId: track.id,
    playerVars: { playsinline: 1, rel: 0, autoplay: 1, cc_load_policy: 1 },
    events: {
      onReady: () => {
        const cur = get().now?.track;
        if (cur && cur !== track) yt.loadVideoById(cur.id);
        else yt.playVideo();
        if (get().muted) yt.mute?.();
        else yt.setVolume?.(get().volume);
      },
      onStateChange: ({ data }: { data: number }) => {
        if (get().preview) return;
        if (data === 0) return onTrackEnded();
        if (data === 1) fails = 0;
        // -1/5: chưa bắt đầu (có thể bị chặn tự phát) → để nút "Phát" cho khách bấm
        const st = data === 1 ? 'playing' : data === 3 ? 'loading' : 'paused';
        set({ status: st });
        syncMediaSessionPlayback(st === 'playing' ? 'playing' : 'paused');
      },
      onError: usePreview, // 101/150 = cấm nhúng, 100 = video mất
    },
  });
}

function onTrackEnded() {
  const { repeat } = get();
  if (repeat === 'one') {
    seek(0);
    toggle();
    return;
  }
  step(1, true);
}

function usePreview() {
  const t = get().now?.track;
  if (!t?.preview) return fail();
  yt?.stopVideo?.();
  set({ preview: true, status: 'loading' });
  audio.src = t.preview;
  audio.volume = get().muted ? 0 : get().volume / 100;
  audio.play().catch(() => set({ status: 'paused' }));
}

function fail() {
  const now = get().now;
  set({ status: 'error' });
  if (!now || ++fails >= now.artist.tracks.length) return; // hỏng cả danh sách (mất mạng) thì dừng, không lặp vô hạn
  setTimeout(() => get().now === now && step(1), 2000);
}

export function toggle() {
  const { status, preview } = get();
  if (preview) {
    if (status === 'playing') audio.pause();
    else audio.play();
  } else {
    if (status === 'playing') yt?.pauseVideo?.();
    else yt?.playVideo?.();
  }
}

export function getTime(): number {
  const { preview } = get();
  if (preview) return audio.currentTime || 0;
  return yt?.getCurrentTime ? (yt.getCurrentTime() || 0) : 0;
}

export function getDuration(): number {
  const { preview } = get();
  if (preview) return audio.duration || 30;
  return yt?.getDuration ? (yt.getDuration() || 0) : 0;
}

export function seek(seconds: number) {
  const { preview } = get();
  if (preview) {
    audio.currentTime = seconds;
  } else if (yt?.seekTo) {
    yt.seekTo(seconds, true);
  }
}

export function setVolume(vol: number) {
  vol = Math.max(0, Math.min(100, Math.round(vol)));
  set({ volume: vol, muted: vol === 0 });
  audio.volume = vol / 100;
  if (yt) {
    if (vol === 0) yt.mute?.();
    else {
      yt.unMute?.();
      yt.setVolume?.(vol);
    }
  }
}

export function toggleMute() {
  const isMuted = !get().muted;
  set({ muted: isMuted });
  audio.muted = isMuted;
  if (yt) {
    if (isMuted) yt.mute?.();
    else {
      yt.unMute?.();
      yt.setVolume?.(get().volume);
    }
  }
}

export function cycleRepeat() {
  const modes: RepeatMode[] = ['all', 'one', 'off'];
  const cur = get().repeat;
  const next = modes[(modes.indexOf(cur) + 1) % modes.length];
  set({ repeat: next });
  const labels: Record<RepeatMode, string> = {
    all: 'Lặp lại toàn bộ danh sách',
    one: 'Lặp lại 1 bài',
    off: 'Tắt lặp lại',
  };
  showToast(labels[next]);
}

export function toggleShuffle() {
  const next = !get().shuffle;
  set({ shuffle: next });
  showToast(next ? 'Bật phát ngẫu nhiên' : 'Tắt phát ngẫu nhiên');
}

export function step(dir: 1 | -1, autoEnd = false) {
  const { now, repeat, shuffle } = get();
  if (!now) return;
  // Lùi khi đã nghe quá 3 giây = phát lại từ đầu
  if (!autoEnd && dir < 0 && getTime() > 3) {
    seek(0);
    return;
  }
  const list = now.artist.tracks;
  const idx = list.indexOf(now.track);

  if (autoEnd && repeat === 'off' && idx === list.length - 1 && dir > 0) {
    set({ status: 'paused' });
    return;
  }

  let nextTrack: Track;
  if (shuffle && list.length > 1) {
    let nextIdx = idx;
    while (nextIdx === idx) {
      nextIdx = Math.floor(Math.random() * list.length);
    }
    nextTrack = list[nextIdx];
  } else {
    nextTrack = list[(idx + dir + list.length) % list.length];
  }
  play(now.artist, nextTrack);
}

export function stop() {
  audio.pause();
  yt?.destroy?.();
  yt = undefined;
  set({ now: null, mini: false, queueOpen: false });
  syncUrl(null, null);
  syncMediaSessionPlayback('none');
}
