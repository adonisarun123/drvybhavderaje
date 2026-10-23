"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { track } from "@/lib/analytics";

/** Click-to-load YouTube embeds: a static thumbnail until the viewer presses play, so no third-party scripts load on page view. */
export function VideoGallery({ ids, title = "Video gallery" }: { ids: string[]; title?: string }) {
  return (
    <div className="video-grid" role="list" aria-label={title}>
      {ids.map((id, i) => (
        <Video key={id} id={id} index={i + 1} />
      ))}
    </div>
  );
}

function Video({ id, index }: { id: string; index: number }) {
  const [playing, setPlaying] = useState(false);
  const label = `Video ${index}`;
  if (playing) {
    return (
      <div className="video" role="listitem">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={`${label} — Dr Vybhav Deraje`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }
  return (
    <div className="video" role="listitem">
      <button type="button" className="video-poster" onClick={() => {
          track("video_play", { video_id: id, video_index: index, video_provider: "youtube" });
          setPlaying(true);
        }} aria-label={`Play ${label.toLowerCase()}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- YouTube thumbnail; sizes are fixed by YouTube */}
        <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" width={480} height={360} loading="lazy" decoding="async" />
        <span className="video-play" aria-hidden="true">
          <Play size={26} fill="currentColor" />
        </span>
      </button>
    </div>
  );
}
