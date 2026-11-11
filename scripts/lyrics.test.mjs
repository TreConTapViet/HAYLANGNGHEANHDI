// Kiểm tra phần tính giờ lời bài hát: npm test
import assert from 'node:assert/strict';
import test from 'node:test';
import { activeLine, timeLines, wordProgress } from '../src/lrc.ts';

const raw = [
  [10, 'Người theo hương hoa mây mù giăng lối'],
  [14, ''], // nhạc dạo
  [20, 'Làn sương khói phôi phai đưa bước ai xa rồi'],
  [21.5, 'Nhanh'], // dòng sát dòng sau
];

test('chữ nối tiếp nhau, bắt đầu đúng giờ dòng, không lấn sang dòng sau', () => {
  const lines = timeLines(raw);
  assert.equal(lines.length, 3, 'dòng trống bị bỏ');
  for (const [i, line] of lines.entries()) {
    assert.equal(line.words[0].start, line.start);
    for (let k = 1; k < line.words.length; k++) assert.equal(line.words[k].start, line.words[k - 1].end);
    assert.ok(line.words.at(-1).end <= line.end + 1e-9, `dòng ${i} hát lấn sang dòng sau`);
  }
  assert.equal(lines[0].end, 14, 'dòng trước đoạn nhạc dạo kết thúc ở mốc nhạc dạo');
  assert.ok(lines[1].words.at(-1).end <= 21.5, 'dòng dài nhưng sát dòng sau thì hát nhanh lại');
});

test('độ lệch được cộng vào mọi mốc giờ', () => {
  const [a] = timeLines(raw, 2.5);
  assert.equal(a.start, 12.5);
  assert.equal(a.end, 16.5);
});

test('tìm dòng đang hát', () => {
  const lines = timeLines(raw);
  assert.equal(activeLine(lines, 5), -1);
  assert.equal(activeLine(lines, 10), 0);
  assert.equal(activeLine(lines, 16), 0, 'trong đoạn nhạc dạo vẫn giữ dòng vừa hát');
  assert.equal(activeLine(lines, 20.1), 1);
  assert.equal(activeLine(lines, 99), 2);
});

test('tiến độ chữ nằm trong 0..1', () => {
  const w = { text: 'x', start: 1, end: 2 };
  assert.equal(wordProgress(w, 0), 0);
  assert.equal(wordProgress(w, 1.5), 0.5);
  assert.equal(wordProgress(w, 3), 1);
});
