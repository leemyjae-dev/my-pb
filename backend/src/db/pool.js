// pg Pool 생성 (ORM 미사용 — 순수 SQL만 사용)
const { Pool } = require('pg');
const env = require('../config/env');

const pool = new Pool({
  connectionString: env.databaseUrl,
});

module.exports = pool;
