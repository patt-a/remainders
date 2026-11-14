/**
 * Memento Mori statue background
 *
 * The statue is embedded as a base64 JPEG data URL (see lib/statue-image-data.ts)
 * instead of being loaded from a URL, because:
 *  - @vercel/og (Satori) cannot decode WebP: a .webp <img> is skipped silently;
 *  - a data URL needs no network request, so it works on every deployment
 *    (production, preview, local) and in both the Edge and Node.js runtimes.
 */

import {
  STATUE_IMAGE_DATA_URL,
  STATUE_IMAGE_HEIGHT,
  STATUE_IMAGE_WIDTH,
} from './statue-image-data';

/**
 * Default statue opacity (0 = invisible, 1 = fully opaque).
 * Change this value to adjust the statue on every wallpaper that does not
 * pass `statueOpacity` in its URL — your iPhone URL stays the same.
 */
export const STATUE_DEFAULT_OPACITY = 0.7;

export const STATUE_IMAGE_URL = STATUE_IMAGE_DATA_URL;

/**
 * Reads the optional `statueOpacity` (0–1) and `statue` (on/off) query params.
 * Both are optional: without them the statue is shown at STATUE_DEFAULT_OPACITY.
 * Returns 0 when the statue is disabled.
 */
export function getStatueOpacityFromParams(searchParams: URLSearchParams): number {
  const toggle = searchParams.get('statue');
  if (toggle !== null && ['0', 'false', 'off', 'no'].includes(toggle.toLowerCase())) {
    return 0;
  }

  const raw = searchParams.get('statueOpacity');
  if (raw === null || raw.trim() === '') return STATUE_DEFAULT_OPACITY;

  const value = Number(raw);
  if (!Number.isFinite(value)) return STATUE_DEFAULT_OPACITY;
  return Math.min(1, Math.max(0, value));
}

interface StatueBackgroundProps {
  width: number;
  height: number;
  opacity?: number;
}

/**
 * Full-bleed statue layer, anchored to the bottom of the wallpaper.
 * Scales like `object-fit: cover`, but the position is computed explicitly so
 * the statue always sits in the lower part of the screen whatever the device
 * ratio. Render it as the FIRST child of the wallpaper root so every dot and
 * text drawn after it stays in the foreground.
 */
export function StatueBackground({ width, height, opacity = STATUE_DEFAULT_OPACITY }: StatueBackgroundProps) {
  if (!(opacity > 0)) return null;

  const scale = Math.max(width / STATUE_IMAGE_WIDTH, height / STATUE_IMAGE_HEIGHT);
  const imgWidth = Math.ceil(STATUE_IMAGE_WIDTH * scale);
  const imgHeight = Math.ceil(STATUE_IMAGE_HEIGHT * scale);
  const left = Math.round((width - imgWidth) / 2); // centred horizontally
  const top = height - imgHeight; // anchored to the bottom

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={STATUE_IMAGE_URL}
      alt=""
      width={imgWidth}
      height={imgHeight}
      style={{
        position: 'absolute',
        left,
        top,
        width: imgWidth,
        height: imgHeight,
        opacity: Math.min(1, opacity),
      }}
    />
  );
}
