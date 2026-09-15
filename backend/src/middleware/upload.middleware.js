// 잔고 스크린샷 업로드 미들웨어 (FR-3.1)
// 이미지 파일(jpg/png)만, 최대 5MB로 제한한다. 구체적 제한값은 PRD 9절
// 확인 필요 사항이므로 2일 MVP 규모에 맞는 임의의 값을 사용했다.
//
// 저장 위치는 2일 MVP 결정에 따라 로컬 디스크(backend/uploads/)를 사용한다.
// 저장 위치 관련 코드를 이 파일에만 캡슐화해, 추후 클라우드 스토리지 등으로
// 바꿀 때 이 파일만 수정하면 되도록 한다.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'];

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    const err = new Error('jpg, png 형식의 이미지만 업로드할 수 있습니다.');
    err.status = 400;
    return cb(err);
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

module.exports = { upload, UPLOAD_DIR };
