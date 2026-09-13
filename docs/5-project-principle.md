# 프로젝트 구조 설계 원칙 — my-pb

## 버전 이력

| 버전 | 일자 | 변경 내용 |
|---|---|---|
| v1.0 | 2026-09-13 | docs 문서 기반 프로젝트 구조 설계 원칙 최초 작성 |
| v1.1 | 2026-09-13 | 프론트엔드 디렉토리 구조를 FSD(Feature-Sliced Design) 패턴으로 변경 |

작성일: 2026-09-13
근거 문서: `docs/1-domain-definition.md`(v1.2), `docs/2-PRD.md`(v1.1), `docs/3-user-scenario.md`(v1.0), `docs/4-wireframe.md`(v1.0)

> 본 문서는 실제 코드가 아니라 **2일·1인 개발 MVP** 규모에 맞는 프로젝트 구조/코딩 원칙을 정의한다. 엔터프라이즈급 마이크로서비스, DDD 풀 레이어드 아키텍처, 과도한 추상화는 채택하지 않는다.

---

## 1. 모든 스택에 공통인 최상위 원칙

- **단일 책임**: 파일/함수 하나는 하나의 역할만 한다. 라우트 핸들러는 요청·응답만 다루고, 채점·판정 같은 도메인 규칙은 별도 함수로 분리한다.
- **명시적 의존성**: 전역 변수·숨은 싱글턴에 암묵적으로 의존하지 않는다. DB 커넥션 풀, API 클라이언트 등은 명시적으로 import해서 사용한다.
- **도메인 용어 일관 사용**: 도메인 정의서 2절의 Ubiquitous Language를 코드 네이밍에 그대로 반영한다. 번역을 새로 만들지 않고 3절의 매핑표를 그대로 따른다. (예: "투자자성향 진단결과" → `KycProfileResult`/`kyc_profile_results`, 임의로 `SurveyResult`처럼 다른 이름을 짓지 않는다.)
- **매직 넘버 금지**: 채점 구간(0~19점 안정형 등), 반전 공식(`6 - 응답값`), 심리민감도 판정 기준 등 도메인 규칙에 등장하는 숫자는 상수로 이름을 붙여 한 곳에 모아 정의한다.
- **오버엔지니어링 금지**: 요청받지 않은 설정 가능성, 재사용을 가정한 추상화, 미래를 위한 확장 포인트를 만들지 않는다. FR-0~FR-4와 화면 목록에 없는 기능은 구현하지 않는다.

---

## 2. 의존성/레이어 원칙

### 백엔드 (route → service → db, 단방향)

- **route(핸들러)**: HTTP 요청 파싱, 응답 반환, 인증 미들웨어 적용까지만 담당한다. 도메인 로직을 직접 작성하지 않는다.
- **service**: 도메인 규칙(채점, 등급 산출, 정합/괴리 판정 등)과 DB 접근을 담당한다. 이 규모에서는 별도의 리포지토리 레이어를 두지 않고, service가 `pg` 쿼리를 직접 실행한다 (리포지토리 패턴·인터페이스 추상화는 생략).
- **의존 방향**: route → service → db(pool/query) 한 방향으로만 의존한다. service가 route를, db 계층이 service를 참조하지 않는다.
- **컨트롤러 레이어 생략**: route 핸들러가 컨트롤러 역할을 겸한다. 요청이 적은 MVP 규모에서 별도 controller 파일을 두는 것은 과도한 분리로 본다.

### 프론트엔드 (FSD: app → pages → widgets → features → entities → shared, 단방향)

