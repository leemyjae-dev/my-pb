// 잔고 스크린샷 업로드 및 이미지 인식 도메인 서비스 (FR-3.1~FR-3.2)
const pool = require('../db/pool');
const { recognizeText } = require('./ocr.service');
const { parseHoldingItemsFromText, guessAssetClassName } = require('../utils/holdingsParsing');

// Tesseract.js + 단순 키워드 매칭 조합은 신뢰할 수 없으므로, 자동 인식된
// 모든 항목은 예외 없이 사용자 보정이 필요한 상태로 저장한다(swagger.json
// HoldingItem.classificationStatus 값 중 "보정필요"). 정교한 자동 분류
// 고도화는 BE-7 범위이나, 자동 분류 로직 자체는 이번에도 그대로 둔다.
const CLASSIFICATION_STATUS_PENDING = '보정필요';
const CLASSIFICATION_STATUS_CORRECTED = '보정완료'; // 사용자가 직접 보정을 완료한 상태 (FR-3.4)

function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function toHoldingItemResponse(row) {
  return {
    id: row.id,
    rawName: row.raw_name,
    quantity: row.quantity === null ? null : Number(row.quantity),
    amount: Number(row.amount),
    assetClass: { id: row.asset_class_id, name: row.asset_class_name },
    classificationStatus: row.classification_status,
  };
}

function toHoldingsSnapshotResponse(snapshotRow, itemRows) {
  return {
    id: snapshotRow.id,
    imageUrl: snapshotRow.image_url,
    items: itemRows.map(toHoldingItemResponse),
    assetClassWeights: snapshotRow.asset_class_weights, // 보정 확정 전이라 항상 null (BE-7에서 채움)
    confirmedAt: snapshotRow.confirmed_at,
    createdAt: snapshotRow.created_at,
  };
}

async function getAssetClassIdByName(name) {
  const result = await pool.query('SELECT id FROM asset_classes WHERE name = $1', [name]);
  if (result.rows.length === 0) {
    throw new Error(
      `자산군 "${name}"이(가) asset_classes 시드 데이터에 없습니다. 시드 데이터를 먼저 입력하세요.`
    );
  }
  return result.rows[0].id;
}

// 업로드된 이미지 저장 → OCR 인식 → 파싱 → 임시 자산군 배정 →
// holdings_snapshots/holding_items 저장 (FR-3.1~FR-3.2, 재업로드 시 새 스냅샷 생성: FR-3.6)
async function upload(userId, file) {
  const imageUrl = `/uploads/${file.filename}`;

  const rawText = await recognizeText(file.path);
  const parsedItems = parseHoldingItemsFromText(rawText);

  const snapshotResult = await pool.query(
    `INSERT INTO holdings_snapshots (user_id, image_url)
     VALUES ($1, $2)
     RETURNING id, image_url, asset_class_weights, confirmed_at, created_at`,
    [userId, imageUrl]
  );
  const snapshot = snapshotResult.rows[0];

  const itemRows = [];
  for (const item of parsedItems) {
    const assetClassName = guessAssetClassName(item.rawName);
    const assetClassId = await getAssetClassIdByName(assetClassName);

    const itemResult = await pool.query(
      `INSERT INTO holding_items
         (holdings_snapshot_id, asset_class_id, raw_name, quantity, amount, classification_status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, raw_name, quantity, amount, asset_class_id, classification_status`,
      [snapshot.id, assetClassId, item.rawName, item.quantity, item.amount, CLASSIFICATION_STATUS_PENDING]
    );
    itemRows.push({ ...itemResult.rows[0], asset_class_name: assetClassName });
  }

  return toHoldingsSnapshotResponse(snapshot, itemRows);
}

