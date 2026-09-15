// 종합 진단 결과 라우트 (FR-4)
// 이 라우터는 app.js에서 auth.middleware와 함께 등록된다(인증 필요).
// 요청/응답 형태는 backend/swagger.json의 /api/diagnosis 정의를 따른다.
const express = require('express');
const diagnosisService = require('../services/diagnosis.service');

const router = express.Router();

router.post('/', async (req, res) => {
  const diagnosis = await diagnosisService.createDiagnosis(req.user.sub);

  if (!diagnosis.complete) {
    return res.status(200).json({ complete: false, missingInputs: diagnosis.missingInputs });
  }

  res.status(201).json(diagnosis.result);
});

module.exports = router;
