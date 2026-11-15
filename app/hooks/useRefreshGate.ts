import { useCallback, useRef, useState } from 'react';

const DEFAULT_COOLDOWN_MS = 10_000;

/** 당겨서 새로고침·GPS 재요청 쿨다운 */
export function useRefreshGate(cooldownMs = DEFAULT_COOLDOWN_MS) {
  const lastAtRef = useRef(0);
  const [hint, setHint] = useState<string | null>(null);

  const tryRefresh = useCallback(
    async (action: () => Promise<void>) => {
      const now = Date.now();
      const elapsed = now - lastAtRef.current;
      if (lastAtRef.current > 0 && elapsed < cooldownMs) {
        const waitSec = Math.ceil((cooldownMs - elapsed) / 1000);
        setHint(`잠시 후 다시 새로고침할 수 있어요. (${waitSec}초)`);
        return false;
      }

      lastAtRef.current = now;
      setHint(null);
      await action();
      return true;
    },
    [cooldownMs]
  );

  const clearHint = useCallback(() => setHint(null), []);

  return { tryRefresh, hint, clearHint };
}
