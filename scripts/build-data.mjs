// Đọc content/artists/*.md → hỏi iTunes (album, bìa, bản nghe thử) + Spotify (ảnh chân dung, tùy chọn)
// → ghi public/data/songs.json. Chỉ lưu đường link ảnh gốc, không tải ảnh về.
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import matter from 'gray-matter';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIR = path.join(ROOT, 'content', 'artists');
if (existsSync(path.join(ROOT, '.env'))) process.loadEnvFile(path.join(ROOT, '.env'));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const VARIANT = /remix|live|karaoke|instrumental|beat|sped|slowed|acoustic/;

async function getJson(url, init) {
  for (let i = 0; ; i++) {
    const res = await fetch(url, init);
    if (res.ok) return res.json();
    if (i === 3 || ![403, 429, 500, 502, 503].includes(res.status)) throw new Error(`HTTP ${res.status} ${url}`);
    await sleep(5000 * (i + 1)); // iTunes giới hạn khoảng 20 lượt/phút
  }
}

const itunes = async (term) =>
  (await getJson(`https://itunes.apple.com/search?entity=song&limit=200&country=vn&term=${encodeURIComponent(term)}`)).results ?? [];

function pickSong(hits, artist, title) {
  const a = new RegExp(`(^| )${norm(artist)}( |$)`);
  const t = norm(title.replace(/\(.*?\)/g, '')); // "EmmE (Em, Tôi)" trên iTunes chỉ là "EmmE"
  return hits
    .filter((h) => a.test(norm(h.artistName)) && norm(h.trackName).startsWith(t))
    .filter((h) => VARIANT.test(t) || !VARIANT.test(norm(h.trackName)))
    .sort((x, y) => x.trackName.length - y.trackName.length)[0];
}

let token;
async function spotifyPortrait(name) {
  const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret } = process.env;
  if (!id || !secret) return null;
  token ??= (
    await getJson('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })
  ).access_token;
  const { artists } = await getJson(`https://api.spotify.com/v1/search?type=artist&limit=10&q=${encodeURIComponent(name)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  // Chỉ nhận tên khớp chính xác, không đoán.
  const hit = artists.items
    .filter((x) => norm(x.name) === norm(name) && x.images.length)
    .sort((x, y) => y.popularity - x.popularity)[0];
  return hit && { image: hit.images[0].url, link: hit.external_urls.spotify };
}

// Ảnh nét nhất có sẵn trong các video của nghệ sĩ; mqdefault là cỡ nhỏ nhưng không có viền đen như hqdefault
async function ytThumb(ids) {
  for (const id of ids) {
    // bản webp nhẹ hơn jpg khoảng 35–55%
    for (const max of [`https://i.ytimg.com/vi_webp/${id}/maxresdefault.webp`, `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`])
      if ((await fetch(max, { method: 'HEAD' })).ok) return max;
  }
  return `https://i.ytimg.com/vi/${ids[0]}/mqdefault.jpg`;
}

// ---- đọc + kiểm tra dữ liệu: sai là dừng, không lặng lẽ bỏ qua ----
const configs = [];
const seen = new Set();
for (const f of (await fs.readdir(DIR)).filter((f) => f.endsWith('.md') && f !== 'README.md')) {
  const a = matter(await fs.readFile(path.join(DIR, f), 'utf8')).data;
  for (const k of ['id', 'name', 'genre', 'youtubeChannel']) assert(a[k], `${f}: thiếu "${k}"`);
  assert(a.tracks?.length, `${f}: chưa có bài nào`);
  for (const t of a.tracks) {
    assert(t.title, `${f}: có bài thiếu title`);
    assert.match(String(t.youtube), /^[\w-]{11}$/, `${f}: ID YouTube sai ở "${t.title}"`);
  }
  for (const key of [a.id, ...a.tracks.map((t) => t.youtube)]) {
    assert(!seen.has(key), `${f}: trùng "${key}"`);
    seen.add(key);
  }
  configs.push(a);
}
configs.sort((x, y) => x.order - y.order);

const report = [];
const artists = [];
for (const a of configs) {
  const query = a.spotifyQuery ?? a.name; // tên trên iTunes/Spotify, ví dụ "Đen" thay cho "Đen Vâu"
  console.log(`▶ ${a.name}`);
  const pool = await itunes(query);
  const portrait = await spotifyPortrait(query).catch((e) => (report.push(`[${a.name}] Spotify lỗi: ${e.message}`), null));
  if (process.env.SPOTIFY_CLIENT_ID && !portrait) report.push(`[${a.name}] Spotify không có tên khớp "${query}", dùng ảnh video`);

  // oEmbed: 404 = video đã mất, 401 = không cho nhúng. Không cần khóa.
  await Promise.all(
    a.tracks.map(async (t) => {
      const { status } = await fetch(`https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=${t.youtube}`);
      if (status !== 200) report.push(`[${a.name}] "${t.title}": YouTube trả ${status}, video có thể đã mất hoặc cấm nhúng`);
    }),
  );

  const tracks = [];
  for (const t of a.tracks) {
    let hit = pickSong(pool, query, t.title);
    if (!hit) {
      await sleep(3200);
      hit = pickSong(await itunes(`${query} ${t.title}`), query, t.title);
    }
    if (!hit) report.push(`[${a.name}] "${t.title}": iTunes không khớp → không có bản nghe thử, bìa lấy từ video`);
    console.log(`  ${hit ? '✓' : '·'} ${t.title}`);
    tracks.push({
      id: t.youtube,
      title: t.title,
      feat: t.feat ?? null,
      kind: t.kind ?? 'mv',
      album: hit?.collectionName ?? null,
      art: hit?.artworkUrl100 ?? null,
      preview: hit?.previewUrl ?? null,
    });
  }
  artists.push({
    id: a.id,
    name: a.name,
    genre: a.genre,
    image: portrait?.image ?? (await ytThumb(a.tracks.map((t) => t.youtube))),
    tracks,
  });
  await sleep(3200);
}

await fs.mkdir(path.join(ROOT, 'public', 'data'), { recursive: true });
await fs.writeFile(path.join(ROOT, 'public', 'data', 'songs.json'), JSON.stringify(artists));
const all = artists.flatMap((a) => a.tracks);
console.log(`\nXong: ${artists.length} nghệ sĩ, ${all.length} bài, ${all.filter((t) => t.preview).length} bài có bản nghe thử.`);
if (report.length) console.log('Cần xem lại:\n - ' + report.join('\n - '));
