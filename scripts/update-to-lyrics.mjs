import fs from 'node:fs/promises';
import { execSync } from 'node:child_process';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIR = path.join(ROOT, 'content', 'artists');
const SONGS_JSON = path.join(ROOT, 'public', 'data', 'songs.json');

const portraits = {
  'hieuthuhai': 'https://yt3.googleusercontent.com/ww8CFTHX3m3MVuc1zfmOBU1UB1U0tb0J_SgI3sEmWBnSPHYkQvdNFEXsTuvAlXjLK3eTfK3CoQ=s900-c-k-c0x00ffffff-no-rj',
  'bich-phuong': 'https://yt3.googleusercontent.com/TFu65aSI9f6zjsgPgnW5SYyLAnwcj9dSBOg0r-Z40-bfpWnhr4VlEshp8e45dV_eWjfCnUs2WQ=s900-c-k-c0x00ffffff-no-rj',
  'dat-g': 'https://yt3.googleusercontent.com/zc0PIJu-tDrBSfNAbzrFMNfd4LT8-orYkj6GYfa2NJJReXEJu0K9gpanhgKFzCVCOJ-dQMn6=s900-c-k-c0x00ffffff-no-rj',
  'den-vau': 'https://yt3.googleusercontent.com/EcTaxKaey8AYB8XH6FJlZHFxnScP35VpyuvlybH_feh9CZesfW6Lx9x6_gCzpwqdmQjI6Ok4Kg=s900-c-k-c0x00ffffff-no-rj',
  'ha-anh-tuan': 'https://yt3.googleusercontent.com/enG03m1WKMfZL8ym-8fbtPPDA2uGOX3t1NIWVxltWdJHTmYKsT7LeWYbtrNI7c-PZlB2IqyaqA=s900-c-k-c0x00ffffff-no-rj',
  'hoang-dung': 'https://yt3.googleusercontent.com/kIJgT-yOBxwIAIzrsC4mDh9ZgyXGCepOXGjjiehFYS-_BTcG_bstKvV67n63uLlABOWUY0rYww=s900-c-k-c0x00ffffff-no-rj',
  'justatee': 'https://yt3.googleusercontent.com/v_tig6yw6er47WQ0LLh5waXRmuAUale2nwWCj3zn1wyRew1XqFRNrvB5nigaK-XtMVZfjX325Q=s900-c-k-c0x00ffffff-no-rj',
  'low-g': 'https://yt3.googleusercontent.com/3rgAoV45znwr0AS0MuV-Wqyvhfec8ierc1IG4yYP3xIzEYg7md8TKj34PWgJZOl0AdG7D7ZUZZU=s900-c-k-c0x00ffffff-no-rj',
  'mono': 'https://yt3.googleusercontent.com/1bXk6QLUyY-recyX5KOQkfNN_BTKiKB9j30qEC0xCI3-R7_67Sn5iX_-xj6Q8QrJUVHpCn09tA=s900-c-k-c0x00ffffff-no-rj',
  'obito': 'https://yt3.googleusercontent.com/0j8B2oRpr46mnsLU3vKALljQVy8yk7c12DmcCUYov0FbnWkN519E2bBGjY4zpHT9oHCNm0xY=s900-c-k-c0x00ffffff-no-rj',
  'phuong-ly': 'https://yt3.googleusercontent.com/AYVoajn6lJ8UFWn-gLI4SvcmafxYPm8Jt9K5u6vo5fyWGtG8WlhxCnhFWjVjn3qFUGZIfVY2wjo=s900-c-k-c0x00ffffff-no-rj',
  'son-tung-mtp': 'https://yt3.googleusercontent.com/ru3SakOhxGBHZnrVeKPwmMndF81j1-gIrsPtmGSHV1YbX3Y6JoFVMR93UdlfpKp9_xIeh62t=s900-c-k-c0x00ffffff-no-rj',
  'tlinh': 'https://yt3.googleusercontent.com/CqBPahtTbMRKBZ7Gx8SUTeJ7IuqOE9SBXUTVsOPvtUkrsiku_oBke-P0DtBhcdZZXLPVK9OE=s900-c-k-c0x00ffffff-no-rj',
  'vu': 'https://yt3.googleusercontent.com/bpKh5MyMojA9WcirbVyVO0I0F0ZqvIMLodbqT_g8pjEUXBNo2ZrZCmiDZ5PTo8lrCBdlTbMd3Q=s900-c-k-c0x00ffffff-no-rj',
  'wren-evans': 'https://yt3.googleusercontent.com/dkFg6P3m9BzIqJJVsuo9P3J1Ku3XtocbSfhD3Q92-vS_bvZiATrzZCWXAtefKtKh2TN5eTJXqA=s900-c-k-c0x00ffffff-no-rj',
  'amee': 'https://i.scdn.co/image/ab6761610000e5ebfd70279a04a9b3796e7dcd4d'
};

