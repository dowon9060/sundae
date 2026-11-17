import type { Env } from '../types';

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const PHOTO_PATH_PREFIX = '/photos/';

const KEY_RE = /^stores\/[0-9a-f-]{36}\.(jpg|png|webp)$/;

type PhotoType = { ext: 'jpg' | 'png' | 'webp'; mime: string };

/** Content-Type 헤더가 아닌 실제 파일 시그니처로 판별 */
function detectPhotoType(bytes: Uint8Array): PhotoType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ext: 'jpg', mime: 'image/jpeg' };
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { ext: 'png', mime: 'image/png' };
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  ) {
    return { ext: 'webp', mime: 'image/webp' };
  }
  return null;
}

export function isValidPhotoKey(key: string): boolean {
  return KEY_RE.test(key);
}

export async function savePhoto(
  env: Env,
  body: ArrayBuffer,
  origin: string,
  uploadedBy: string
): Promise<{ key: string; url: string }> {
  if (body.byteLength === 0) throw new Error('EMPTY_PHOTO');
  if (body.byteLength > MAX_PHOTO_BYTES) throw new Error('PHOTO_TOO_LARGE');

  const type = detectPhotoType(new Uint8Array(body, 0, Math.min(body.byteLength, 16)));
  if (!type) throw new Error('INVALID_PHOTO_TYPE');

  const key = `stores/${crypto.randomUUID()}.${type.ext}`;
  await env.PHOTOS.put(key, body, {
    httpMetadata: {
      contentType: type.mime,
      cacheControl: 'public, max-age=31536000, immutable',
    },
    customMetadata: { uploadedBy },
  });

  return { key, url: `${origin}${PHOTO_PATH_PREFIX}${key}` };
}