- **레이어 구성**: Feature-Sliced Design(FSD)을 적용하되 2일·1인 MVP 규모에 맞춰 실제로 필요한 레이어만 채운다. `app`(초기화·라우팅·전역 프로바이더), `pages`(와이어프레임 화면 단위), `features`(사용자 행동 단위), `entities`(도메인 엔티티 단위), `shared`(api client·공통 UI·유틸)를 사용한다. `widgets`는 여러 feature/entity를 조합한 재사용 블록이 실제로 필요할 때만 두는 레이어인데, 이번 범위의 대시보드·진단 결과 화면은 각각 한 곳에서만 쓰이는 조합이라 별도 widgets 슬라이스 없이 `pages`가 `entities`/`features`를 직접 조합한다.
- **의존 방향**: 상위 레이어는 하위 레이어만 import할 수 있다 (`app → pages → features → entities → shared`). 역방향 import(예: `entities`가 `features`를 참조)나 같은 레이어의 다른 슬라이스 간 직접 참조(예: `entities/kyc-profile`이 `entities/holdings-snapshot`을 직접 import)는 하지 않는다. 여러 엔티티를 조합해야 하면 상위 레이어(`pages`, 필요 시 `widgets`)에서 조합한다.
- **세그먼트 역할 분리** (기존 "Zustand=클라이언트 로컬 상태, TanStack Query=서버 상태" 원칙을 FSD 세그먼트에 그대로 적용):
  - 슬라이스 내부는 `ui/`(컴포넌트), `model/`(상태·로직), `api/`(해당 슬라이스의 API 요청 함수)로 구성하고, 실제로 쓰이지 않는 빈 세그먼트는 만들지 않는다.
  - Zustand는 클라이언트 로컬 상태(로그인 여부, access_token 보유 상태 등)만 관리하며 `entities/user/model`에 둔다. 서버 데이터를 Zustand에 복제해서 넣지 않는다.
  - TanStack Query 훅은 서버 상태(설문 결과, 진단 결과 등 API로 가져오는 데이터)의 조회·동기화를 전담하며, 해당 `entities/*/model` 또는 `features/*/model`에 둔다.
  - `shared/api`의 http client(fetch/axios 래퍼, 인증 헤더 부착 등)는 최하위 계층이며, `entities`/`features`의 `api` 세그먼트를 통해서만 호출한다. `pages`나 UI 컴포넌트가 `shared/api`를 직접 호출하지 않는다.
- **컴포넌트 세분화 최소화**: 화면(와이어프레임) 하나당 `pages`의 페이지 컴포넌트 하나를 기본으로 하고, `features`/`entities`는 재사용되거나 도메인 경계가 뚜렷한 UI 조각(문항 목록, 상태 카드 등)만 분리한다. 아토믹 디자인 같은 다단계 컴포넌트 분류 체계는 도입하지 않는다.

---

## 3. 코드/네이밍 원칙

### 도메인 용어 ↔ 코드 네이밍 매핑 (도메인 정의서 3절 기준)

| 도메인 용어 | DB 테이블(snake_case) | 코드상 개념명(PascalCase) |
|---|---|---|
| 사용자 | `users` | `User` |
| 투자자성향 진단결과 | `kyc_profile_results` | `KycProfileResult` |
| IPIP 신경성 검사결과 | `neuroticism_test_results` | `NeuroticismTestResult` |
| 보유잔고 스냅샷 | `holdings_snapshots` | `HoldingsSnapshot` |
| 자산 항목 | `holding_items` | `HoldingItem` |
| 자산군 | `asset_classes` | `AssetClass` |
| 리스크 진단 결과 | `risk_diagnosis_results` | `RiskDiagnosisResult` |

이 매핑을 벗어나는 임의의 동의어(예: `SurveyResult`, `Portfolio` 등)를 코드에 새로 만들지 않는다.

### 네이밍 컨벤션

