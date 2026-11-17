-- 판매점 사진 최대 5장 (JSON 배열, 순서 유지). photo_url은 첫 번째 사진(썸네일)과 동기화한다.
ALTER TABLE stores ADD COLUMN photo_urls TEXT;

UPDATE stores
SET photo_urls = json_array(photo_url)
WHERE photo_url IS NOT NULL AND trim(photo_url) != '';
