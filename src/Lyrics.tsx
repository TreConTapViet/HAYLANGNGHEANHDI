import { Fragment, useEffect, useRef, useState } from 'react';
import { calm, cover, getDuration, getTime, seek, showToast, useStore, type Track } from './player';
import { activeLine, timeLines, wordProgress, type Line } from './lrc';

type Loaded = { lines: Line[]; duration: number } | 'none' | null;

/**
 * Lời chạy theo nhạc. React chỉ vẽ lời một lần mỗi bài; trong lúc phát, một vòng requestAnimationFrame
 * ghi thẳng tiến độ vào biến CSS (--p của chữ, --d của dòng) nên không render lại React mỗi khung hình.
 */
export default function Lyrics({ track }: { track: Track }) {
  const [data, setData] = useState<Loaded>(null);
  const preview = useStore((s) => s.preview);
  const box = useRef<HTMLDivElement>(null);
  const roll = useRef<HTMLDivElement>(null);

  // tải lời của bài
  useEffect(() => {
    setData(null);
    if (!track.lyrics) return setData('none');
    let live = true;
    fetch(`/data/lyrics/${track.id}.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: { duration: number; lines: [number, string][] }) => {
        if (live) setData({ lines: timeLines(d.lines, track.lyricsOffset ?? 0), duration: d.duration });
      })
      .catch(() => live && setData('none'));
    return () => {
      live = false;
    };
  }, [track]);

  // màu phát sáng lấy từ ảnh bìa (máy chủ ảnh của iTunes và YouTube cho phép đọc điểm ảnh)
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = c.height = 8;
      const g = c.getContext('2d', { willReadFrequently: true })!;
      g.drawImage(img, 0, 0, 8, 8);
      const px = g.getImageData(0, 0, 8, 8).data;
      const avg = [0, 0, 0];
      for (let i = 0; i < px.length; i += 4) for (let c = 0; c < 3; c++) avg[c] += px[i + c] / (px.length / 4);
      // làm sáng màu trung bình để quầng sáng luôn thấy được trên nền tối
      const k = Math.min(2.4, 230 / Math.max(1, ...avg));
      box.current?.style.setProperty('--glow', avg.map((v) => Math.round(v * k)).join(', '));
    };
    img.src = cover(track, 100);
  }, [track]);

  // vòng chạy theo nhạc
  useEffect(() => {
    if (!data || data === 'none' || !roll.current) return;
    const { lines } = data;
    const rows = [...roll.current.children] as HTMLElement[];
    const words = rows.map((r) => [...r.children] as HTMLElement[]);
    let raf = 0;
    let current = -2;
    let nowWord: HTMLElement | null = null;
    let read = -1;
    let anchorTime = 0;
    let anchorAt = 0;
    let checked = false;

    const center = (i: number) => {
      const row = rows[Math.max(0, i)];
      const y = row.offsetTop + row.offsetHeight / 2 - box.current!.clientHeight * 0.42;
      roll.current!.style.transform = `translateY(${-Math.max(0, y)}px)`;
    };

    const tick = (now: number) => {
      // YouTube chỉ cập nhật giờ vài lần mỗi giây: tự nội suy giữa hai lần đọc để chữ chạy mượt
      const t0 = getTime();
      if (t0 !== read) {
        read = t0;
        anchorTime = t0;
        anchorAt = now;
      }
      const playing = useStore.getState().status === 'playing';
      const t = playing ? anchorTime + Math.min(1, (now - anchorAt) / 1000) : anchorTime;

      if (!checked && getDuration() > 0) {
        checked = true;
        const gap = Math.round(getDuration() - data.duration);
        if (Math.abs(gap) > 3)
          showToast(`Video ${gap > 0 ? 'dài' : 'ngắn'} hơn bản thu ${Math.abs(gap)} giây, lời có thể lệch. Chạm một dòng để nhảy tới đó.`);
      }

      const i = activeLine(lines, t);
      if (i !== current) {
        // đổi dòng: đặt khoảng cách tới dòng đang hát cho mọi dòng, trả chữ của dòng cũ về trạng thái theo CSS
        rows.forEach((r, k) => {
          r.style.setProperty('--d', String(Math.min(4, Math.abs(k - Math.max(i, 0)))));
          r.dataset.s = k < i ? 'past' : k === i ? 'now' : 'next';
        });
        if (current >= 0) for (const w of words[current]) w.style.removeProperty('--p');
        current = i;
        center(i);
      }
      if (i >= 0) {
        let singing: HTMLElement | null = null;
        for (let k = 0; k < lines[i].words.length; k++) {
          const p = wordProgress(lines[i].words[k], t);
          words[i][k].style.setProperty('--p', p.toFixed(3));
          if (p > 0 && p < 1) singing = words[i][k];
        }
        // chữ đang được hát: trồi lên, phóng nhẹ (CSS theo data-on)
        if (singing !== nowWord) {
          nowWord?.removeAttribute('data-on');
          singing?.setAttribute('data-on', '');
          nowWord = singing;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onResize = () => center(current);
    addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('resize', onResize);
    };
  }, [data]);

  if (preview) {
    return (
      <div className="lyrics" ref={box}>
        <p className="lyrics-note">Đang nghe bản thử 30 giây nên lời không khớp nhạc.</p>
      </div>
    );
  }
  if (data === 'none') {
    return (
      <div className="lyrics" ref={box}>
        <p className="lyrics-note">Bài này chưa có lời đồng bộ.</p>
      </div>
    );
  }
  return (
    <div className="lyrics" ref={box} data-calm={calm} aria-label={`Lời bài hát ${track.title}`}>
      {!data && <p className="lyrics-note">Đang tải lời…</p>}
      {data && (
        <div className="lyrics-roll" ref={roll}>
          {data.lines.map((line, k) => (
            <p key={k} className="ly" onClick={() => seek(line.start)} title="Phát từ dòng này">
              {line.words.map((w, j) => (
                // khoảng trắng nằm ngoài span: span là inline-block nên khoảng trắng cuối bên trong sẽ bị nuốt
                <Fragment key={j}>
                  <span className="w">{w.text}</span>{' '}
                </Fragment>
              ))}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
