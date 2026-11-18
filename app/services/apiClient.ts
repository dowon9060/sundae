/** 앱 전역 API 호출 제한·중복 GET 합치기·타임아웃 */

/** 연속 요청 최소 간격 — 체감 지연을 줄이기 위해 짧게 유지 */
const MIN_GAP_MS = 50;
const MAX_PER_WINDOW = 40;
const WINDOW_MS = 60_000;
const FETCH_TIMEOUT_MS = 12_000;
const MAX_QUEUE_WAIT_MS = 8_000;

let lastStartAt = 0;
let chain: Promise<void> = Promise.resolve();
const windowStarts: number[] = [];
const inflightGet = new Map<string, Promise<Response>>();

export class ApiRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiRateLimitError';
  }
}

function pruneWindow(now: number) {
  while (windowStarts.length > 0 && windowStarts[0]! <= now - WINDOW_MS) {
    windowStarts.shift();
  }
}

async function acquireSlot(): Promise<void> {
  const queuedAt = Date.now();

  const run = async () => {
    if (Date.now() - queuedAt > MAX_QUEUE_WAIT_MS) {
      throw new ApiRateLimitError(
        '요청이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.'
      );
    }

    const now = Date.now();
    pruneWindow(now);

    if (windowStarts.length >= MAX_PER_WINDOW) {
      throw new ApiRateLimitError(
        '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.'
      );
    }

    const wait = Math.max(0, lastStartAt + MIN_GAP_MS - now);
    if (wait > 0) {
      await new Promise((r) => setTimeout(r, wait));
    }

    lastStartAt = Date.now();
    windowStarts.push(lastStartAt);
  };

  const next = chain.then(run, run);
  chain = next.catch(() => undefined);
  await next;
}

export async function apiFetch(
  url: string,
  init?: RequestInit
): Promise<Response> {
  const method = (init?.method || 'GET').toUpperCase();
  const key = `${method}:${url}`;

  if (method === 'GET') {
    const existing = inflightGet.get(key);
    if (existing) return existing;
  }

  const exec = (async () => {
    await acquireSlot();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        ...init,
        signal: controller.signal,
      });
      return res;
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        throw new Error(
          '서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.'
        );
      }
      throw new Error(
        '판매 정보를 불러오지 못했습니다. 아래로 당겨 다시 시도해 주세요.'
      );
    } finally {
      clearTimeout(timer);
      if (method === 'GET') {
        inflightGet.delete(key);
      }
    }
  })();

  if (method === 'GET') {
    inflightGet.set(key, exec);
  }

  return exec;
}
