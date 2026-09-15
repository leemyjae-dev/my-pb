// OCR 원문 텍스트 → 자산 항목(종목명/수량/평가금액) 파싱 휴리스틱
//
// 실제 증권 앱 스크린샷은 레이아웃이 제각각이라 정교한 파싱은 2일 MVP
// 범위에서 불가능하다고 보고, 아래처럼 최대한 단순한 규칙만 적용한다:
//   1. 줄 단위로 분리한다.
//   2. 한 줄에서 숫자로 보이는 토큰을 모두 찾는다.
//   3. 숫자가 없는 줄은 건너뛴다(종목 정보가 아닐 가능성이 높음).
//   4. 숫자 중 가장 큰 값을 평가금액(amount), 그다음으로 큰 값을 있으면
//      수량(quantity)으로 추정한다(평가금액이 수량보다 훨씬 크다는 가정).
//   5. 숫자를 제거하고 남은 텍스트를 종목명(rawName)으로 취급한다.
// 이 휴리스틱은 정확도가 낮을 수 있음을 전제로 하며, 그래서
// holdings.service.js는 결과 항목을 전부 "보정필요" 상태로 저장한다.

const NUMBER_PATTERN = /[\d][\d,]*(\.\d+)?/g;
const MAX_PARSED_ITEMS = 30; // 노이즈 라인이 과도하게 쌓이는 것을 막는 안전장치

function parseHoldingLine(line) {
  const numberTokens = line.match(NUMBER_PATTERN) || [];
  const numbers = numberTokens
    .map((token) => Number(token.replace(/,/g, '')))
    .filter((value) => !Number.isNaN(value));

  const rawName = line.replace(NUMBER_PATTERN, ' ').replace(/\s+/g, ' ').trim();

  if (!rawName || numbers.length === 0) {
    return null;
  }

  const sortedDesc = [...numbers].sort((a, b) => b - a);
  return {
    rawName,
    amount: sortedDesc[0],
    quantity: sortedDesc.length > 1 ? sortedDesc[1] : null,
  };
}

// OCR 원문 텍스트 → [{ rawName, quantity, amount }, ...]
function parseHoldingItemsFromText(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseHoldingLine)
    .filter(Boolean)
    .slice(0, MAX_PARSED_ITEMS);
}

// 종목명 → 자산군 이름 임시 배정 (단순 키워드 매칭)
// 확인 필요: 실제 종목명 → 자산군 분류 기준 데이터는 도메인 정의서 8절
// 기준 미확정이다. 정교한 분류는 BE-7 범위이며, 여기서는 최소한의 키워드
// 매칭만 적용하고 나머지는 전부 기본값(주식)으로 둔다.
const ASSET_CLASS_KEYWORD_RULES = [
  { name: '채권', keywords: ['채권', '본드', 'bond'] },
  { name: '펀드', keywords: ['펀드', '자산운용', 'fund'] },
  { name: '현금성자산', keywords: ['현금', 'cma', 'cash'] },
];
const DEFAULT_ASSET_CLASS_NAME = '주식';

function guessAssetClassName(rawName) {
  const lower = rawName.toLowerCase();
  const rule = ASSET_CLASS_KEYWORD_RULES.find(({ keywords }) =>
    keywords.some((keyword) => lower.includes(keyword.toLowerCase()))
  );
  return rule ? rule.name : DEFAULT_ASSET_CLASS_NAME;
}

module.exports = {
  parseHoldingItemsFromText,
  guessAssetClassName,
  DEFAULT_ASSET_CLASS_NAME,
};
