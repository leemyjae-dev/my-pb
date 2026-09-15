// 서버 기동 엔트리포인트
const app = require('./app');
const env = require('./config/env');
const pool = require('./db/pool');

app.listen(env.port, async () => {
  console.log(`my-pb backend server listening on port ${env.port}`);

  try {
    await pool.query('SELECT 1');
    console.log('PostgreSQL 연결 확인 완료');
  } catch (err) {
    console.error('PostgreSQL 연결 실패:', err.message);
  }
});
