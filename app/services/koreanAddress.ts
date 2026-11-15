/** Expo reverseGeocode가 영어로 올 때 한글 행정구역으로 변환 */

const REGION_MAP: Record<string, string> = {
  Seoul: '서울특별시',
  Busan: '부산광역시',
  Daegu: '대구광역시',
  Incheon: '인천광역시',
  Gwangju: '광주광역시',
  Daejeon: '대전광역시',
  Ulsan: '울산광역시',
  Sejong: '세종특별자치시',
  Gyeonggi: '경기도',
  'Gyeonggi-do': '경기도',
  Gangwon: '강원특별자치도',
  'Gangwon-do': '강원특별자치도',
  Chungbuk: '충청북도',
  'Chungcheongbuk-do': '충청북도',
  Chungnam: '충청남도',
  'Chungcheongnam-do': '충청남도',
  Jeonbuk: '전북특별자치도',
  'Jeollabuk-do': '전북특별자치도',
  Jeonnam: '전라남도',
  'Jeollanam-do': '전라남도',
  Gyeongbuk: '경상북도',
  'Gyeongsangbuk-do': '경상북도',
  Gyeongnam: '경상남도',
  'Gyeongsangnam-do': '경상남도',
  Jeju: '제주특별자치도',
  'Jeju-do': '제주특별자치도',
};

const DISTRICT_MAP: Record<string, string> = {
  // 서울
  'Gangnam-gu': '강남구',
  Gangnam: '강남구',
  'Gangdong-gu': '강동구',
  Gangdong: '강동구',
  'Gangbuk-gu': '강북구',
  Gangbuk: '강북구',
  'Gangseo-gu': '강서구',
  Gangseo: '강서구',
  'Gwanak-gu': '관악구',
  Gwanak: '관악구',
  'Gwangjin-gu': '광진구',
  Gwangjin: '광진구',
  'Guro-gu': '구로구',
  Guro: '구로구',
  'Geumcheon-gu': '금천구',
  Geumcheon: '금천구',
  'Nowon-gu': '노원구',
  Nowon: '노원구',
  'Dobong-gu': '도봉구',
  Dobong: '도봉구',
  'Dongdaemun-gu': '동대문구',
  Dongdaemun: '동대문구',
  'Dongjak-gu': '동작구',
  Dongjak: '동작구',
  'Mapo-gu': '마포구',
  Mapo: '마포구',
  'Seodaemun-gu': '서대문구',
  Seodaemun: '서대문구',
  'Seocho-gu': '서초구',
  Seocho: '서초구',
  'Seongdong-gu': '성동구',
  Seongdong: '성동구',
  'Seongbuk-gu': '성북구',
  Seongbuk: '성북구',
  'Songpa-gu': '송파구',
  Songpa: '송파구',
  'Songpa District': '송파구',
  'Yangcheon-gu': '양천구',
  Yangcheon: '양천구',
  'Yeongdeungpo-gu': '영등포구',
  Yeongdeungpo: '영등포구',
  'Yongsan-gu': '용산구',
  Yongsan: '용산구',
  'Eunpyeong-gu': '은평구',
  Eunpyeong: '은평구',
  'Jongno-gu': '종로구',
  Jongno: '종로구',
  'Jung-gu': '중구',
  Jung: '중구',
  'Jungnang-gu': '중랑구',
  Jungnang: '중랑구',
};

function translatePart(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // 이미 한글이면 그대로
  if (/[가-힣]/.test(trimmed)) return trimmed;

  if (REGION_MAP[trimmed]) return REGION_MAP[trimmed];
  if (DISTRICT_MAP[trimmed]) return DISTRICT_MAP[trimmed];

  // "Songpa District" / "Songpa-gu"
  const noDistrict = trimmed.replace(/\s+District$/i, '').replace(/-gu$/i, '');
  if (DISTRICT_MAP[noDistrict]) return DISTRICT_MAP[noDistrict];
  if (DISTRICT_MAP[`${noDistrict}-gu`]) return DISTRICT_MAP[`${noDistrict}-gu`];
  if (DISTRICT_MAP[`${noDistrict} District`]) {
    return DISTRICT_MAP[`${noDistrict} District`];
  }

  return trimmed;
}

export function formatKoreanAddress(parts: {
  region?: string | null;
  city?: string | null;
  district?: string | null;
  street?: string | null;
  streetNumber?: string | null;
  name?: string | null;
  subregion?: string | null;
}): string | null {
  const region = translatePart(parts.region) || translatePart(parts.city);
  const district =
    translatePart(parts.district) ||
    translatePart(parts.subregion) ||
    translatePart(parts.city !== parts.region ? parts.city : null);

  const street = translatePart(parts.street);
  const detail =
    translatePart(parts.streetNumber) ||
    (parts.name && !/^[A-Za-z]/.test(parts.name) ? parts.name : null) ||
    translatePart(parts.name);

  const chunks = [region, district, street, detail].filter(
    (v, i, arr): v is string => Boolean(v) && arr.indexOf(v) === i
  );

  if (chunks.length === 0) return null;
  return chunks.join(' ');
}

/** 영문 주소 문자열을 가능한 범위에서 한글로 치환 */
export function localizeAddressText(address: string): string {
  if (!address.trim()) return address;
  if (/[가-힣]/.test(address) && !/[A-Za-z]{3,}/.test(address)) {
    return address;
  }

  let next = address;
  const pairs = [
    ...Object.entries(REGION_MAP),
    ...Object.entries(DISTRICT_MAP),
  ].sort((a, b) => b[0].length - a[0].length);

  for (const [en, ko] of pairs) {
    next = next.replace(new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), ko);
  }
  next = next.replace(/\bDistrict\b/gi, '').replace(/\s{2,}/g, ' ').trim();
  return next;
}
