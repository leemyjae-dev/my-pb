// 공통 에러 응답 처리 미들웨어
// app.js의 가장 마지막(모든 라우트 이후)에 등록한다.
// 응답 포맷은 swagger.json의 ErrorResponse 스키마({ message: string })를 따른다.
function errorMiddleware(err, req, res, next) {
  console.error(err);
  // multer 업로드 제약(파일 크기 초과 등) 위반은 클라이언트 요청 문제이므로 400으로 매핑한다.
  const status = err.status || (err.name === 'MulterError' ? 400 : 500);
  const message = err.message || '서버 오류가 발생했습니다.';
  res.status(status).json({ message });
}

module.exports = errorMiddleware;
