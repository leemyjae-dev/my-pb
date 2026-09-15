// 환경변수 로드 및 검증
//
// 이번 BE-1 범위에서 실제로 사용하는 값(DB 연결 문자열, 서버 포트, CORS 허용
// origin)만 검증한다. JWT 관련 값은 BE-2/BE-3 이후 인증 기능에서 실제로
// 쓰이므로, 지금은 존재 여부를 강제하지 않고 그대로 넘겨준다(없으면
// undefined). 인증 기능을 구현하는 시점에 필요해지면 그때 검증을 추가한다.

require('dotenv').config();

function requireEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`필수 환경변수 ${key}가 설정되어 있지 않습니다. backend/.env를 확인하세요.`);
  }
  return value;
}

const env = {
  port: process.env.PORT || 4000,
  databaseUrl: requireEnv('POSTGRES_CONNECTION_STRING'),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
};

module.exports = env;