- **DB**: 테이블명은 스네이크케이스 복수형(`kyc_profile_results`), 컬럼명은 스네이크케이스(`total_score`, `risk_grade`, `created_at`). 외래키는 `{참조테이블 단수}_id` 형식(`user_id`, `holdings_snapshot_id`).
- **백엔드 JS**: 변수/함수는 camelCase, 파일명은 `{도메인}.routes.js` / `{도메인}.service.js` 패턴(예: `kyc.routes.js`, `kyc.service.js`). 도메인 이름은 위 매핑표의 개념명을 소문자로 사용한다(`kyc`, `neuroticism`, `holdings`, `diagnosis`, `auth`).
- **프론트엔드**: 컴포넌트 파일/함수는 PascalCase(`DashboardPage.tsx`), 훅은 `use{동사/명사}` camelCase(`useKycResult.ts`), 타입/인터페이스는 위 매핑표의 PascalCase 개념명을 그대로 사용(`KycProfileResult`).
- **API 엔드포인트**: 도메인 정의서/PRD의 FR 구분을 그대로 반영해 `/api/auth`, `/api/kyc`, `/api/neuroticism`, `/api/holdings`, `/api/diagnosis` 하위에 리소스를 둔다.

---

## 4. 테스트/품질 원칙

2일 MVP 규모이므로 테스트는 **도메인 규칙이 명확하고 틀리면 서비스 가치가 무너지는 부분**에만 집중한다.

### 권장 (반드시 단위 테스트 작성)

- KYC 채점 로직: 응답 합산 → 100점 환산 → 5단계 등급 산출 (도메인 정의서 6절 구간 경계값 포함)
- IPIP 신경성 채점 로직: 역채점 반전(`6 - 응답값`) → 총점 계산 → 심리민감도 등급 판정
- 정합성/괴리 판정 로직: 성향기준 비중과 실보유 비중 비교 판정

이 로직들은 route/service에서 분리한 순수 함수로 작성해 입출력만으로 테스트 가능하게 한다(예: `utils/scoring.js`).

### 하지 않아도 되는 것 (오버엔지니어링 금지)

- 전체 API에 대한 통합 테스트, E2E 테스트(Playwright/Cypress 등)
- 프론트엔드 컴포넌트 단위 테스트 전수 작성
- 커버리지 수치 목표(예: 80%) 설정 및 CI 게이트
- OCR/AI 비전 인식 결과에 대한 자동화 테스트 (정확도 검증은 수동 확인으로 충분)

테스트 러너는 별도 라이브러리 설치 부담을 줄이기 위해 Node.js 내장 `node:test` 모듈 사용을 우선 검토한다(확정 아님 — 6절 "확인이 필요한 사항" 참조).

---

## 5. 설정/보안/운영 원칙

- **환경변수**: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`, `CORS_ORIGIN`, `PORT` 등은 `.env`로 관리하고 코드에 하드코딩하지 않는다. `.env`는 git에 커밋하지 않고, 키 목록만 담은 `.env.example`을 커밋한다.
- **비밀번호**: PRD 5절에 따라 bcrypt로 해시하여 저장한다. 평문 저장/자체 해시 구현을 하지 않는다.
- **JWT**: access_token 검증 미들웨어를 두어 인증이 필요한 라우트(`/api/kyc`, `/api/neuroticism`, `/api/holdings`, `/api/diagnosis` 전체)에 공통 적용한다. access_token과 refresh_token의 시크릿은 분리해 관리할 수 있는 구조로 둔다. refresh_token의 구체적 저장 방식(httpOnly 쿠키 vs 클라이언트 저장소)은 PRD 9절 확인 필요 사항이므로 이 문서에서 확정하지 않고, `auth.service.js`에 토큰 발급/검증 로직을 캡슐화해 저장 방식이 정해지면 그 지점만 수정 가능하도록 한다.
- **CORS**: 프론트엔드 origin만 허용하는 화이트리스트 방식을 사용한다(`CORS_ORIGIN` 환경변수로 관리).
- **업로드 파일 제한**: 잔고 스크린샷 업로드는 파일 크기/형식 제한을 업로드 미들웨어 단에서 건다(구체적 제한값은 PRD 9절 확인 필요 사항). 원본 이미지 보관/파기 정책은 도메인 정의서 8절 확인 필요 사항으로 남아 있으므로 저장 위치(로컬 디스크 등)를 쉽게 바꿀 수 있도록 서비스 계층에서 캡슐화한다.
- **로깅**: 요청 로깅은 Express 표준 미들웨어(예: morgan) 수준으로 충분하며, 별도의 구조화 로깅 시스템(ELK 등)이나 APM 도입은 이번 범위에서 하지 않는다.
- **운영/배포**: 배포 환경은 PRD 9절 기준 미정이다. 구조적으로는 환경변수만 바꾸면 로컬/배포 환경 전환이 가능하도록 설정을 분리해두는 선에서 대응하고, 이 문서에서 특정 배포처(클라우드/온프레미스)를 확정하지 않는다.

---

## 6. 디렉토리 구조

### backend/

```
backend/
  src/
    routes/
      auth.routes.js
      kyc.routes.js
      neuroticism.routes.js
      holdings.routes.js
      diagnosis.routes.js
    services/
      auth.service.js
      kyc.service.js
      neuroticism.service.js
      holdings.service.js
      diagnosis.service.js
    middleware/
      auth.middleware.js      # JWT access_token 검증
      upload.middleware.js    # 잔고 스크린샷 업로드 처리
      error.middleware.js     # 공통 에러 응답 처리
    utils/
      scoring.js               # KYC/IPIP 채점, 정합·괴리 판정 순수 함수 (단위 테스트 대상)
    db/
      pool.js                  # pg Pool 생성
      migrations/              # 스키마 생성용 SQL 파일
    config/
      env.js                   # 환경변수 로드/검증
    app.js                      # Express 앱 설정 (미들웨어, 라우트 등록)
    server.js                   # 서버 기동 엔트리포인트
  tests/
    scoring.test.js
  .env.example
  package.json
