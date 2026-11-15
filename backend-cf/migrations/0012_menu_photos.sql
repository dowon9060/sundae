-- 메뉴 사진 샘플 (상세 갤러리·리스트 썸네일용)
UPDATE menus
SET photo_url = CASE (id % 3)
  WHEN 0 THEN 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=600'
  WHEN 1 THEN 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=600'
  ELSE 'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=600'
END
WHERE photo_url IS NULL;
