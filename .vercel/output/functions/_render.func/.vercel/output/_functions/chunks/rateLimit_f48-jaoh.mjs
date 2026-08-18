const hits = /* @__PURE__ */ new Map();
function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    hits.set(key, {
      count: 1,
      resetAt: now + windowMs
    });
    return {
      allowed: true,
      retryAfter: 0
    };
  }
  entry.count++;
  if (entry.count > limit) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1e3)
    };
  }
  return {
    allowed: true,
    retryAfter: 0
  };
}
function clientIp(request) {
  return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

export { clientIp as c, rateLimit as r };