```

### frontend/ (Feature-Sliced Design)

MVP 규모상 `widgets` 레이어는 생략한다(이유는 2절 참조). `app → pages → features → entities → shared` 5개 레이어만 사용하며, 각 슬라이스는 실제로 쓰이는 세그먼트(`ui`/`model`/`api`)만 둔다.

```
frontend/
  src/
    app/                              # 앱 초기화, 라우팅, 전역 프로바이더
      App.tsx
      routes.tsx                      # 화면 경로 ↔ pages 매핑
      providers/
        QueryClientProvider.tsx       # TanStack QueryClient 설정
      main.tsx

    pages/                            # 와이어프레임 화면 단위 (화면당 1개)
      signup/ui/SignupPage.tsx
      login/ui/LoginPage.tsx
      dashboard/ui/DashboardPage.tsx              # entities 상태 카드 3종 + 종합진단 버튼 조합
      kyc-survey/ui/KycSurveyPage.tsx
      neuroticism-test/ui/NeuroticismTestPage.tsx
      holdings-upload/ui/HoldingsUploadPage.tsx
      holdings-review/ui/HoldingsReviewPage.tsx   # 자산 항목 확인/보정
      diagnosis-result/ui/DiagnosisResultPage.tsx # 입력 누락/정합/괴리 상태 분기

    features/                         # 사용자 행동 단위 (PRD의 FR과 대응)
      signup/                         # FR-0.1
        ui/SignupForm.tsx
        api/signupApi.ts
        model/useSignup.ts            # TanStack Query mutation
      login/                          # FR-0.2, FR-0.4
        ui/LoginForm.tsx
        api/loginApi.ts
        model/useLogin.ts             # 로그인 성공 시 entities/user의 authStore 갱신
      submit-kyc-survey/              # FR-1
        ui/KycSurveyForm.tsx
        api/submitKycSurveyApi.ts
        model/useSubmitKycSurvey.ts
      submit-neuroticism-test/        # FR-2
        ui/NeuroticismTestForm.tsx
        api/submitNeuroticismTestApi.ts
        model/useSubmitNeuroticismTest.ts
      upload-holdings-screenshot/     # FR-3.1, FR-3.2
        ui/HoldingsUploadForm.tsx
        api/uploadHoldingsScreenshotApi.ts
        model/useUploadHoldingsScreenshot.ts
      review-holdings-items/          # FR-3.3~FR-3.5 (자산군 보정 + 확정)
        ui/HoldingItemEditableRow.tsx
        api/holdingsReviewApi.ts      # 자산군 수정, 확정 요청
        model/useReviewHoldingsItems.ts

    entities/                         # 도메인 엔티티 단위 (도메인 정의서 매핑 기준)
      user/
        model/
          authStore.ts                # Zustand: 로그인 여부, access_token 보유 상태, logout 액션
          types.ts                    # User
      kyc-profile/
        ui/KycStatusCard.tsx          # 대시보드용 KYC 상태 카드
        api/kycProfileApi.ts
        model/
          useKycProfileResult.ts      # TanStack Query 훅
          types.ts                    # KycProfileResult
      neuroticism-result/
        ui/NeuroticismStatusCard.tsx
        api/neuroticismResultApi.ts
        model/
          useNeuroticismResult.ts
          types.ts                    # NeuroticismTestResult
      holdings-snapshot/
        ui/HoldingsStatusCard.tsx
        api/holdingsSnapshotApi.ts
        model/
          useHoldingsSnapshot.ts
          types.ts                    # HoldingsSnapshot, HoldingItem, AssetClass
      diagnosis-result/
        ui/
          AssetClassComparisonTable.tsx  # 자산군별 비교 표/카드
          FeedbackMessage.tsx
        api/diagnosisResultApi.ts
        model/
          useDiagnosisResult.ts
          types.ts                    # RiskDiagnosisResult

    shared/                           # 공통 하위 계층 (다른 모든 레이어가 참조 가능)
      api/
        httpClient.ts                 # fetch/axios 래퍼, 인증 헤더 부착, 최하위 계층
      ui/
        Button.tsx                    # 여러 화면에서 재사용되는 공통 요소
        Input.tsx
      config/
        env.ts                        # API base URL 등 환경변수
  .env.example
  package.json
