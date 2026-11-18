-- nearby 요일·좌표 조회용 보조 인덱스
CREATE INDEX IF NOT EXISTS idx_hours_day_open
  ON business_hours(day_of_week, is_closed, store_id);
