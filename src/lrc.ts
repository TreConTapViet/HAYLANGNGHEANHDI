// Lời bài hát đồng bộ. Nguồn (LRCLIB) chỉ có giờ bắt đầu của từng dòng,
// nên giờ của từng chữ trong dòng là ước lượng.

export type Word = { text: string; start: number; end: number };
export type Line = { start: number; end: number; words: Word[] };

const SECONDS_PER_WORD = 0.42; // nhịp hát trung bình một tiếng (chữ) tiếng Việt

/** [[giây, lời], ...] → các dòng có giờ từng chữ. Dòng trống trong LRC là đoạn nhạc dạo: chỉ dùng làm mốc kết thúc dòng trước. */
export function timeLines(raw: [number, string][], offset = 0): Line[] {
  const lines: Line[] = [];
  raw.forEach(([t, text], i) => {
    const tokens = text.split(/\s+/).filter(Boolean);
    if (!tokens.length) return;
    const next = raw[i + 1]?.[0] ?? t + 6;
    // shortcut: giả định hát đều theo độ dài chữ, tối đa ~0.42 giây mỗi chữ; lệch ở đoạn ngân dài. Cần dữ liệu giờ theo từng chữ để chính xác.
    const sing = Math.max(0.3, Math.min(next - t - 0.1, tokens.length * SECONDS_PER_WORD));
    const total = tokens.reduce((n, w) => n + w.length + 1, 0);
    let at = t + offset;
    const words = tokens.map((w) => {
      const start = at;
      at += (sing * (w.length + 1)) / total;
      return { text: w, start, end: at };
    });
    lines.push({ start: t + offset, end: next + offset, words });
  });
  return lines;
}

/** Dòng đang hát = dòng cuối cùng đã bắt đầu; -1 khi chưa tới dòng đầu. */
export function activeLine(lines: Line[], time: number): number {
  let lo = 0;
  let hi = lines.length - 1;
  let found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (lines[mid].start <= time) {
      found = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return found;
}

/** Tiến độ của một chữ: 0 = chưa hát, 1 = đã hát xong. */
export const wordProgress = (w: Word, time: number) => Math.min(1, Math.max(0, (time - w.start) / (w.end - w.start)));