```

`entities`/`features`는 도메인 정의서의 엔티티/FR 단위(`kyc`, `neuroticism`, `holdings`, `diagnosis`, `auth`)를 슬라이스 이름의 기준으로 삼아, 어느 계층에서든 동일한 도메인 이름으로 관련 코드를 찾을 수 있게 한다. (참고: `logout`은 별도 feature 슬라이스로 분리하지 않고 상태만 초기화하는 단순 동작이므로 `entities/user/model/authStore.ts`의 액션으로 둔다 — 오버엔지니어링 방지.)

---

## 확인이 필요한 사항

이 문서를 작성하며 4개 입력 문서에 근거가 없어 구조적으로 임의 판단해야 했던 항목이다. 실제 구현 전 확인이 필요하다.

- **테스트 러너/프레임워크**: PRD 6절 기술 스택에 테스트 도구가 명시되어 있지 않다. 이 문서는 별도 설치 부담이 없는 `node:test` 사용을 임시로 제안했으나, Jest/Vitest 등 다른 선택지도 가능하며 확정된 바 없다.
- **프론트엔드 라우팅 라이브러리**: PRD 6절 기술 스택에 React Router 등 라우팅 라이브러리가 명시되어 있지 않다. `pages/` 디렉토리 구조는 라우팅 라이브러리 존재를 전제로 하므로, 실제 사용할 라이브러리(React Router 등) 확정이 필요하다.
- **파일 업로드 처리 방식**: 백엔드에서 잔고 스크린샷을 받는 구체적 미들웨어/라이브러리(예: multer)와 저장 위치(로컬 디스크/클라우드 스토리지/DB)가 미정이다. 도메인 정의서 8절의 "원본 이미지 보관/파기 정책 확인 필요"와 직접 연결된 사항이다.
- **DB 마이그레이션 관리 방식**: ORM은 사용하지 않기로 확정되어 있으나(PRD 6절), 스키마 변경을 SQL 파일을 순서대로 직접 실행하는 방식으로 할지, 경량 마이그레이션 도구(예: node-pg-migrate)를 도입할지는 문서에 근거가 없어 정하지 않았다.
