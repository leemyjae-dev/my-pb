// OCR 결과(원문 텍스트 + 단어별 좌표) → 자산 항목(종목명/수량/평가금액) 파싱
//
// 두 가지 파싱 방식을 함께 둔다.
//
// 1. 표 구조 인식(parseHoldingItemsFromWords, 우선 시도): 실제 증권 앱
//    화면은 "종목명/평가손익/잔고수량/매입가" 헤더가 있는 표이고, 종목
//    1건이 화면상 물리적으로 2줄에 걸쳐 표시된다(1번째 줄: 종목명·잔고수량,
//    2번째 줄: 국가구분·평가금액). 단어별 화면 좌표(bounding box)를 이용해
//    이 표 구조를 재구성한다:
//      a. 단어들을 y좌표로 묶어 화면상 "줄"로 재구성한다.
//      b. "종목명"이 포함된 줄을 헤더로 찾고, 그 줄의 단어 x좌표로 열(컬럼)
//         경계를 계산한다.
//      c. 헤더 다음 줄부터 두 줄씩 묶어 종목 1건으로 보고, 1번째 줄의
//         "종목명" 열 텍스트/"잔고수량" 열 숫자, 2번째 줄의 "잔고수량" 열
//         숫자(=평가금액)를 뽑는다.
//    이 방식은 표 헤더를 찾지 못하면(표 형태가 아닌 스크린샷이면) 적용할
//    수 없으므로 null을 반환한다.
//
// 2. 줄 단위 숫자 추출(parseHoldingItemsFromText, 폴백): 표 구조 인식이
//    실패했을 때 쓰는 기존의 단순 휴리스틱이다. 한 줄에서 숫자 토큰을 모두
//    찾아 가장 큰 값을 평가금액, 그다음으로 큰 값을 수량으로 추정하고,
//    숫자를 제거한 나머지를 종목명으로 본다.
//
// 두 방식 모두 정확도가 낮을 수 있음을 전제로 하며, 그래서
// holdings.service.js는 결과 항목을 전부 "보정필요" 상태로 저장한다.

const MAX_PARSED_ITEMS = 30; // 노이즈가 과도하게 쌓이는 것을 막는 안전장치

// ==========================================================================
// 표 구조 인식 (실제 증권 앱 스크린샷 대상)
// ==========================================================================

const NAME_HEADER_KEYWORD = '종목명';
const QUANTITY_HEADER_KEYWORDS = ['잔고', '수량'];
// 아래 두 임계값은 실제 증권 앱 스크린샷 1건으로 실험해 얻은 값이다:
// - 같은 줄에 속한 글자(음절)들은 y좌표가 최대 몇 픽셀 내로 겹치는 반면,
//   실제로 다른 줄인 경우 40px 이상 떨어져 있었다 → 여유를 두고 10px.
// - 같은 열(컬럼)에 속한 헤더 글자들은 대체로 붙어 있고, 다음 열과는
//   90px 이상 떨어져 있었다 → 여유를 두고 40px.
const LINE_GAP_THRESHOLD_PX = 10;
const COLUMN_GAP_THRESHOLD_PX = 40;

// 구간(interval) 기반 1차원 클러스터링. 정렬 후 gap(현재 클러스터의 최대
// 끝좌표와 다음 항목의 시작좌표 차이)이 threshold 이하면 같은 클러스터로
// 합친다. 줄(y축)·열(x축) 재구성에 공통으로 쓴다.
function clusterByGap(items, getStart, getEnd, gapThreshold) {
  const sorted = [...items].sort((a, b) => getStart(a) - getStart(b));
  const clusters = [];
  let current = [];
  let currentEnd = -Infinity;

  for (const item of sorted) {
    const start = getStart(item);
    if (current.length === 0 || start - currentEnd <= gapThreshold) {
      current.push(item);
      currentEnd = Math.max(currentEnd, getEnd(item));
    } else {
      clusters.push(current);
      current = [item];
      currentEnd = getEnd(item);
    }
  }
  if (current.length > 0) {
    clusters.push(current);
  }
  return clusters;
}

// 단어 목록 → 화면상 줄(row) 목록. 각 줄은 x좌표 순으로 정렬된 단어 배열과
// 그 단어를 이어붙인 텍스트를 갖는다.
function buildLines(words) {
  return clusterByGap(words, (w) => w.y0, (w) => w.y1, LINE_GAP_THRESHOLD_PX)
    .map((lineWords) => {
      const sorted = [...lineWords].sort((a, b) => a.x0 - b.x0);
      return {
        words: sorted,
        y0: Math.min(...lineWords.map((w) => w.y0)),
        y1: Math.max(...lineWords.map((w) => w.y1)),
        text: sorted.map((w) => w.text).join(''),
      };
    })
    .sort((a, b) => a.y0 - b.y0);
}

