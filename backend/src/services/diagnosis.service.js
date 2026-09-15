// 종합 진단 결과 도메인 서비스 (FR-4)
const pool = require('../db/pool');
const kycService = require('./kyc.service');
const neuroticismService = require('./neuroticism.service');
const holdingsService = require('./holdings.service');
const { compareAssetClassAllocations } = require('../utils/scoring');

// KYC 등급(riskGrade)에 대응하는 성향기준 비중 조회
async function getTargetWeights(riskGrade) {
  const result = await pool.query(
    `SELECT ac.name AS asset_class_name, taa.target_weight_percent
     FROM target_asset_allocations taa
     JOIN asset_classes ac ON ac.id = taa.asset_class_id
     WHERE taa.risk_grade = $1`,
    [riskGrade]
  );

  return result.rows.map((row) => ({
    assetClassName: row.asset_class_name,
    weightPercent: Number(row.target_weight_percent),
  }));
}

// 정합/괴리 판정 결과와 심리적 부담 여부로 피드백 메시지를 생성한다
// (도메인 정의서 6절: 정합 시 긍정 피드백, 괴리 시 조정 방향 안내,
// 괴리 + 심리민감도 '높음' 결합 시 심리적 부담 안내 추가).
function buildFeedbackMessage(comparisonResult, psychologicalBurdenFlag) {
  const deviations = comparisonResult.filter((item) => item.judgment !== '정합');

  if (deviations.length === 0) {
    return '투자자성향, 심리민감도, 실제 보유 자산배분이 모두 적절하게 정합적입니다. 현재 자산배분을 잘 유지하고 계십니다.';
  }

  const deviationText = deviations
    .map((item) => `${item.assetClassName}(${item.judgment})`)
    .join(', ');
  let message = `다음 자산군에서 성향기준 비중과 실보유 비중 간 괴리가 발견되었습니다: ${deviationText}. 성향기준 비중에 가깝게 조정하는 것을 권장합니다.`;

  if (psychologicalBurdenFlag) {
    message +=
      ' 특히 심리민감도가 높은 편으로 진단되어, 초과 투자된 자산이 심리적으로 더 큰 부담이 될 수 있습니다.';
  }

  return message;
}

// 3종 입력(KYC/IPIP/확정된 잔고 스냅샷)을 결합해 종합 진단을 생성한다.
// 하나라도 없으면 { complete: false, missingInputs } 를 반환한다 (FR-4.6).
async function createDiagnosis(userId) {
  const [kycResult, neuroticismResult, holdingsSnapshot] = await Promise.all([
    kycService.getLatest(userId),
    neuroticismService.getLatest(userId),
    holdingsService.getLatestConfirmed(userId),
  ]);

  const missingInputs = [];
  if (!kycResult) missingInputs.push('kyc');
  if (!neuroticismResult) missingInputs.push('neuroticism');
  if (!holdingsSnapshot) missingInputs.push('holdings');

  if (missingInputs.length > 0) {
    return { complete: false, missingInputs };
  }

  const targetWeights = await getTargetWeights(kycResult.riskGrade);
  const actualWeights = holdingsSnapshot.assetClassWeights || [];

  const comparisonResult = compareAssetClassAllocations(targetWeights, actualWeights);
  const hasDeviation = comparisonResult.some((item) => item.judgment !== '정합');
  const psychologicalBurdenFlag = hasDeviation && neuroticismResult.sensitivityGrade === '높음';
  const feedbackMessage = buildFeedbackMessage(comparisonResult, psychologicalBurdenFlag);

  const insertResult = await pool.query(
    `INSERT INTO risk_diagnosis_results
       (user_id, kyc_profile_result_id, neuroticism_test_result_id, holdings_snapshot_id,
        comparison_result, psychological_burden_flag, feedback_message)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, kyc_profile_result_id, neuroticism_test_result_id, holdings_snapshot_id,
               comparison_result, psychological_burden_flag, feedback_message, diagnosed_at`,
    [
      userId,
      kycResult.id,
      neuroticismResult.id,
      holdingsSnapshot.id,
      JSON.stringify(comparisonResult),
      psychologicalBurdenFlag,
      feedbackMessage,
    ]
  );
  const row = insertResult.rows[0];

  return {
    complete: true,
    result: {
      id: row.id,
      kycProfileResultId: row.kyc_profile_result_id,
      neuroticismTestResultId: row.neuroticism_test_result_id,
      holdingsSnapshotId: row.holdings_snapshot_id,
      riskGrade: kycResult.riskGrade,
      sensitivityGrade: neuroticismResult.sensitivityGrade,
      comparisonResult: row.comparison_result,
      psychologicalBurdenFlag: row.psychological_burden_flag,
      feedbackMessage: row.feedback_message,
      diagnosedAt: row.diagnosed_at,
    },
  };
}

module.exports = { createDiagnosis };
