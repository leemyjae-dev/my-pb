// 환경변수 로드 및 검증
//
// 필수로 강제 검증하는 값은 DB 연결 문자열뿐이다. JWT 시크릿은 .env에
// 있으면 그 값을 쓰고 없으면 undefined로 넘어간다 — jsonwebtoken이 시크릿
// 없이 서명/검증을 시도하면 그 시점에 에러가 나므로 별도 강제 검증을 두지
// 않았다(오버엔지니어링 방지).

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
  // 토큰 만료 시간은 도메인 정의서/PRD에 구체적 수치가 없어 임의로 정한
  // 기본값이다(access 15분, refresh 7일). .env에 값이 있으면 그 값을 쓴다.
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};

module.exports = env;
