const store = new Map<string, number[]>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = store.get(key) || [];
  const recent = timestamps.filter(t => now - t < windowMs);
  if (recent.length >= limit) return false;
  recent.push(now);
  store.set(key, recent);
  return true;
}

export function clearExpired(windowMs: number): void {
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