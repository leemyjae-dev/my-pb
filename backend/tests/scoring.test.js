const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateKycTotalScore,
  classifyKycRiskGrade,
  scoreKycSubmission,
  calculateNeuroticismTotalScore,
  classifyNeuroticismSensitivity,
  scoreNeuroticismSubmission,
  compareAssetClassAllocations,
} = require('../src/utils/scoring');

test('classifyKycRiskGrade - 구간 경계값 (도메인 정의서 6절)', () => {
  assert.equal(classifyKycRiskGrade(0), '안정형');
  assert.equal(classifyKycRiskGrade(19), '안정형');
  assert.equal(classifyKycRiskGrade(20), '안정추구형');
  assert.equal(classifyKycRiskGrade(39), '안정추구형');
  assert.equal(classifyKycRiskGrade(40), '위험중립형');
  assert.equal(classifyKycRiskGrade(59), '위험중립형');
  assert.equal(classifyKycRiskGrade(60), '적극투자형');
  assert.equal(classifyKycRiskGrade(79), '적극투자형');
  assert.equal(classifyKycRiskGrade(80), '공격투자형');
  assert.equal(classifyKycRiskGrade(100), '공격투자형');
});

test('classifyKycRiskGrade - 범위를 벗어난 totalScore는 에러', () => {
  assert.throws(() => classifyKycRiskGrade(-1));
  assert.throws(() => classifyKycRiskGrade(101));
});

test('calculateKycTotalScore - 최저/중간/최고 응답', () => {
  assert.equal(calculateKycTotalScore(Array(10).fill(1)), 0); // 원점수 10 → 0점
  assert.equal(calculateKycTotalScore(Array(10).fill(3)), 50); // 원점수 30 → 50점
  assert.equal(calculateKycTotalScore(Array(10).fill(5)), 100); // 원점수 50 → 100점
});

test('calculateKycTotalScore - 잘못된 입력은 에러', () => {
  assert.throws(() => calculateKycTotalScore([1, 2, 3])); // 개수 부족
  assert.throws(() => calculateKycTotalScore(Array(10).fill(6))); // 범위 초과
  assert.throws(() => calculateKycTotalScore(Array(10).fill(0))); // 범위 미달
});

test('scoreKycSubmission - 총점과 등급을 함께 산출', () => {
  const result = scoreKycSubmission(Array(10).fill(1));
  assert.deepEqual(result, { totalScore: 0, riskGrade: '안정형' });
});

test('calculateNeuroticismTotalScore - 역채점 문항(2, 4) 반전 확인', () => {
  // 전부 1점: 정채점 8문항 x 1 = 8, 역채점 2문항은 6-1=5 x 2 = 10 → 총 18
  assert.equal(calculateNeuroticismTotalScore(Array(10).fill(1)), 18);
  // 전부 5점: 정채점 8문항 x 5 = 40, 역채점 2문항은 6-5=1 x 2 = 2 → 총 42
  assert.equal(calculateNeuroticismTotalScore(Array(10).fill(5)), 42);
  // 반전이 적용되지 않았다면(단순 합) 전부 1점은 10, 전부 5점은 50이 되므로
  // 위 두 값(18, 42)과 다르다는 점에서 반전 로직이 실제로 동작함을 검증한다.
});

test('classifyNeuroticismSensitivity - 임시 임계값(37점) 경계 확인 (확인 필요: 실제 규준 데이터로 교체 필요)', () => {
  assert.equal(classifyNeuroticismSensitivity(10), '보통');
  assert.equal(classifyNeuroticismSensitivity(36), '보통');
  assert.equal(classifyNeuroticismSensitivity(37), '높음');
  assert.equal(classifyNeuroticismSensitivity(50), '높음');
});

test('classifyNeuroticismSensitivity - 범위를 벗어난 totalScore는 에러', () => {
  assert.throws(() => classifyNeuroticismSensitivity(9));
  assert.throws(() => classifyNeuroticismSensitivity(51));
});

test('calculateNeuroticismTotalScore - 잘못된 입력은 에러', () => {
  assert.throws(() => calculateNeuroticismTotalScore([1, 2, 3]));
  assert.throws(() => calculateNeuroticismTotalScore(Array(10).fill(6)));
});

test('scoreNeuroticismSubmission - 총점과 등급을 함께 산출', () => {
  const result = scoreNeuroticismSubmission(Array(10).fill(5));
  assert.deepEqual(result, { totalScore: 42, sensitivityGrade: '높음' });
});

test('compareAssetClassAllocations - 임계값(5%p) 경계값 (임시값, 도메인 정의서 8절 확인 필요)', () => {
  const target = [{ assetClassName: '주식', weightPercent: 30 }];

  // 정확히 5%p 차이 → "이상"이므로 괴리(초과)
  assert.equal(
    compareAssetClassAllocations(target, [{ assetClassName: '주식', weightPercent: 35 }])[0]
      .judgment,
    '괴리(초과)'
  );
  // 4.99%p 차이 → 정합
  assert.equal(
    compareAssetClassAllocations(target, [{ assetClassName: '주식', weightPercent: 34.99 }])[0]
      .judgment,
    '정합'
  );
  // 5.01%p 차이 → 괴리(초과)
  assert.equal(
    compareAssetClassAllocations(target, [{ assetClassName: '주식', weightPercent: 35.01 }])[0]
      .judgment,
    '괴리(초과)'
  );
  // 정확히 -5%p 차이 → 괴리(과소)
  assert.equal(
    compareAssetClassAllocations(target, [{ assetClassName: '주식', weightPercent: 25 }])[0]
      .judgment,
    '괴리(과소)'
  );
  // -4.99%p 차이 → 정합
  assert.equal(
    compareAssetClassAllocations(target, [{ assetClassName: '주식', weightPercent: 25.01 }])[0]
      .judgment,
    '정합'
  );
  // 차이 0 → 정합
  assert.equal(
    compareAssetClassAllocations(target, [{ assetClassName: '주식', weightPercent: 30 }])[0]
      .judgment,
    '정합'
  );
});

test('compareAssetClassAllocations - 한쪽에만 있는 자산군은 0%로 간주', () => {
  const target = [{ assetClassName: '주식', weightPercent: 30 }];
  const actual = [
    { assetClassName: '주식', weightPercent: 30 },
    { assetClassName: '채권', weightPercent: 10 }, // 성향기준에는 없는 자산군
  ];
  const result = compareAssetClassAllocations(target, actual);
  const bondComparison = result.find((item) => item.assetClassName === '채권');
  assert.equal(bondComparison.targetWeightPercent, 0);
  assert.equal(bondComparison.actualWeightPercent, 10);
  assert.equal(bondComparison.judgment, '괴리(초과)'); // 0 → 10, 차이 10%p
});
