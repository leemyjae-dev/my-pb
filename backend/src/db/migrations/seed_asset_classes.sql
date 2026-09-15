-- 자산군(AssetClass) 최소 시드 데이터
-- 생성일: 2026-09-15
-- 근거: docs/1-domain-definition.md 2절("자산군: 주식/채권/펀드/현금성자산 등")
--
-- holding_items.asset_class_id가 asset_classes(id)를 참조하는 NOT NULL FK라
-- BE-6(잔고 업로드) 구현을 위해 최소 4종만 먼저 입력한다. 5단계 성향 등급별
-- 전체 "성향기준 비중표"(target_asset_allocations)는 여기서 다루지 않으며,
-- 도메인 정의서 8절 기준 별도 확정이 필요한 BE-8 직전 작업이다.
--
-- 여러 번 실행해도 중복 삽입되지 않도록 이름이 없을 때만 INSERT한다
-- (asset_classes.name에 UNIQUE 제약이 없어 idempotent하게 직접 처리).
INSERT INTO asset_classes (name)
SELECT v.name
FROM (VALUES ('주식'), ('채권'), ('펀드'), ('현금성자산')) AS v(name)
WHERE NOT EXISTS (
    SELECT 1 FROM asset_classes WHERE asset_classes.name = v.name
);
