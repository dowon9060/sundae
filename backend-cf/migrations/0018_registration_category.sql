-- 앱 등록 요청에 카테고리 구분 저장
ALTER TABLE store_registration_requests
  ADD COLUMN category TEXT NOT NULL DEFAULT 'sundae'
  CHECK (category IN (
    'sundae',
    'bungeoppang',
    'dakkochi',
    'mandu',
    'takoyaki',
    'chicken',
    'other'
  ));

CREATE INDEX IF NOT EXISTS idx_store_reg_category
  ON store_registration_requests(category);
