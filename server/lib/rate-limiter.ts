const store = new Map<string, number[]>();
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function startCleanup(windowMs: number): void {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    clearExpired(windowMs);
  }, Math.max(60000, windowMs));
}

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  startCleanup(windowMs);
  const now = Date.now();
  const timestamps = store.get(key) || [];
  const recent = timestamps.filter(t => now - t < windowMs);
  if (recent.length >= limit) return false;
  recent.push(now);
  store.set(key, recent);
  return true;
}

export function clearExpired(windowMs: number): void {
  if (store.size === 0) return;
  const now = Date.now();
  for (const [key, timestamps] of store) {
    const recent = timestamps.filter(t => now - t < windowMs);
    if (recent.length === 0) {
      store.delete(key);
    } else {
      store.set(key, recent);
    }
  }
}
