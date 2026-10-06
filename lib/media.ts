import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";
import media from "@/data/media.json";
import type { Clip } from "@/components/videos";

type Video = Clip & { role?: string };

/** Clips from data/media.json whose files have been saved to public/videos. */
export function getClips(): { band: Video | undefined; reels: Video[] } {
  const ready = (media.videos as Video[]).filter((v) => existsSync(path.join(process.cwd(), "public", "videos", `${v.slug}.mp4`)));
  return { band: ready.find((v) => v.role === "band"), reels: ready.filter((v) => v.role !== "band") };
}
