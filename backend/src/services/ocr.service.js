// OCR 서비스 — 업로드된 잔고 스크린샷 이미지에서 텍스트/단어를 추출한다.
//
// 이미지 인식(OCR/AI 비전) 구현 수단은 무료 로컬 OCR인 tesseract.js로
// 확정됐다(도메인 정의서 8절·PRD 9절 확인 필요 사항에 대한 결정, API 키를
// 쓰는 외부 Vision API는 사용하지 않음). 한국어 종목명 인식을 위해
// 'kor+eng' 언어팩을 사용한다.
//
// 실제 증권 앱 스크린샷은 표 형태이고 종목 1건이 화면상 2줄에 걸쳐
// 표시되는 등 레이아웃이 제각각이라, holdingsParsing.js는 원문 텍스트뿐
// 아니라 단어별 화면 좌표(bounding box)까지 이용해 표 구조를 재구성한다.
// 이를 위해 tesseract.js의 저수준 API(createWorker)로 단어 단위 출력
// (blocks)까지 함께 요청한다 — recognize() 호출 방식 자체는 기존과 동일한
// 'kor+eng' 언어팩을 그대로 쓰고, 결과에서 얻는 정보만 확장한 것이다.
//
// tesseract.js의 인식 정확도는 완벽하지 않으므로, 이 함수의 출력(텍스트·
// 단어 좌표)은 참고용일 뿐 신뢰할 수 있는 데이터로 취급하지 않는다 —
// holdings.service.js에서 이를 파싱한 모든 항목의 classificationStatus를
// "보정필요"로 고정하는 것은 이 때문이다.
const { createWorker } = require('tesseract.js');

// 인식 결과에서 단어 단위(text, bbox, confidence)만 평탄화해서 뽑아낸다.
function flattenWords(blocks) {
  const words = [];
  for (const block of blocks || []) {
    for (const paragraph of block.paragraphs || []) {
      for (const line of paragraph.lines || []) {
        for (const word of line.words || []) {
          words.push({
            text: word.text,
            confidence: word.confidence,
            x0: word.bbox.x0,
            y0: word.bbox.y0,
            x1: word.bbox.x1,
            y1: word.bbox.y1,
          });
        }
      }
    }
  }
  return words;
}

// 이미지에서 원문 텍스트와 단어별 좌표(words)를 함께 인식한다.
async function recognizeWords(image) {
  const worker = await createWorker('kor+eng');
  try {
    const { data } = await worker.recognize(image, {}, { text: true, blocks: true });
    return { text: data.text, words: flattenWords(data.blocks) };
  } finally {
    await worker.terminate();
  }
}

module.exports = { recognizeWords };
