// 투자자성향(KYC) 설문 도메인 서비스 (FR-1)
const pool = require('../db/pool');
const { scoreKycSubmission } = require('../utils/scoring');

function toKycProfileResultResponse(row) {
  return {
    id: row.id,
    answers: row.answers,
    totalScore: row.total_score,
    riskGrade: row.risk_grade,
    takenAt: row.taken_at,
  };
}

// 응답 제출 → 채점 → 저장 (재응시 시 새 행으로 별도 생성, FR-1.4)
async function submit(userId, answers) {
  const { totalScore, riskGrade } = scoreKycSubmission(answers);

  const result = await pool.query(
    `INSERT INTO kyc_profile_results (user_id, answers, total_score, risk_grade)
     VALUES ($1, $2, $3, $4)
     RETURNING id, answers, total_score, risk_grade, taken_at`,
    [userId, JSON.stringify(answers), totalScore, riskGrade]
  );

  return toKycProfileResultResponse(result.rows[0]);
}

// 가장 최근 결과 조회 (없으면 null)
async function getLatest(userId) {
  const result = await pool.query(
    `SELECT id, answers, total_score, risk_grade, taken_at
     FROM kyc_profile_results
     WHERE user_id = $1
     ORDER BY taken_at DESC
     LIMIT 1`,
    [userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return toKycProfileResultResponse(result.rows[0]);
}

module.exports = { submit, getLatest };
