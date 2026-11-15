-- isolate 간에도 동작하는 쓰기 API용 durable rate limit
CREATE TABLE IF NOT EXISTS rate_limit_hits (
  bucket_key TEXT NOT NULL,
  hit_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_hits_key_time
  ON rate_limit_hits(bucket_key, hit_at);
