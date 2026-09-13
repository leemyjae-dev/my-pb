-- ==========================================================================
-- my-pb — PostgreSQL 17 DDL
-- 생성일: 2026-09-13
-- 근거 문서: docs/7-erd.md (v1.0)
--
-- 2일·1인 개발 MVP 규모에 맞춘 최소한의 스키마다.
-- 파티셔닝, 트리거, 복합/부분 인덱스 등은 사용하지 않는다.
-- 테이블/컬럼은 docs/7-erd.md의 ERD를 그대로 옮긴 것이며, ERD에 없는
-- 테이블/컬럼을 새로 추가하지 않았다.
-- ==========================================================================

-- 사용자(User)
CREATE TABLE users (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email         VARCHAR NOT NULL UNIQUE,
    password_hash VARCHAR NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 자산군(AssetClass)
CREATE TABLE asset_classes (
    id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR NOT NULL
);

-- 투자자성향 진단결과(KycProfileResult)
CREATE TABLE kyc_profile_results (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id),
    answers     JSONB NOT NULL,
    total_score INTEGER NOT NULL,
    risk_grade  VARCHAR NOT NULL,
    taken_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kyc_profile_results_user_id ON kyc_profile_results(user_id);

-- IPIP 신경성 검사결과(NeuroticismTestResult)
CREATE TABLE neuroticism_test_results (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id           BIGINT NOT NULL REFERENCES users(id),
    answers           JSONB NOT NULL,
    total_score       INTEGER NOT NULL,
    sensitivity_grade VARCHAR NOT NULL,
    taken_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_neuroticism_test_results_user_id ON neuroticism_test_results(user_id);

-- 보유잔고 스냅샷(HoldingsSnapshot)
CREATE TABLE holdings_snapshots (
    id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id            BIGINT NOT NULL REFERENCES users(id),
    image_url          VARCHAR NOT NULL,
    asset_class_weights JSONB,
    confirmed_at       TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_holdings_snapshots_user_id ON holdings_snapshots(user_id);

-- 자산 항목(HoldingItem)
CREATE TABLE holding_items (
    id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    holdings_snapshot_id  BIGINT NOT NULL REFERENCES holdings_snapshots(id),
    asset_class_id        BIGINT NOT NULL REFERENCES asset_classes(id),
    raw_name              VARCHAR NOT NULL,
    quantity              NUMERIC(18, 4),
    amount                NUMERIC(18, 2) NOT NULL,
    classification_status VARCHAR NOT NULL
);

CREATE INDEX idx_holding_items_holdings_snapshot_id ON holding_items(holdings_snapshot_id);
CREATE INDEX idx_holding_items_asset_class_id ON holding_items(asset_class_id);

-- 성향기준 비중 (AssetClass ↔ 성향등급 매핑)
CREATE TABLE target_asset_allocations (
    id                   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    risk_grade           VARCHAR NOT NULL,
    asset_class_id       BIGINT NOT NULL REFERENCES asset_classes(id),
    target_weight_percent NUMERIC(5, 2) NOT NULL
);

CREATE INDEX idx_target_asset_allocations_asset_class_id ON target_asset_allocations(asset_class_id);

-- 리스크 진단 결과(RiskDiagnosisResult)
CREATE TABLE risk_diagnosis_results (
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id                     BIGINT NOT NULL REFERENCES users(id),
    kyc_profile_result_id       BIGINT NOT NULL REFERENCES kyc_profile_results(id),
    neuroticism_test_result_id  BIGINT NOT NULL REFERENCES neuroticism_test_results(id),
    holdings_snapshot_id        BIGINT NOT NULL REFERENCES holdings_snapshots(id),
    comparison_result           JSONB NOT NULL,
    psychological_burden_flag   BOOLEAN NOT NULL DEFAULT false,
    feedback_message            TEXT NOT NULL,
    diagnosed_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_risk_diagnosis_results_user_id ON risk_diagnosis_results(user_id);
CREATE INDEX idx_risk_diagnosis_results_kyc_profile_result_id ON risk_diagnosis_results(kyc_profile_result_id);
CREATE INDEX idx_risk_diagnosis_results_neuroticism_test_result_id ON risk_diagnosis_results(neuroticism_test_result_id);
CREATE INDEX idx_risk_diagnosis_results_holdings_snapshot_id ON risk_diagnosis_results(holdings_snapshot_id);

-- ==========================================================================
-- 확인이 필요한 사항 (이번 DDL 작성 과정에서 새로 발생한 판단만 기록.
-- docs/7-erd.md 3절에 이미 정리된 사항은 반복하지 않는다.)
--
-- - holdings_snapshots.asset_class_weights / confirmed_at: 업로드 직후
--   보정 전에는 값이 없을 수 있다고 보아 NULL 허용으로 두었다. 반대로
--   "보정 완료된 스냅샷만 저장한다"는 정책이라면 NOT NULL이 맞을 수 있다.
-- - holding_items.asset_class_id를 NOT NULL로 두었다 — 자동 분류가 항상
--   1차 분류값을 부여하고(애매한 경우도 임시값 + "보정 필요" 상태로 표시),
--   완전히 분류 실패한 항목은 없다고 가정했다. 인식 자체가 실패해 자산군을
--   전혀 매길 수 없는 경우가 있다면 NULL 허용으로 바꿔야 한다.
-- - holding_items.quantity를 NULL 허용으로 두었다 — 와이어프레임(4-wireframe.md
--   2.7절)에 펀드처럼 수량이 "-"로 표시되는 예시가 있어, 수량이 없는 자산
--   항목(예: 일부 펀드)이 있을 수 있다고 보았다. amount(평가금액)는 항상
--   존재한다고 보아 NOT NULL로 두었다.
-- - taken_at / confirmed_at / diagnosed_at처럼 "완료 시각" 성격의 컬럼도
--   실질적으로 행 생성 시점과 같다고 보아 DEFAULT now()를 적용했다.
--   애플리케이션이 별도 시각을 명시적으로 지정해야 한다면 이 기본값은
--   제거해야 한다.
-- - 등급/상태 컬럼(risk_grade, sensitivity_grade, classification_status)은
--   지시대로 CHECK 제약 없이 단순 VARCHAR로 두었다 — 한글 값을 그대로
--   저장할지 영문 코드로 변환해 저장할지는 코드 레벨에서 결정할 문제로
--   남긴다.
-- - TIMESTAMPTZ 채택: 문서에 시간대 요구사항이 명시되어 있지 않으나,
--   PostgreSQL 모범 사례에 따라 시간대 포함 타입을 기본으로 채택했다.
-- ==========================================================================
