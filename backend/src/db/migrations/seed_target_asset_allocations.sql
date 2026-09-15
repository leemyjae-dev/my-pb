-- 성향기준 비중표(target_asset_allocations) 임시 시드 데이터
-- 생성일: 2026-09-15
--
-- 도메인 정의서 8절: "5단계 성향 등급별 전체 자산군 기준 비중표"는 기획서에
-- 미정이며(안정추구형 주식 30% 예시 1건만 제시), 실제 확정이 필요한
-- 사항이다. 2일 MVP 진행을 위해 일반적인 로보어드바이저 자산배분 관행을
-- 참고해 코디네이터가 정한 "임시 확정값"을 사용한다. 각 행(성향 등급)의
-- 비중 합계는 100%이며, "안정추구형 주식 30%"는 도메인 정의서 2절 예시와
-- 정확히 일치시켰다. 실제 서비스화 시 반드시 재검토가 필요하다.
--
-- (risk_grade, asset_class_name, weight) 조합을 asset_classes.name으로
-- 조인해 실제 id를 찾는다 — asset_classes의 id 값이 바뀌어도 안전하게
-- 동작한다. 이미 입력된 (risk_grade, asset_class_id) 조합은 다시 넣지
-- 않도록 idempotent하게 처리한다.
INSERT INTO target_asset_allocations (risk_grade, asset_class_id, target_weight_percent)
SELECT v.risk_grade, ac.id, v.weight
FROM (
    VALUES
        ('안정형',     '주식',       10),
        ('안정형',     '채권',       50),
        ('안정형',     '펀드',       20),
        ('안정형',     '현금성자산', 20),

        ('안정추구형', '주식',       30),
        ('안정추구형', '채권',       40),
        ('안정추구형', '펀드',       20),
        ('안정추구형', '현금성자산', 10),

        ('위험중립형', '주식',       50),
        ('위험중립형', '채권',       25),
        ('위험중립형', '펀드',       15),
        ('위험중립형', '현금성자산', 10),

        ('적극투자형', '주식',       70),
        ('적극투자형', '채권',       15),
        ('적극투자형', '펀드',       10),
        ('적극투자형', '현금성자산', 5),

        ('공격투자형', '주식',       85),
        ('공격투자형', '채권',       5),
        ('공격투자형', '펀드',       5),
        ('공격투자형', '현금성자산', 5)
) AS v(risk_grade, asset_class_name, weight)
JOIN asset_classes ac ON ac.name = v.asset_class_name
WHERE NOT EXISTS (
    SELECT 1 FROM target_asset_allocations taa
    WHERE taa.risk_grade = v.risk_grade AND taa.asset_class_id = ac.id
);
