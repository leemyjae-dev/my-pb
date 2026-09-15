// 도메인 채점 순수 함수 모음
// route/service와 분리해 입출력만으로 테스트 가능하게 한다.
// 도메인 정의서 6절 기준: 문항 10개, 각 1~5점, 합산 후 100점 환산.
//
// "100점 환산" 공식은 문서에 구체적으로 명시되어 있지 않아, 응답 가능한
// 최소~최대 원점수 범위(10~50)를 0~100으로 선형 변환(min-max 정규화)하는
// 방식을 임의로 채택했다. 실제 설문 문항/배점이 확정되면 재검토가 필요하다.

const KYC_QUESTION_COUNT = 10;
const KYC_MIN_ANSWER = 1;
const KYC_MAX_ANSWER = 5;
const KYC_MIN_RAW_SUM = KYC_QUESTION_COUNT * KYC_MIN_ANSWER; // 10
const KYC_MAX_RAW_SUM = KYC_QUESTION_COUNT * KYC_MAX_ANSWER; // 50

// 도메인 정의서 6절 구간 기준
const KYC_RISK_GRADES = [
  { max: 19, grade: '안정형' },
  { max: 39, grade: '안정추구형' },
  { max: 59, grade: '위험중립형' },
  { max: 79, grade: '적극투자형' },
  { max: 100, grade: '공격투자형' },
];

function assertValidKycAnswers(answers) {
  if (!Array.isArray(answers) || answers.length !== KYC_QUESTION_COUNT) {
    throw new Error(`answers는 ${KYC_QUESTION_COUNT}개의 응답 배열이어야 합니다.`);
  }
  for (const value of answers) {
    if (!Number.isInteger(value) || value < KYC_MIN_ANSWER || value > KYC_MAX_ANSWER) {
      throw new Error(`응답값은 ${KYC_MIN_ANSWER}~${KYC_MAX_ANSWER} 사이의 정수여야 합니다.`);
    }
  }
}

// 문항별 응답(1~5점, 10개) → 100점 환산 총점
function calculateKycTotalScore(answers) {
  assertValidKycAnswers(answers);
  const rawSum = answers.reduce((sum, value) => sum + value, 0);
  return Math.round(
    ((rawSum - KYC_MIN_RAW_SUM) / (KYC_MAX_RAW_SUM - KYC_MIN_RAW_SUM)) * 100
  );
}

// 100점 환산 총점 → 5단계 성향 등급
function classifyKycRiskGrade(totalScore) {
  if (!Number.isInteger(totalScore) || totalScore < 0 || totalScore > 100) {
    throw new Error('totalScore는 0~100 사이의 정수여야 합니다.');
  }
  return KYC_RISK_GRADES.find(({ max }) => totalScore <= max).grade;
}

// 문항별 응답 → { totalScore, riskGrade } 를 한 번에 산출
function scoreKycSubmission(answers) {
  const totalScore = calculateKycTotalScore(answers);
  const riskGrade = classifyKycRiskGrade(totalScore);
  return { totalScore, riskGrade };
}

// ==========================================================================
// IPIP 신경성 검사 채점 (FR-2)
// 도메인 정의서 6절 기준: 문항 10개, 각 1~5점, 역채점 문항은 `6 - 응답값`
// 으로 반전 후 합산 (100점 환산 없이 원점수 총점 그대로 사용, 10~50점).
// ==========================================================================

const IPIP_QUESTION_COUNT = 10;
const IPIP_MIN_ANSWER = 1;
const IPIP_MAX_ANSWER = 5;
const IPIP_MIN_TOTAL_SCORE = IPIP_QUESTION_COUNT * IPIP_MIN_ANSWER; // 10
const IPIP_MAX_TOTAL_SCORE = IPIP_QUESTION_COUNT * IPIP_MAX_ANSWER; // 50
const IPIP_REVERSE_SCORE_BASE = 6; // 반전 공식: 6 - 응답값

// 확인 필요: 어떤 문항 번호가 역채점인지 도메인 정의서/PRD에는 명시되어
// 있지 않다. 캡스톤 기획서 별첨2(IPIP 원문항 예시) 기준 문항 2("느긋하고
// 편안함"), 문항 4("울적함을 거의 느끼지 않음")가 역채점 문항이라는 정보를
// 근거로 우선 구현했다. 실제 채택되는 한국어 검증 번역본(도메인 정의서 8절
// 확인 필요 사항)의 문항 구성이 달라지면 이 목록도 함께 갱신해야 한다.
const IPIP_REVERSE_SCORED_ITEM_NUMBERS = [2, 4]; // 1-indexed 문항 번호

// 확인 필요(블로커, 도메인 정의서 8절): "평균 대비 1표준편차 이상(상위 약
// 16%)"의 평균/표준편차가 어떤 규준집단 데이터에 근거하는지 미확정이다.
// 실제 규준 데이터가 없어, 이론적 점수 범위(10~50점)만으로 평균/표준편차를
// 다음과 같이 가정한 임시 임계값을 사용한다 — 반드시 실제 규준 데이터로
// 교체가 필요하다:
//   - 이론적 평균 = (최솟값 + 최댓값) / 2 = 30
//   - 이론적 표준편차 ≈ (최댓값 - 최솟값) / 6 ≈ 6.67
//     (정규분포 근사 시 자주 쓰는 "범위 ≈ 6 x 표준편차" 어림값)
//   - 임계값 = 평균 + 1표준편차 ≈ 36.67 → 반올림 37점 이상이면 '높음'
const NEUROTICISM_THEORETICAL_MEAN =
  (IPIP_MIN_TOTAL_SCORE + IPIP_MAX_TOTAL_SCORE) / 2; // 30
