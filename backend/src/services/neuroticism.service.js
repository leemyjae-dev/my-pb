// IPIP 신경성 검사 도메인 서비스 (FR-2)
const pool = require('../db/pool');
const { scoreNeuroticismSubmission } = require('../utils/scoring');

function toNeuroticismTestResultResponse(row) {
  return {
    id: row.id,
    answers: row.answers,
    totalScore: row.total_score,
    sensitivityGrade: row.sensitivity_grade,
    takenAt: row.taken_at,
  };
}

// 응답 제출 → 채점 → 저장 (재응시 시 새 행으로 별도 생성, FR-2.5)
async function submit(userId, answers) {
  const { totalScore, sensitivityGrade } = scoreNeuroticismSubmission(answers);

  const result = await pool.query(
    `INSERT INTO neuroticism_test_results (user_id, answers, total_score, sensitivity_grade)
     VALUES ($1, $2, $3, $4)
     RETURNING id, answers, total_score, sensitivity_grade, taken_at`,
    [userId, JSON.stringify(answers), totalScore, sensitivityGrade]
  );

  return toNeuroticismTestResultResponse(result.rows[0]);
}

// 가장 최근 결과 조회 (없으면 null)
async function getLatest(userId) {
  const result = await pool.query(
    `SELECT id, answers, total_score, sensitivity_grade, taken_at
     FROM neuroticism_test_results
     WHERE user_id = $1
     ORDER BY taken_at DESC
     LIMIT 1`,
    [userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return toNeuroticismTestResultResponse(result.rows[0]);
}

module.exports = { submit, getLatest };
