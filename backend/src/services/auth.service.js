// 인증 도메인 서비스 — 회원가입/로그인/토큰 재발급 (FR-0)
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const env = require('../config/env');

const SALT_ROUNDS = 10;

function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function toUserResponse(row) {
  return { id: row.id, email: row.email, createdAt: row.created_at };
}

function signAccessToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn,
  });
}

function signRefreshToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  });
}

async function signup(email, password) {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw createError(409, '이미 가입된 이메일입니다.');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await pool.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
    [email, passwordHash]
  );

  return toUserResponse(result.rows[0]);
}

async function login(email, password) {
  const result = await pool.query(
    'SELECT id, email, password_hash FROM users WHERE email = $1',
    [email]
  );
  const user = result.rows[0];

  if (!user) {
    throw createError(401, '이메일 또는 비밀번호가 일치하지 않습니다.');
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw createError(401, '이메일 또는 비밀번호가 일치하지 않습니다.');
  }

  return {
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
  };
}

function refreshAccessToken(refreshToken) {
  let payload;
  try {
    payload = jwt.verify(refreshToken, env.jwtRefreshSecret);
  } catch (err) {
    throw createError(401, 'refresh_token이 유효하지 않거나 만료되었습니다.');
  }

  return { accessToken: signAccessToken({ id: payload.sub, email: payload.email }) };
}

module.exports = { signup, login, refreshAccessToken };
