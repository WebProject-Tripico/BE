# Tripico Express

경상북도 지역의 관광지를 대상으로, 사용자가 설정한 이동 가능 시간 내에 여행할 수 있는 최적의 관광 코스를 추천해주는 앱 기반 서비스의 백엔드 시스템입니다.

## 주요 기능

- 빅데이터 활용한 기간별, 목적별(휴식, 체험 등), 인원별 코스 추천
- 카카오 길찾기 API를 활용한 실시간 관광 경로 안내
- 사용자 맞춤형 관광 코스 추천

## 기술 스택

- Node.js
- Express.js
- MySQL
- Kakao API

## 설치 및 실행

1. 저장소 클론
```bash
git clone [repository-url]
cd tripico_express
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
- `.env` 파일을 생성하고 필요한 환경 변수 설정

4. 데이터베이스 설정
- MySQL 데이터베이스 생성
- `database/trip_db.sql` 실행

5. 서버 실행
```bash
npm start
```

## API 문서

### 사용자 API
- POST /api/users/register - 사용자 회원가입
- POST /api/users/login - 사용자 로그인

### 관광지 API
- GET /api/tourist-spots - 관광지 목록 조회
- GET /api/tourist-spots/:id - 관광지 상세 정보 조회

### 코스 API
- POST /api/courses - 여행 코스 생성
- GET /api/courses - 사용자의 여행 코스 목록 조회
- GET /api/courses/:id - 여행 코스 상세 정보 조회

## 라이선스

MIT 