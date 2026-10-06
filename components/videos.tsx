"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export interface Clip {
  slug: string;
  title: string;
  caption?: string;
  href?: string;
  linkLabel?: string;
}

const reduced = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Plays while at least half visible, pauses otherwise. Silent, looping, with a visible pause control. */
function useInViewPlayback(ref: React.RefObject<HTMLVideoElement | null>) {
  const [playing, setPlaying] = useState(false);
  const userPaused = useRef(false);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (reduced()) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !userPaused.current) {
          if (v.preload === "none") v.preload = "auto";
          v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
        } else {
          v.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.5 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [ref]);
  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      v.play().then(() => setPlaying(true)).catch(() => undefined);
    } else {
      userPaused.current = true;
      v.pause();
      setPlaying(false);
    }
  };
  return { playing, toggle };
}

function PlayPause({ playing, onClick, label }: { playing: boolean; onClick: () => void; label: string }) {
  return (
    <button className="vid-btn" onClick={onClick} aria-label={`${playing ? "Pause" : "Play"} video: ${label}`}>
      {playing ? (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
          <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
        </svg>
      )}
    </button>
  );
}

/** Full-width looping video behind a short message. */
export function VideoBand({ clip, children }: { clip: Clip; children: React.ReactNode }) {
  const ref = useRef<HTMLVideoElement>(null);
  const { playing, toggle } = useInViewPlayback(ref);
  return (
    <section className="video-band">
      <video ref={ref} className="bg" muted loop playsInline preload="none" poster={`/videos/${clip.slug}.jpg`} aria-hidden="true">
        <source src={`/videos/${clip.slug}.mp4`} type="video/mp4" />
      </video>
      <div className="wrap video-band-inner">{children}</div>
      <PlayPause playing={playing} onClick={toggle} label={clip.title} />
    </section>
  );
}

function Reel({ clip }: { clip: Clip }) {
  const ref = useRef<HTMLVideoElement>(null);
  const { playing, toggle } = useInViewPlayback(ref);
  return (
    <figure className="reel">
      <video ref={ref} muted loop playsInline preload="none" poster={`/videos/${clip.slug}.jpg`} onClick={toggle} aria-label={clip.title}>
        <source src={`/videos/${clip.slug}.mp4`} type="video/mp4" />
      </video>
      <PlayPause playing={playing} onClick={toggle} label={clip.title} />
      <figcaption>
        <strong>{clip.caption ?? clip.title}</strong>
        {clip.href && (
          <Link href={clip.href} className="reel-link">
            {clip.linkLabel ?? "Shop it"}
          </Link>
        )}
      </figcaption>
    </figure>
  );
}

/** A swipeable row of vertical clips. */
export function Reels({ clips }: { clips: Clip[] }) {
  return (
    <div className="reels" role="list">
      {clips.map((c) => (
        <div role="listitem" key={c.slug}>
          <Reel clip={c} />
        </div>
      ))}
    </div>
  );
}