// 헤더 줄(1번째 줄, 예: "종목명 평가손익 잔고수량 매입가")의 단어들을
// x좌표로 묶어 열 경계를 계산한다. 헤더 2번째 줄("국가 구분 수익률 ...")
// 까지 같이 묶으면 두 줄의 글자가 x좌표 기준으로 서로 뒤섞여 헤더 텍스트
// 매칭이 깨지므로, 열 경계는 반드시 헤더 1번째 줄만으로 계산한다 — 데이터
// 줄 배정은 아래 nearestColumn()의 중심좌표 최근접 방식이라 이 정도로도
// 충분하다.
function buildColumns(headerLine1Words) {
  return clusterByGap(headerLine1Words, (w) => w.x0, (w) => w.x1, COLUMN_GAP_THRESHOLD_PX).map(
    (columnWords) => {
      const x0 = Math.min(...columnWords.map((w) => w.x0));
      const x1 = Math.max(...columnWords.map((w) => w.x1));
      return {
        x0,
        x1,
        center: (x0 + x1) / 2,
        text: [...columnWords].sort((a, b) => a.x0 - b.x0).map((w) => w.text).join(''),
      };
    }
  );
}

// 단어의 중심 x좌표와 가장 가까운 열을 찾는다(열 폭 밖으로 살짝 벗어난
// 글자도 자연스럽게 배정되도록 포함 여부 대신 최근접 거리로 판단한다).
function findNearestColumn(word, columns) {
  const wordCenter = (word.x0 + word.x1) / 2;
  let best = null;
  let bestDistance = Infinity;
  for (const column of columns) {
    const distance = Math.abs(wordCenter - column.center);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = column;
    }
  }
  return best;
}

function textInColumn(line, column, columns) {
  return line.words
    .filter((w) => findNearestColumn(w, columns) === column)
    .sort((a, b) => a.x0 - b.x0)
    .map((w) => w.text)
    .join('');
}

function parseNumber(text) {
  const cleaned = text.replace(/[^0-9.]/g, '');
  if (!cleaned) {
    return null;
  }
  const value = Number(cleaned);
  return Number.isNaN(value) ? null : value;
}

// 단어별 좌표(words) → 표 구조를 재구성해 [{ rawName, quantity, amount }, ...]
// 반환. 표 헤더("종목명")를 찾지 못하면 null(호출부에서 폴백 처리).
function parseHoldingItemsFromWords(words) {
  if (!Array.isArray(words) || words.length === 0) {
    return null;
  }

  const lines = buildLines(words);
  const headerLineIndex = lines.findIndex((line) => line.text.includes(NAME_HEADER_KEYWORD));
  if (headerLineIndex === -1) {
    return null;
  }

  const columns = buildColumns(lines[headerLineIndex].words);
  const nameColumn = columns.find((c) => c.text.includes(NAME_HEADER_KEYWORD));
  const quantityColumn = columns.find((c) =>
    QUANTITY_HEADER_KEYWORDS.some((keyword) => c.text.includes(keyword))
  );
  if (!nameColumn || !quantityColumn) {
    return null;
  }

  // 헤더 다음 줄(보통 헤더 2번째 줄)부터 순회하며, 종목명 줄(N) + 그 바로
  // 다음 줄(N+1, 평가금액)을 한 종목으로 묶는다. 조건을 만족하지 않는
  // 줄은 건너뛰고 다음 줄에서 다시 시도한다(표와 무관한 안내 문구·내비게이션
  // 텍스트 등이 중간에 섞여 있어도 계속 진행하기 위함).
  const dataLines = lines.slice(headerLineIndex + 1);
  const items = [];
  let i = 0;

  while (i < dataLines.length - 1 && items.length < MAX_PARSED_ITEMS) {
    const nameLine = dataLines[i];
    const amountLine = dataLines[i + 1];

    const rawName = textInColumn(nameLine, nameColumn, columns);
    const quantity = parseNumber(textInColumn(nameLine, quantityColumn, columns));
    const amount = parseNumber(textInColumn(amountLine, quantityColumn, columns));

    // 종목명 열 텍스트가 숫자로만 이루어져 있으면(예: 계좌번호) 종목이
    // 아니라고 보고 건너뛴다.
    const looksLikeName = Boolean(rawName) && !/^[0-9.,\-%]+$/.test(rawName);

    if (looksLikeName && quantity !== null && amount !== null) {
      items.push({ rawName, quantity, amount });
      i += 2; // 이번 항목이 두 줄(종목명 줄 + 평가금액 줄)을 소비했으므로 그다음 줄부터 재시도
    } else {
      i += 1; // 이번 줄은 종목 항목이 아니었다고 보고 한 줄만 건너뛰어 재동기화를 시도
    }
  }

  return items.length > 0 ? items : null;
}

// ==========================================================================
// 줄 단위 숫자 추출 (표 구조 인식 실패 시 폴백)
// ==========================================================================

const NUMBER_PATTERN = /[\d][\d,]*(\.\d+)?/g;

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

// OCR 인식 결과({ text, words }) → 자산 항목 목록.
// 표 구조 인식을 우선 시도하고, 실패하면 줄 단위 숫자 추출로 폴백한다.
function parseHoldingItems({ text, words }) {
  const tableItems = parseHoldingItemsFromWords(words);
  if (tableItems) {
    return tableItems;
  }
  return parseHoldingItemsFromText(text || '');
}

// ==========================================================================
// 자산군 임시 배정 (표/폴백 공통)
// ==========================================================================

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
  parseHoldingItems,
  parseHoldingItemsFromWords,
  parseHoldingItemsFromText,
  guessAssetClassName,
  DEFAULT_ASSET_CLASS_NAME,
};
