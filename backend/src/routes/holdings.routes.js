// 잔고 스크린샷 업로드·보정·확정 라우트 (FR-3.1~FR-3.6)
// 이 라우터는 app.js에서 auth.middleware와 함께 등록된다(인증 필요).
// 요청/응답 필드명과 상태코드는 backend/swagger.json의 /api/holdings* 정의를 따른다.
const express = require('express');
const { upload } = require('../middleware/upload.middleware');
const holdingsService = require('../services/holdings.service');

const router = express.Router();

router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: '업로드할 이미지 파일(image)이 필요합니다.' });
  }

  const result = await holdingsService.upload(req.user.sub, req.file);
  res.status(201).json(result);
});

router.get('/latest', async (req, res) => {
  const result = await holdingsService.getLatest(req.user.sub);

  if (!result) {
    return res.status(404).json({ message: '아직 업로드한 스냅샷이 없습니다.' });
  }

  res.status(200).json(result);
});

function isNumericId(value) {
  return /^\d+$/.test(value);
}

router.patch('/:snapshotId/items/:itemId', async (req, res) => {
  const { snapshotId, itemId } = req.params;
  const { assetClassId } = req.body || {};

  if (!isNumericId(snapshotId) || !isNumericId(itemId)) {
    return res.status(400).json({ message: 'snapshotId와 itemId는 정수여야 합니다.' });
  }
  if (!Number.isInteger(assetClassId)) {
    return res.status(400).json({ message: 'assetClassId는 정수여야 합니다.' });
  }

  const result = await holdingsService.updateItemAssetClass(
    snapshotId,
    itemId,
    req.user.sub,
    assetClassId
  );
  res.status(200).json(result);
});

router.post('/:snapshotId/confirm', async (req, res) => {
  const { snapshotId } = req.params;

  if (!isNumericId(snapshotId)) {
    return res.status(400).json({ message: 'snapshotId는 정수여야 합니다.' });
  }

  const result = await holdingsService.confirmSnapshot(snapshotId, req.user.sub);
  res.status(200).json(result);
});

module.exports = router;
