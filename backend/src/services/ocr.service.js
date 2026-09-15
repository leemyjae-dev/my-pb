// OCR 서비스 — 업로드된 잔고 스크린샷 이미지에서 텍스트를 추출한다.
//
// 이미지 인식(OCR/AI 비전) 구현 수단은 무료 로컬 OCR인 tesseract.js로
// 확정됐다(도메인 정의서 8절·PRD 9절 확인 필요 사항에 대한 결정, API 키를
// 쓰는 외부 Vision API는 사용하지 않음). 한국어 종목명 인식을 위해
// 'kor+eng' 언어팩을 사용한다.
//
// 실제 증권 앱 스크린샷은 레이아웃이 제각각이고 tesseract.js의 인식
// 정확도도 완벽하지 않으므로, 이 함수의 출력(원문 텍스트)은 참고용일 뿐
// 신뢰할 수 있는 데이터로 취급하지 않는다 — holdings.service.js에서 이
// 텍스트를 파싱한 모든 항목의 classificationStatus를 "보정필요"로 고정하는
// 것은 이 때문이다.
const Tesseract = require('tesseract.js');

async function recognizeText(imagePath) {
  const {
    data: { text },
  } = await Tesseract.recognize(imagePath, 'kor+eng');
  return text;
}

module.exports = { recognizeText };
