import React from "react";

interface VideoEmbedProps {
  url: string;
}

export const VideoEmbed: React.FC<VideoEmbedProps> = ({ url }) => {
  // YouTube Regex for various URL formats
  const ytMatch = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );

  // Vimeo Regex
  const vimeoMatch = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/
  );

  if (ytMatch) {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black mt-4">
        <iframe
          src={`https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`}
          className="absolute top-0 left-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube Video Player"
        />
      </div>
    );
  }

  if (vimeoMatch) {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black mt-4">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoMatch[1]}?badge=0&autopause=0&player_id=0&app_id=58479`}
          className="absolute top-0 left-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Vimeo Video Player"
        />
      </div>
    );
  }

  // Fallback to text link if not a platform we recognize
  return (
    <div className="mt-4">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-cyan-300 hover:text-cyan-200 hover:bg-white/10 transition-all underline break-all font-medium text-sm"
      >
        View Resource External Link: {url}
      </a>
    </div>
  );
};
