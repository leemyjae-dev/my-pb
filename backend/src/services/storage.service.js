// 잔고 스크린샷 이미지 저장소 추상화 (FR-3.1)
//
// 저장 위치를 환경변수로 분기한다: SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY가
// 둘 다 설정되어 있으면 Supabase Storage에 저장하고(배포 환경), 없으면
// 기존처럼 로컬 디스크(backend/uploads/)에 저장한다. 로컬 개발용
// backend/.env에는 이 두 값이 없으므로 로컬 개발 워크플로우는 그대로다.
//
// Supabase Storage 버킷(`holdings-screenshots`)은 비공개이므로, 업로드 후
// signed URL을 발급해 holdings_snapshots.image_url에 저장한다. signed URL은
// 만료시간이 있는데, 이 프로젝트는 진단 결과·대시보드 등에서 image_url을
// 재조회해 장기간 표시할 수 있어 너무 짧으면 링크가 깨질 수 있다. 반대로
// 자동 갱신 로직을 만드는 것은 2일 MVP 범위를 벗어난다고 판단해, 갱신
// 로직 없이 "충분히 길게"(1년)로 설정했다 — 실제 서비스화 시에는 만료 전
// 재발급 로직(예: 조회 시점에 만료 임박하면 새로 서명)이 필요하다.
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const env = require('../config/env');
const { UPLOAD_DIR } = require('../middleware/upload.middleware');

const SUPABASE_BUCKET = 'holdings-screenshots';
const SIGNED_URL_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 365; // 1년 (임시값, 위 설명 참조)

function isSupabaseConfigured() {
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
}

function generateFileName(originalName) {
  const ext = path.extname(originalName || '') || '';
  return `${Date.now()}-${crypto.randomUUID()}${ext}`;
}

let supabaseClient;
function getSupabaseClient() {
  if (!supabaseClient) {
    // 배포 환경(Supabase 미설정 시 미사용)에서만 필요하므로 지연 로딩한다.
    const { createClient } = require('@supabase/supabase-js');
    supabaseClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);
  }
  return supabaseClient;
}

async function saveToLocalDisk(file) {
  const fileName = generateFileName(file.originalname);
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, fileName), file.buffer);
  return `/uploads/${fileName}`;
}

async function saveToSupabaseStorage(file) {
  const fileName = generateFileName(file.originalname);
  const supabase = getSupabaseClient();

  const { error: uploadError } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(fileName, file.buffer, { contentType: file.mimetype });
  if (uploadError) {
    throw new Error(`Supabase Storage 업로드 실패: ${uploadError.message}`);
  }

  const { data, error: signError } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .createSignedUrl(fileName, SIGNED_URL_EXPIRES_IN_SECONDS);
  if (signError) {
    throw new Error(`Supabase Storage signed URL 발급 실패: ${signError.message}`);
  }

  return data.signedUrl;
}

// 업로드된 잔고 스크린샷 파일(multer 메모리 버퍼)을 저장하고,
// holdings_snapshots.image_url에 쓸 URL을 반환한다.
async function saveHoldingsScreenshot(file) {
  return isSupabaseConfigured() ? saveToSupabaseStorage(file) : saveToLocalDisk(file);
}

module.exports = { saveHoldingsScreenshot };
