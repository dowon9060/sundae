-- 가상(스톡) 사진 제거 — 실제 사진만 남기고 없으면 앱 대체 이미지 사용
UPDATE stores
SET photo_url = NULL
WHERE photo_url IS NOT NULL
  AND (
    photo_url LIKE '%pexels.com%'
    OR photo_url LIKE '%unsplash.com%'
    OR photo_url LIKE '%picsum.photos%'
    OR photo_url LIKE '%placeholder%'
  );

UPDATE menus
SET photo_url = NULL
WHERE photo_url IS NOT NULL
  AND (
    photo_url LIKE '%pexels.com%'
    OR photo_url LIKE '%unsplash.com%'
    OR photo_url LIKE '%picsum.photos%'
    OR photo_url LIKE '%placeholder%'
  );
