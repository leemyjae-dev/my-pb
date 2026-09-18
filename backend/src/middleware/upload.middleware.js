// 잔고 스크린샷 업로드 미들웨어 (FR-3.1)
// 이미지 파일(jpg/png)만, 최대 5MB로 제한한다. 구체적 제한값은 PRD 9절
// 확인 필요 사항이므로 2일 MVP 규모에 맞는 임의의 값을 사용했다.
//
// multer는 파일을 메모리 버퍼(file.buffer)로만 받는다 — 실제 저장 위치
// (로컬 디스크 vs Supabase Storage)는 services/storage.service.js에서
// 환경변수 기준으로 분기해 처리한다. Vercel 같은 서버리스 배포 환경은
// 임의 디렉토리에 디스크 쓰기가 불가능하므로, 미들웨어 단에서 디스크에
// 직접 쓰지 않는 방식으로 바꿨다(로컬 디스크 저장은 storage.service.js가
// 필요할 때만 backend/uploads/에 쓴다).
const path = require('path');
const multer = require('multer');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'];

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    const err = new Error('jpg, png 형식의 이미지만 업로드할 수 있습니다.');
    err.status = 400;
    return cb(err);
  }
  cb(null, true);
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

module.exports = { upload, UPLOAD_DIR };
