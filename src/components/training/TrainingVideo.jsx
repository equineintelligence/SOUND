import { PlayCircle, ExternalLink } from 'lucide-react';
import { youtubeInfo, videoEmbedUrl, isVideoFile } from '@/lib/training';

/**
 * Plays whatever video a resource points at. YouTube opens on YouTube rather than in an
 * embedded player, because the embed refuses to load inside a framed page.
 */
export default function TrainingVideo({ resource }) {
  const youtube = youtubeInfo(resource.video_url);

  if (youtube) {
    return (
      <a
        href={youtube.watch}
        target="_blank"
        rel="noreferrer"
        className="group relative block aspect-video w-full overflow-hidden rounded-2xl border border-hairline bg-black"
      >
        <img
          src={youtube.thumb}
          alt=""
          className="h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-80"
        />
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <PlayCircle className="h-14 w-14 text-white drop-shadow" strokeWidth={1.5} />
          <span className="rounded-full bg-black/60 px-3 py-1 text-[12.5px] font-semibold text-white">
            Watch on YouTube
          </span>
        </span>
      </a>
    );
  }

  const embed = videoEmbedUrl(resource.video_url);
  if (embed) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl border border-hairline bg-black">
        <iframe
          src={embed}
          title={resource.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  if (isVideoFile(resource.video_url)) {
    return (
      <video
        src={resource.video_url}
        controls
        className="w-full rounded-2xl border border-hairline bg-black"
      />
    );
  }

  if (resource.video_url) {
    return (
      <a
        href={resource.video_url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-brand px-5 text-[14px] font-semibold text-white transition-opacity duration-200 hover:opacity-90"
      >
        Watch the video
        <ExternalLink className="h-4 w-4" strokeWidth={2} />
      </a>
    );
  }

  return null;
}