"use client";

import { useEffect, useRef, useState } from "react";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

// Trimming, audio-stripping and re-encoding all happen in the delivery URL —
// the source in Cloudinary stays untouched. Shift so_/eo_ to pick a different
// 12s window without re-uploading. (so_0,eo_32 is the whole video.)
const VIDEO_SRC = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/so_0,eo_12,q_auto:eco,vc_auto,ac_none,w_640/victor-store/hero/hero-loop.mp4`;

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // CSS can hide a video but it cannot pause one, so opt out before loading.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // `muted` has to be set as a property: the SSR attribute alone is not
    // enough for iOS Safari and Chrome to permit autoplay.
    video.muted = true;
    // src is assigned here rather than in markup so the video never competes
    // with the priority hero image for initial bandwidth.
    video.src = VIDEO_SRC;
    video.load();
    // Resolving the play() promise is the reliable signal that playback began;
    // the "playing" event can fire while listeners are detached on remount.
    // A rejection means autoplay was blocked — leave the hero image showing.
    video.play().then(
      () => setPlaying(true),
      () => {},
    );
  }, []);

  return (
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      tabIndex={-1}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
        playing ? "opacity-90" : "opacity-0"
      }`}
    />
  );
}
