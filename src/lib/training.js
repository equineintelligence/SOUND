import { BookOpen, PlayCircle, Dumbbell } from 'lucide-react';

export const TRAINING_KINDS = [
  { key: 'article', label: 'Article' },
  { key: 'video', label: 'Video tip' },
  { key: 'exercise', label: 'Exercise' },
];

export const TRAINING_FILTERS = [{ key: 'all', label: 'All' }, ...TRAINING_KINDS];

export const KIND_LABELS = TRAINING_KINDS.reduce((acc, item) => {
  acc[item.key] = item.label;
  return acc;
}, {});

export const KIND_ICONS = {
  article: BookOpen,
  video: PlayCircle,
  exercise: Dumbbell,
};

const YOUTUBE_PATTERN =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i;

/** The video's id, watch link and poster image, or null when the link is not YouTube. */
export function youtubeInfo(url) {
  const match = (url || '').match(YOUTUBE_PATTERN);
  if (!match) return null;
  const id = match[1];
  return {
    id,
    watch: `https://www.youtube.com/watch?v=${id}`,
    thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  };
}

/** Turns a Vimeo link into an embeddable player url. */
export function videoEmbedUrl(url) {
  const vimeo = (url || '').match(/vimeo\.com\/(\d+)/i);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

export function isVideoFile(url) {
  return /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i.test(url || '');
}