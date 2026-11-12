# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, login-free web app for listening to Vietnamese artists ("Nhạc Việt · chạm là quay"). Vite + React 19 + TypeScript, Zustand for state, `motion` for gestures/animation. No backend, no database. Everything user-facing (UI strings, code comments, docs, commit messages) is in Vietnamese, so keep new strings and comments in Vietnamese to match.

## Commands

```bash
npm install
npm run dev       # Vite dev server, localhost:5173
npm run build     # tsc --noEmit && vite build → dist/ (this is also the only type check)
npm run preview   # serve dist/
npm test          # node --test scripts/lyrics.test.mjs
npm run data      # regenerate public/data/ from content/artists/*.md (hits the network, slow)
```

- Run a single test: `node --test --test-name-pattern="tìm dòng đang hát" scripts/lyrics.test.mjs`
- The test file imports `src/lrc.ts` directly, so it relies on Node's built-in TypeScript type stripping (works on the installed Node 26). `src/lrc.ts` must stay erasable-only TS: no enums, no namespaces, no parameter properties.
- There is no linter, and no `npm run check`, even though `docs/07-operations.md` mentions one.

## Architecture

### Two stages: prepare data offline, then serve static files

1. **Data build (`scripts/build-data.mjs`, run by hand):** reads each `content/artists/*.md` (YAML frontmatter via gray-matter) and calls:
   - iTunes Search (country `vn`) for album, 100×100 cover URL, 30s preview URL. It is rate-limited, so the script sleeps and retries on purpose.
   - YouTube oEmbed to check each video still exists and allows embedding, and that its title contains the track title.
   - LRCLIB for line-synced lyrics. It picks the version whose duration is closest to the track's `seconds`.
   - Spotify for the artist portrait, only if `SPOTIFY_CLIENT_ID`/`SPOTIFY_CLIENT_SECRET` are set in `.env`.

   It writes `public/data/songs.json` and `public/data/lyrics/<youtubeId>.json`. It deletes and rewrites the lyrics directory on every run. Both outputs are committed. Bad input (missing fields, a YouTube ID that isn't 11 chars, a duplicate artist id or video id) throws and stops the run. Problems that don't stop the run are printed at the end under "Cần xem lại" (needs review). Images are never downloaded: only the original URLs are stored.
2. **Runtime:** the browser fetches `/data/songs.json` once (in `src/App.tsx`) and fetches a track's lyrics file only when that track plays.

**A track's `id` is its YouTube video ID.** That ID is the lyrics filename, the uniqueness key in the data build, and the `?track=` deep-link parameter (`?artist=<artist id>&track=<video id>`).

The real `songs.json` shape is the `Artist`/`Track` types in `src/player.ts`. The richer schema in `docs/03-data-pipeline.md` is outdated.

### Runtime modules (`src/`)

- **`player.ts`** is both the Zustand store (`useStore`) and the playback controller. Components call its exported functions (`play`, `toggle`, `step`, `seek`, `stop`, `setVolume`, …) and never touch the players directly. It holds module-level singletons:
  - one `YT.Player`, created lazily on the first user-initiated `play()` (browsers block autoplay without a gesture) and mounted into the `<div id="yt">` rendered by `Overlays.tsx`, then reused for every track;
  - one `Audio` element for the iTunes 30s preview, which is the fallback when YouTube reports an error (100/101/150).

  `preview: true` in the store means audio is coming from the fallback. The store also handles Media Session (lock screen/headset controls), URL sync, repeat/shuffle (shuffle draws from all artists), and toasts.
- **`App.tsx`:** landing page (hero, artist flow/roll, genre filter, search). It resolves deep links after `songs.json` loads and lazy-loads `Overlays`.
- **`Overlays.tsx`** (a separate lazy chunk): `Sheet` (an artist's track list), `Player` (full and mini player, queue drawer, global keyboard shortcuts), and `Toast`.
- **`Lyrics.tsx` + `lrc.ts`:** LRCLIB only gives a start time per line. `timeLines()` estimates per-word timing (about 0.42 s per word, capped by the next line's start), and `lyricsOffset` shifts every timestamp. During playback a `requestAnimationFrame` loop writes progress straight into CSS variables (`--p` per word, `--d` per line) instead of updating React state every frame. Keep that pattern, and animate only `transform`/`opacity` (`docs/05-performance.md`).
- **`Icons.tsx`:** Lucide SVGs copied in by hand (ADR-009). Don't add an icon library.

### Adding or changing music

Edit the artist's `.md` file (field reference: `content/artists/README.md`), run `npm run data`, read the review report, and commit the changes under `public/data/`. To fix lyrics timing for a track, set `lyricsOffset` (seconds) in the `.md` file rather than editing `songs.json` by hand, because `npm run data` overwrites `songs.json`. An `image:` field in the `.md` file overrides the Spotify or YouTube portrait.

## Constraints that aren't obvious from the code

- **YouTube frame (ADR-007):** the YouTube player must always stay visible, at least 200×200 px, with nothing overlaid on any part of it, including in the mini player. This is a YouTube terms requirement, so don't hide the video or draw over it.
- **Video sources (ADR-010):** only use videos from the artist's official channel (`youtubeChannel`) or the auto-generated "<artist> - Topic" channel. Never use re-uploaded lyric videos: they are often pitch- or speed-shifted, which desyncs the lyrics. Prefer a video whose length matches the lyrics version (±3 s).
- **`scripts/update-to-lyrics.mjs`** is a one-off migration script and is not wired into npm scripts. It scrapes YouTube search through `curl.exe`, and its fallback accepts videos from any channel. That breaks ADR-010 (`docs/README.md` records that a past switch to lyric videos left 70/103 tracks on re-uploads). Don't run it as-is.
- **No user data persistence (ADR-005):** no cookies, no stored playback history, and no accounts.
- **Secrets:** the Spotify keys live only in `.env` and are used only by the data script. Never give them a `VITE_` prefix, because Vite would bundle them into client code.
- **`index.html` is coupled to the code:**
  - `<meta name="referrer" content="strict-origin-when-cross-origin">` must stay, or YouTube refuses playback (error 153).
  - The hero image `<link rel="preload" imagesrcset=…>` must match the `srcset` in `App.tsx`.
- **Lyrics licensing (ADR-008):** lyrics come from LRCLIB, which is unlicensed and community-sourced. Treat this as an open issue before any public launch.

## Docs

`docs/` (in Vietnamese) holds requirements, architecture, playback logic, design system, and ADRs (`08-decisions.md`). Files 02–06 describe the original design. The code is simpler: it has no GSAP/Lenis, no image processing, and a flat `src/` instead of the `store/`, `player/` and `components/` folders the docs show. `docs/README.md` has a "code khác tài liệu ở đâu" (where the code differs from the docs) table and a dated log of each build. When the docs and the code disagree, trust the code. The project records notable changes in that log and in the ADRs.
