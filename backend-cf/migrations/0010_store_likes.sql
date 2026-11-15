-- 판매점 좋아요 수 + 기기(client)별 좋아요 기록
ALTER TABLE stores ADD COLUMN like_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE store_likes (
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (store_id, client_id)
);

CREATE INDEX idx_store_likes_client ON store_likes(client_id);

-- 데모용 초기 좋아요 수 (운영 전 초기화 가능)
UPDATE stores SET like_count = 12 WHERE id = 'store-gamasot-bongeunsa';
UPDATE stores SET like_count = 8 WHERE id = 'store-kingdakko';
UPDATE stores SET like_count = 5 WHERE id = 'store-jootak-chicken';
UPDATE stores SET like_count = 3 WHERE id = 'store-wirye-sundae';
