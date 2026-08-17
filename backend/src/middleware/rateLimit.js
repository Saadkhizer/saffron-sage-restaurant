// Minimal in-memory rate limiter — no extra dependency needed.
// Good enough for a single-instance Render deployment. Resets on restart,
// which is fine for its purpose here (slowing down brute force / spam bursts).
const buckets = new Map();

export function rateLimit({ windowMs, max, message }) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();
    const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }
    bucket.count += 1;
    buckets.set(key, bucket);

    if (bucket.count > max) {
      res.set('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
      return res.status(429).json({ error: message || 'Too many requests. Please try again shortly.' });
    }
    next();
  };
}

// Periodic sweep so the map doesn't grow unbounded over a long-running process.
const sweep = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}, 10 * 60 * 1000);
sweep.unref?.();
