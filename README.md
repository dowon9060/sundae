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

관리자 키(로컬): `dev-admin-key` (`X-Admin-Key` 헤더)

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
| GET | `/api/stores/nearby?lat&lng&category&radius` | 주변 판매점 (거리순) |
| GET | `/api/stores/:id` | 판매점 상세 |
| GET | `/api/stores/:id/menus` | 메뉴 |
| GET | `/api/stores/:id/hours` | 요일별 운영시간 |
| GET | `/api/locations/search?q` | 주소/역 검색 (MVP 정적 후보) |
| POST | `/api/stores/:id/reports` | 정보 제보 (사유 + 메모) |
| PATCH | `/api/admin/stores/:id/location` | 위치 갱신 |
| PATCH | `/api/admin/stores/:id/hours` | 운영시간 갱신 |

제보 알림은 `SLACK_WEBHOOK_URL`이 있으면 Slack으로 보내고, 없으면 서버 로그로 남깁니다.
```bash
cd backend-cf && npx wrangler secret put SLACK_WEBHOOK_URL
```

주변 검색은 D1에서 좌표를 읽고 서버에서 Haversine 직선거리로 정렬합니다.

## MVP 범위

포함: 주변 목록, 카테고리 필터, 위치 저장/검색/GPS, 상세(메뉴·운영시간), 지도 플레이스홀더, 길찾기(네이버/카카오 Linking)

미포함: 네이버 지도 SDK, 관리자 웹 UI, 일반 유저 인증, 푸시, 판매자 앱

## 시드 데이터

- 역삼 순대차 (`store-yeoksam-sundae`)
- 참숯 통닭차 (`store-gangnam-chicken`)
