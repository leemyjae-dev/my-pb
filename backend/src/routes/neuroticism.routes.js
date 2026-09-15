// IPIP 신경성 검사 라우트 (FR-2)
// 이 라우터는 app.js에서 auth.middleware와 함께 등록된다(인증 필요).
// 요청/응답 필드명과 상태코드는 backend/swagger.json의 /api/neuroticism* 정의를 따른다.
const express = require('express');
const neuroticismService = require('../services/neuroticism.service');
const { IPIP_QUESTION_COUNT, IPIP_MIN_ANSWER, IPIP_MAX_ANSWER } = require('../utils/scoring');

const router = express.Router();

function isValidAnswers(answers) {
  return (
    Array.isArray(answers) &&
    answers.length === IPIP_QUESTION_COUNT &&
    answers.every(
      (value) => Number.isInteger(value) && value >= IPIP_MIN_ANSWER && value <= IPIP_MAX_ANSWER
    )
  );
}

router.post('/', async (req, res) => {
  const { answers } = req.body || {};

  if (!isValidAnswers(answers)) {
    return res.status(400).json({
      message: `answers는 ${IPIP_MIN_ANSWER}~${IPIP_MAX_ANSWER} 사이의 정수 ${IPIP_QUESTION_COUNT}개로 이루어진 배열이어야 합니다.`,
    });
  }

  const result = await neuroticismService.submit(req.user.sub, answers);
  res.status(201).json(result);
});

router.get('/latest', async (req, res) => {
  const result = await neuroticismService.getLatest(req.user.sub);

  if (!result) {
    return res.status(404).json({ message: '아직 응시한 결과가 없습니다.' });
  }

  res.status(200).json(result);
});

module.exports = router;