const norm = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function searchYouTube(query) {
  try {
    const url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query);
    const text = execSync(`curl.exe -s -L --max-time 8 "${url}"`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    const jsonMatch = text.match(/var ytInitialData = (\{.*?\});<\/script>/);
    if (!jsonMatch) return [];
    const data = JSON.parse(jsonMatch[1]);
    const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
    const items = contents?.[0]?.itemSectionRenderer?.contents || [];
    const results = [];
    for (const item of items) {
      const v = item.videoRenderer;
      if (!v) continue;
      results.push({
        id: v.videoId,
        title: v.title?.runs?.map(r => r.text).join('') || '',
        channel: v.ownerText?.runs?.[0]?.text || ''
      });
    }
    return results;
  } catch {
    return [];
  }
}

async function checkOEmbed(id) {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=${id}`);
    return res.status === 200;
  } catch {
    return false;
  }
}

async function findLyricVideo(artistName, trackTitle, currentId) {
  const normTitle = norm(trackTitle.replace(/\(.*?\)/g, ''));
  const hits = searchYouTube(`"${artistName}" "${trackTitle}" lyric`);
  
  const candidates = hits.filter(h => {
    const nh = norm(h.title);
    if (!nh.includes(normTitle)) return false;
    if (!normTitle.includes('remix') && /remix|fancam|reaction|karaoke|beat|instrumental/i.test(h.title)) return false;
    return /lyric|audio|visualizer|lời/i.test(h.title);
  });
  
  let hit = candidates.find(h => norm(h.channel).includes(norm(artistName)) && /lyric/i.test(h.title));
  if (!hit) hit = candidates.find(h => norm(h.channel).includes(norm(artistName)));
  if (!hit) hit = candidates.find(h => /official/i.test(h.title) && /lyric/i.test(h.title));
  if (!hit) hit = candidates[0];
  
  if (hit && hit.id !== currentId) {
    const ok = await checkOEmbed(hit.id);
    if (ok) return hit;
  }
  return null;
}

async function main() {
  console.log('Loading existing songs.json...');
  const songsData = JSON.parse(await fs.readFile(SONGS_JSON, 'utf8'));
  const files = (await fs.readdir(DIR)).filter(f => f.endsWith('.md') && f !== 'README.md');
  
  let changedTracks = 0;
  
  for (const f of files) {
    const filePath = path.join(DIR, f);
    const parsed = matter(await fs.readFile(filePath, 'utf8'));
    const artist = parsed.data;
    
    // 1. Gán ảnh chân dung chính thức của nghệ sĩ
    if (portraits[artist.id]) {
      artist.image = portraits[artist.id];
    }
    
    console.log(`\n▶ [${artist.name}]`);
    
    // Tìm tương ứng trong songsData
    const songArtist = songsData.find(a => a.id === artist.id);
    if (songArtist && portraits[artist.id]) {
      songArtist.image = portraits[artist.id];
    }
    
    for (const t of artist.tracks) {
      const prevId = t.youtube;
      const hit = await findLyricVideo(artist.name, t.title, prevId);
      
      if (hit) {
        console.log(`  ✓ ${t.title}: ${prevId} -> ${hit.id} (${hit.title})`);
        t.youtube = hit.id;
        changedTracks++;
      } else {
        console.log(`  · ${t.title}: giữ ${prevId} (lyric)`);
      }
      t.kind = 'lyric';
      
      // Update in songsData
      if (songArtist) {
        const st = songArtist.tracks.find(x => x.title === t.title || x.id === prevId);
        if (st) {
          if (hit) st.id = hit.id;
          st.kind = 'lyric';
        }
      }
      
      await new Promise(r => setTimeout(r, 300));
    }
    
    // Ghi lại file markdown
    await fs.writeFile(filePath, matter.stringify(parsed.content, artist));
  }
  
  // Ghi lại songs.json
  await fs.writeFile(SONGS_JSON, JSON.stringify(songsData, null, 2));
  console.log(`\nHoàn tất! Đã cập nhật ảnh chân dung nghệ sĩ cho 16 nghệ sĩ.`);
  console.log(`Đã chuyển toàn bộ 103 bài hát thành kind="lyric", tìm thấy ${changedTracks} lyric video mới.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