const NEUROTICISM_THEORETICAL_SD =
  (IPIP_MAX_TOTAL_SCORE - IPIP_MIN_TOTAL_SCORE) / 6; // ≈ 6.67
const NEUROTICISM_HIGH_SENSITIVITY_THRESHOLD = Math.round(
  NEUROTICISM_THEORETICAL_MEAN + NEUROTICISM_THEORETICAL_SD
); // 37

function assertValidIpipAnswers(answers) {
  if (!Array.isArray(answers) || answers.length !== IPIP_QUESTION_COUNT) {
    throw new Error(`answers는 ${IPIP_QUESTION_COUNT}개의 응답 배열이어야 합니다.`);
  }
  for (const value of answers) {
    if (!Number.isInteger(value) || value < IPIP_MIN_ANSWER || value > IPIP_MAX_ANSWER) {
      throw new Error(`응답값은 ${IPIP_MIN_ANSWER}~${IPIP_MAX_ANSWER} 사이의 정수여야 합니다.`);
    }
  }
}

// 문항별 응답(1~5점, 10개) → 역채점 반전 후 합산한 신경성 총점(10~50점)
function calculateNeuroticismTotalScore(answers) {
  assertValidIpipAnswers(answers);
  return answers.reduce((sum, value, index) => {
    const itemNumber = index + 1;
    const scoredValue = IPIP_REVERSE_SCORED_ITEM_NUMBERS.includes(itemNumber)
      ? IPIP_REVERSE_SCORE_BASE - value
      : value;
    return sum + scoredValue;
  }, 0);
}

// 신경성 총점 → 심리민감도 등급('보통'/'높음')
function classifyNeuroticismSensitivity(totalScore) {
  if (
    !Number.isInteger(totalScore) ||
    totalScore < IPIP_MIN_TOTAL_SCORE ||
    totalScore > IPIP_MAX_TOTAL_SCORE
  ) {
    throw new Error(
      `totalScore는 ${IPIP_MIN_TOTAL_SCORE}~${IPIP_MAX_TOTAL_SCORE} 사이의 정수여야 합니다.`
    );
  }
  return totalScore >= NEUROTICISM_HIGH_SENSITIVITY_THRESHOLD ? '높음' : '보통';
}

// 문항별 응답 → { totalScore, sensitivityGrade } 를 한 번에 산출
function scoreNeuroticismSubmission(answers) {
  const totalScore = calculateNeuroticismTotalScore(answers);
  const sensitivityGrade = classifyNeuroticismSensitivity(totalScore);
  return { totalScore, sensitivityGrade };
}

// ==========================================================================
// 정합성/괴리 판정 (FR-4.2)
// 도메인 정의서 6절: 성향기준 비중과 실보유 자산배분(자산군별 비중)을
// 비교해 초과/과소 여부 판정. 몇 %p 이상 차이부터 '괴리'로 볼지의 허용
// 오차(임계값)는 도메인 정의서 8절 기준 미확정이다 — 2일 MVP 진행을 위해
// ±5%p를 임시 임계값으로 채택했다(코디네이터 결정, 실제 서비스화 시
// 재검토 필요). 차이가 5%p "이상"이면 괴리이므로 경계값(정확히 5%p)도
// 괴리로 판정한다.
// ==========================================================================
const ASSET_CLASS_DEVIATION_THRESHOLD_PERCENT = 5;

// targetWeights/actualWeights: [{ assetClassName, weightPercent }, ...]
// 두 목록에 등장하는 자산군의 합집합을 기준으로 비교하며, 한쪽에만 있는
// 자산군은 없는 쪽을 0%로 간주한다.
function compareAssetClassAllocations(targetWeights, actualWeights) {
  const targetMap = new Map(targetWeights.map((w) => [w.assetClassName, w.weightPercent]));
  const actualMap = new Map(actualWeights.map((w) => [w.assetClassName, w.weightPercent]));
  const assetClassNames = [...new Set([...targetMap.keys(), ...actualMap.keys()])];

  return assetClassNames.map((assetClassName) => {
    const targetWeightPercent = targetMap.get(assetClassName) ?? 0;
    const actualWeightPercent = actualMap.get(assetClassName) ?? 0;
    const diff = actualWeightPercent - targetWeightPercent;

    let judgment = '정합';
    if (diff >= ASSET_CLASS_DEVIATION_THRESHOLD_PERCENT) {
      judgment = '괴리(초과)';
    } else if (diff <= -ASSET_CLASS_DEVIATION_THRESHOLD_PERCENT) {
      judgment = '괴리(과소)';
    }

    return { assetClassName, targetWeightPercent, actualWeightPercent, judgment };
  });
}

module.exports = {
  KYC_QUESTION_COUNT,
  KYC_MIN_ANSWER,
  KYC_MAX_ANSWER,
  calculateKycTotalScore,
  classifyKycRiskGrade,
  scoreKycSubmission,
  IPIP_QUESTION_COUNT,
  IPIP_MIN_ANSWER,
  IPIP_MAX_ANSWER,
  IPIP_REVERSE_SCORED_ITEM_NUMBERS,
  NEUROTICISM_HIGH_SENSITIVITY_THRESHOLD,
  calculateNeuroticismTotalScore,
  classifyNeuroticismSensitivity,
  scoreNeuroticismSubmission,
  ASSET_CLASS_DEVIATION_THRESHOLD_PERCENT,
  compareAssetClassAllocations,
};
