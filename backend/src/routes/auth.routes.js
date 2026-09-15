// 인증 라우트 — 회원가입/로그인/토큰 재발급 (FR-0)
// 요청/응답 필드명과 상태코드는 backend/swagger.json의 /api/auth/* 정의를 따른다.
const express = require('express');
const authService = require('../services/auth.service');

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'email과 password는 필수입니다.' });
  }

  const user = await authService.signup(email, password);
  res.status(201).json(user);
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'email과 password는 필수입니다.' });
  }

  const tokens = await authService.login(email, password);
  res.status(200).json(tokens);
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) {
    return res.status(400).json({ message: 'refreshToken은 필수입니다.' });
  }

  const result = authService.refreshAccessToken(refreshToken);
  res.status(200).json(result);
});

module.exports = router;
