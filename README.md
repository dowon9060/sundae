# 순대차 (SUNDAECHA)

위치 기반 이동식 음식 판매점 탐색 MVP.

- 앱: Expo (React Native) — `app/`
- API: Cloudflare Workers + Hono + D1 — `backend-cf/`

## 로컬 실행

### 1. API

```bash
cd backend-cf
npm install
npm run db:migrate:local
npm run dev
```

기본 URL: `http://127.0.0.1:8787`

관리자 키(로컬): `backend-cf/.dev.vars`의 `ADMIN_KEY` (`X-Admin-Key` 헤더)  
예시 파일: `backend-cf/.dev.vars.example` → `.dev.vars`로 복사

```bash
cd backend-cf
cp .dev.vars.example .dev.vars
# ADMIN_KEY 값을 충분히 긴 임의 문자열로 수정
```

배포 시:

```bash
npx wrangler secret put ADMIN_KEY
# wrangler.toml 의 ENVIRONMENT 를 production 으로 설정
```

### 2. 앱

```bash
cd app
npm install
cp .env.example .env
npm start
```

실기기에서 API를 호출할 때는 `.env`의 `EXPO_PUBLIC_API_URL`을 개발 PC LAN IP로 바꿉니다.

예: `EXPO_PUBLIC_API_URL=http://192.168.0.10:8787`

## API 요약

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/stores/nearby?lat&lng&category&radius&day&client_id` | 주변 판매점 (거리순, 기본 5km, 요일·좋아요) |
| POST | `/api/stores/:id/likes` | 좋아요 토글 (`client_id`) |
| POST | `/api/stores/:id/verifications` | 현장 인증 (`client_id`, 기기당 1회) |
| GET | `/api/stores/:id` | 판매점 상세 |
| GET | `/api/stores/:id/menus` | 메뉴 |
| GET | `/api/stores/:id/hours` | 요일별 운영시간 |
| GET | `/api/locations/search?q` | 주소/역 검색 (MVP 정적 후보) |
| POST | `/api/stores/:id/reports` | 정보 제보 (사유 + 메모) |
| POST | `/api/stores/registration-requests` | 순대차 등록 요청 (이름·메뉴·오늘날·위치·사진) |
| POST | `/api/analytics/app-open` | 앱 활성 기록 (`client_id`, KST 일 1회 upsert) |
| GET | `/api/admin/analytics/overview?days` | DAU/MAU·일자별 시리즈 (`X-Admin-Key`) |
| PATCH | `/api/admin/stores/:id/location` | 위치 갱신 |
| PATCH | `/api/admin/stores/:id/hours` | 운영시간 갱신 |

등록·제보 알림은 각각 Slack Webhook이 있으면 보내고, 없으면 서버 로그로 남깁니다.
```bash
cd backend-cf
npx wrangler secret put SLACK_WEBHOOK_REGISTRATION_URL  # 순대차 등록
npx wrangler secret put SLACK_WEBHOOK_REPORT_URL         # 정보 제보(수정)
```

주변 검색은 D1에서 좌표를 읽고 서버에서 Haversine 직선거리로 정렬합니다.

## MVP 범위

포함: 주변 목록, 카테고리 필터, 위치 저장/검색/GPS, 상세(메뉴·운영시간), 인앱 네이버 지도(WebView JS API), 길찾기(네이버/카카오 Linking)

미포함: 네이버 지도 네이티브 SDK, 관리자 웹 UI, 일반 유저 인증, 푸시, 판매자 앱

인앱 지도는 `EXPO_PUBLIC_NCP_KEY_ID`(NCP Maps Client ID)가 필요합니다. Web 서비스 URL에 `http://localhost`를 등록하세요.

## 시드 데이터

- 서울·경기 이동식 + 전국 수집분 (마이그레이션 `0004`~`0009`)
- 출처 예: 네이버 블로그·카페, 인스타 언급, 티스토리, 전국 푸드트럭 허가구역 지도, 당근·오늘트럭 제보
- 좌표는 공개 주소·랜드마크 근사치이며, 이동식은 당일 SNS 확인이 필요합니다.
