// JWT access_token 검증 미들웨어
// Authorization: Bearer <access_token> 헤더를 검사해 유효하면 req.user에
// payload를 담아 다음으로 넘기고, 없거나 유효하지 않으면 401을 반환한다.
const jwt = require('jsonwebtoken');
const env = require('../config/env');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
  }

  try {
    req.user = jwt.verify(token, env.jwtAccessSecret);
    next();
  } catch (err) {
    return res.status(401).json({ message: '유효하지 않거나 만료된 토큰입니다.' });
  }
}

module.exports = authMiddleware;
