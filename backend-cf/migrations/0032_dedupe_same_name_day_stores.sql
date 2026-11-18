-- 같은 이름·같은 운영요일로 중복된 시드 판매점 정리 (이름당 1개만 유지)
UPDATE stores
SET status = 'inactive'
WHERE id IN (
  'store-tt-stall-gangseo-bungeo-kkachisan-pizza',
  'store-tt-stall-namyangju-bungeo-hwado-changhyeon',
  'store-tt-stall-namyangju-bungeo-hwado-chasan',
  'store-tt-stall-namyangju-bungeo-onam-eoram',
  'store-tt-stall-namyangju-ingeo-byeollae-chowon',
  'store-tt-stall-namyangju-ingeo-deokso-center',
  'store-tt-hwaseong-byeongjeom-gopchang'
);
