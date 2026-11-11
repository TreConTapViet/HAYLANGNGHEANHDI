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

type State = {
  artists: Artist[] | null;
  failed: boolean;
  sheet: Artist | null; // bảng bài hát đang mở
  now: { artist: Artist; track: Track } | null;
  mini: boolean;
  status: 'loading' | 'playing' | 'paused' | 'error';
  preview: boolean; // đang phát bản nghe thử thay cho YouTube
};

export const useStore = create<State>(() => ({
  artists: null,
  failed: false,
  sheet: null,
  now: null,
  mini: false,
  status: 'loading',
  preview: false,
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
const audio = new Audio();

audio.onplaying = () => set({ status: 'playing' });
audio.onpause = () => get().preview && set({ status: 'paused' });
audio.onended = () => step(1);
audio.onerror = () => get().preview && fail();

const loadApi = () =>
  (api ??= new Promise<void>((resolve) => {
    (window as any).onYouTubeIframeAPIReady = resolve;
    document.head.append(Object.assign(document.createElement('script'), { src: 'https://www.youtube.com/iframe_api' }));
  }));

/** Chỉ gọi từ cử chỉ của khách (trình duyệt chặn tự phát nếu không có). */
export async function play(artist: Artist, track: Track) {
  audio.pause();
  set({ now: { artist, track }, status: 'loading', preview: false });
  await loadApi();
  if (get().now?.track !== track) return; // khách đã đổi bài trong lúc chờ
  if (yt?.loadVideoById) return yt.loadVideoById(track.id);
  if (yt) return; // trình phát đang khởi tạo, onReady sẽ nạp bài hiện tại
  yt = new YT.Player('yt', {
    host: 'https://www.youtube-nocookie.com',
    width: '100%',
    height: '100%',
    videoId: track.id,
    playerVars: { playsinline: 1, rel: 0, autoplay: 1 },
    events: {
      onReady: () => {
        const cur = get().now?.track;
        if (cur && cur !== track) yt.loadVideoById(cur.id);
        else yt.playVideo();
      },
      onStateChange: ({ data }: { data: number }) => {
        if (get().preview) return;
        if (data === 0) return step(1);
        if (data === 1) fails = 0;
        // -1/5: chưa bắt đầu (có thể bị chặn tự phát) → để nút "Phát" cho khách bấm
        set({ status: data === 1 ? 'playing' : data === 3 ? 'loading' : 'paused' });
      },
      onError: usePreview, // 101/150 = cấm nhúng, 100 = video mất
    },
  });
}

function usePreview() {
  const t = get().now?.track;
  if (!t?.preview) return fail();
  yt?.stopVideo?.();
  set({ preview: true, status: 'loading' });
  audio.src = t.preview;
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
  if (preview) status === 'playing' ? audio.pause() : audio.play();
  else status === 'playing' ? yt?.pauseVideo?.() : yt?.playVideo?.();
}

export function step(dir: 1 | -1) {
  const now = get().now;
  if (!now) return;
  const { preview } = get();
  // Lùi khi đã nghe quá 3 giây = phát lại từ đầu, giống các app nhạc quen thuộc
  if (dir < 0 && ((preview ? audio.currentTime : yt?.getCurrentTime?.()) ?? 0) > 3) {
    if (preview) audio.currentTime = 0;
    else yt.seekTo(0, true);
    return;
  }
  const list = now.artist.tracks;
  play(now.artist, list[(list.indexOf(now.track) + dir + list.length) % list.length]);
}

export function stop() {
  audio.pause();
  yt?.destroy?.();
  yt = undefined;
  set({ now: null, mini: false });
}
