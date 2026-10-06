// Downloads the clips listed in data/media.json from Pexels, then trims and compresses each one
// into public/videos/<slug>.mp4 (silent, max 10 s, 720p) with a poster image <slug>.jpg.
// Runs on GitHub (.github/workflows/save-videos.yml). Needs ffmpeg.
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";

const media = JSON.parse(readFileSync(new URL("../data/media.json", import.meta.url), "utf8"));
const out = new URL("../public/videos/", import.meta.url);
mkdirSync(out, { recursive: true });
const UA = { "User-Agent": "Mozilla/5.0 (compatible; RootsAndMudsSite/1.0)" };

const SIZES = ["hd_1920_1080", "hd_1080_1920", "uhd_2560_1440", "uhd_1440_2560", "hd_1280_720", "hd_720_1280", "uhd_3840_2160", "uhd_2160_3840", "sd_960_540", "sd_540_960", "sd_640_360", "sd_360_640"];
const FPS = [25, 30, 24, 60, 50];

async function exists(url) {
  try {
    const r = await fetch(url, { method: "HEAD", headers: UA, redirect: "follow" });
    return r.ok && (r.headers.get("content-type") ?? "").includes("video") ? r.url : null;
  } catch {
    return null;
  }
}

async function findUrl(v) {
  if (v.url && (await exists(v.url))) return v.url;
  const dl = await exists(`https://www.pexels.com/download/video/${v.id}/`);
  if (dl) return dl;
  for (const s of SIZES) for (const f of FPS) {
    const u = await exists(`https://videos.pexels.com/video-files/${v.id}/${v.id}-${s}_${f}fps.mp4`);
    if (u) return u;
  }
  return null;
}

let ok = 0;
for (const v of media.videos) {
  const mp4 = new URL(`${v.slug}.mp4`, out);
  if (existsSync(mp4)) { ok++; continue; }
  const url = await findUrl(v);
  if (!url) { console.error(`✗ ${v.slug}: no downloadable file found`); continue; }
  const raw = new URL(`${v.slug}.raw.mp4`, out);
  const res = await fetch(url, { headers: UA });
  writeFileSync(raw, Buffer.from(await res.arrayBuffer()));
  const start = String(v.start ?? 0);
  // Silent, max 10 s, short side 720 px, web-friendly H.264
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", start, "-i", raw.pathname, "-t", "10", "-an",
    "-vf", "scale='if(gt(iw,ih),-2,720)':'if(gt(iw,ih),720,-2)',fps=25",
    "-c:v", "libx264", "-preset", "slow", "-crf", "28", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4.pathname]);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", "1", "-i", mp4.pathname, "-frames:v", "1", "-q:v", "4", new URL(`${v.slug}.jpg`, out).pathname]);
  unlinkSync(raw);
  console.log(`✓ ${v.slug} from ${url}`);
  ok++;
}
console.log(`${ok}/${media.videos.length} videos ready`);