// 가장 최근 스냅샷과 자산 항목 목록 조회 (없으면 null)
async function getLatest(userId) {
  const snapshotResult = await pool.query(
    `SELECT id, image_url, asset_class_weights, confirmed_at, created_at
     FROM holdings_snapshots
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );

  if (snapshotResult.rows.length === 0) {
    return null;
  }
  const snapshot = snapshotResult.rows[0];

  const itemsResult = await pool.query(
    `SELECT hi.id, hi.raw_name, hi.quantity, hi.amount, hi.asset_class_id,
            hi.classification_status, ac.name AS asset_class_name
     FROM holding_items hi
     JOIN asset_classes ac ON ac.id = hi.asset_class_id
     WHERE hi.holdings_snapshot_id = $1
     ORDER BY hi.id`,
    [snapshot.id]
  );

  return toHoldingsSnapshotResponse(snapshot, itemsResult.rows);
}

// 확정(confirm)된 가장 최근 스냅샷 조회 (없으면 null) — 종합 진단(FR-4.1)에서
// 사용한다. 보정이 끝나지 않은(asset_class_weights가 null인) 스냅샷은
// 실보유 비중을 계산할 수 없으므로 진단 입력으로 사용하지 않는다.
async function getLatestConfirmed(userId) {
  const snapshotResult = await pool.query(
    `SELECT id, image_url, asset_class_weights, confirmed_at, created_at
     FROM holdings_snapshots
     WHERE user_id = $1 AND confirmed_at IS NOT NULL
     ORDER BY confirmed_at DESC
     LIMIT 1`,
    [userId]
  );

  if (snapshotResult.rows.length === 0) {
    return null;
  }
  const snapshot = snapshotResult.rows[0];

  const itemsResult = await pool.query(
    `SELECT hi.id, hi.raw_name, hi.quantity, hi.amount, hi.asset_class_id,
            hi.classification_status, ac.name AS asset_class_name
     FROM holding_items hi
     JOIN asset_classes ac ON ac.id = hi.asset_class_id
     WHERE hi.holdings_snapshot_id = $1
     ORDER BY hi.id`,
    [snapshot.id]
  );

  return toHoldingsSnapshotResponse(snapshot, itemsResult.rows);
}

// 요청한 사용자 소유의 스냅샷인지 확인 (없거나 다른 사용자 소유면 404)
async function getOwnedSnapshotOrThrow(snapshotId, userId) {
  const result = await pool.query(
    `SELECT id, image_url, asset_class_weights, confirmed_at, created_at
     FROM holdings_snapshots
     WHERE id = $1 AND user_id = $2`,
    [snapshotId, userId]
  );

  if (result.rows.length === 0) {
    throw createError(404, '보유잔고 스냅샷을 찾을 수 없습니다.');
  }

  return result.rows[0];
}

// 자산 항목의 자산군을 사용자가 직접 보정 (FR-3.4) — 보정 후 "보정완료" 상태로 전환
async function updateItemAssetClass(snapshotId, itemId, userId, assetClassId) {
  await getOwnedSnapshotOrThrow(snapshotId, userId);

  const assetClassResult = await pool.query('SELECT id, name FROM asset_classes WHERE id = $1', [
    assetClassId,
  ]);
  if (assetClassResult.rows.length === 0) {
    throw createError(400, '유효하지 않은 assetClassId입니다.');
  }
  const assetClass = assetClassResult.rows[0];

  const updateResult = await pool.query(
    `UPDATE holding_items
     SET asset_class_id = $1, classification_status = $2
     WHERE id = $3 AND holdings_snapshot_id = $4
     RETURNING id, raw_name, quantity, amount, asset_class_id, classification_status`,
    [assetClass.id, CLASSIFICATION_STATUS_CORRECTED, itemId, snapshotId]
  );

  if (updateResult.rows.length === 0) {
    throw createError(404, '자산 항목을 찾을 수 없습니다.');
  }

  return toHoldingItemResponse({ ...updateResult.rows[0], asset_class_name: assetClass.name });
}

function roundPercent(value) {
  return Math.round(value * 100) / 100;
}

// 보정 확정 (FR-3.5) — "보정필요" 항목이 남아있으면 거부, 전부 해소되면
// 자산군별 amount 합산 비중(%)을 계산해 holdings_snapshots에 저장한다.
async function confirmSnapshot(snapshotId, userId) {
  await getOwnedSnapshotOrThrow(snapshotId, userId);

  const itemsResult = await pool.query(
    `SELECT hi.amount, hi.classification_status, ac.name AS asset_class_name
     FROM holding_items hi
     JOIN asset_classes ac ON ac.id = hi.asset_class_id
     WHERE hi.holdings_snapshot_id = $1`,
    [snapshotId]
  );
  const items = itemsResult.rows;

  if (items.length === 0) {
    throw createError(400, '자산 항목이 없어 확정할 수 없습니다.');
  }

  const hasPendingItem = items.some(
    (item) => item.classification_status === CLASSIFICATION_STATUS_PENDING
  );
  if (hasPendingItem) {
    throw createError(400, '보정이 필요한 항목이 남아있어 확정할 수 없습니다.');
  }

  const totalAmount = items.reduce((sum, item) => sum + Number(item.amount), 0);

  const amountByAssetClass = new Map();
  for (const item of items) {
    const prevSum = amountByAssetClass.get(item.asset_class_name) || 0;
    amountByAssetClass.set(item.asset_class_name, prevSum + Number(item.amount));
  }

  const assetClassWeights = [...amountByAssetClass.entries()].map(
    ([assetClassName, amountSum]) => ({
      assetClassName,
      weightPercent: roundPercent((amountSum / totalAmount) * 100),
    })
  );

  const updateResult = await pool.query(
    `UPDATE holdings_snapshots
     SET asset_class_weights = $1, confirmed_at = now()
     WHERE id = $2
     RETURNING id, image_url, asset_class_weights, confirmed_at, created_at`,
    [JSON.stringify(assetClassWeights), snapshotId]
  );
  const updatedSnapshot = updateResult.rows[0];

  const itemRowsResult = await pool.query(
    `SELECT hi.id, hi.raw_name, hi.quantity, hi.amount, hi.asset_class_id,
            hi.classification_status, ac.name AS asset_class_name
     FROM holding_items hi
     JOIN asset_classes ac ON ac.id = hi.asset_class_id
     WHERE hi.holdings_snapshot_id = $1
     ORDER BY hi.id`,
    [snapshotId]
  );

  return toHoldingsSnapshotResponse(updatedSnapshot, itemRowsResult.rows);
}

module.exports = { upload, getLatest, getLatestConfirmed, updateItemAssetClass, confirmSnapshot };
