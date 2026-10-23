import { ArrowUpRight } from "lucide-react";
import { VideoGallery } from "@/components/site/video-gallery";
import { CHANNELS, videosFor, type VideoPage } from "@/lib/videos";

/** "Watch" block for a page: the videos tagged for it in lib/videos.ts, or nothing when there are none. */
export function VideoSection({ page, heading = "Watch Dr Vybhav Explain", limit = 6 }: { page: VideoPage; heading?: string; limit?: number }) {
  const videos = videosFor(page, limit);
  if (!videos.length) return null;
  const channels = [...new Set(videos.map((v) => v.channel))];
  return (
    <section className="video-section" aria-labelledby={`videos-${page.replace(/[^a-z0-9]/gi, "-")}`}>
      <h2 id={`videos-${page.replace(/[^a-z0-9]/gi, "-")}`}>{heading}</h2>
      <VideoGallery videos={videos} title={heading} />
      <p className="channel-note">
        More on YouTube:{" "}
        {channels.map((c, i) => (
          <span key={c}>
            {i > 0 && " · "}
            <a href={CHANNELS[c].url} target="_blank" rel="noopener noreferrer">
              {CHANNELS[c].name} <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          </span>
        ))}
      </p>
    </section>
  );
}
