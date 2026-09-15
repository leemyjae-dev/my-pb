// Express 앱 설정 뼈대
// 라우트(routes/)는 도메인 구현이 진행됨에 따라 순차적으로 추가한다.
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./config/env');
const pool = require('./db/pool');
const errorMiddleware = require('./middleware/error.middleware');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(morgan('dev'));
app.use(express.json());

// 헬스체크: DB 커넥션까지 확인한다.
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected', message: err.message });
  }
});

app.use('/api/auth', authRoutes);

// 공통 에러 응답 처리 — 반드시 모든 라우트 등록 이후, 가장 마지막에 둔다.
app.use(errorMiddleware);

module.exports = app;
