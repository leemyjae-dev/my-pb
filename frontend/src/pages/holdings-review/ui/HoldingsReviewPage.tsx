import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHoldingsSnapshot } from '../../../entities/holdings-snapshot/model/useHoldingsSnapshot'
import type { AssetClass } from '../../../entities/holdings-snapshot/model/types'
import {
  useConfirmHoldingsSnapshot,
  useUpdateHoldingItem,
} from '../../../features/review-holdings-items/model/useReviewHoldingsItems'
import HoldingItemEditableRow from '../../../features/review-holdings-items/ui/HoldingItemEditableRow'
import Button from '../../../shared/ui/Button'
import { API_BASE_URL } from '../../../shared/api/httpClient'
import './HoldingsReviewPage.css'

// 와이어프레임 2.7(자산 항목 확인/보정 화면) 기준.
// 백엔드에 "자산군 마스터 목록" 조회 API가 없어(swagger.json 기준), 현재 스냅샷의 항목들에
// 이미 배정된 assetClass들을 모아 중복 제거한 목록을 선택지로 사용한다. 이 스냅샷에 등장하지
// 않는 자산군(예: 전 항목이 주식/채권뿐이면 '펀드'/'현금성자산')은 선택지에 나타나지 않는 한계가 있다.
function HoldingsReviewPage() {
  const navigate = useNavigate()
  const { data: snapshot, isLoading, isError, error } = useHoldingsSnapshot()
  const updateItemMutation = useUpdateHoldingItem()
  const confirmMutation = useConfirmHoldingsSnapshot()

  const assetClassOptions = useMemo<AssetClass[]>(() => {
    if (!snapshot) {
      return []
    }
    const byId = new Map<number, AssetClass>()
    snapshot.items.forEach((item) => byId.set(item.assetClass.id, item.assetClass))
    return Array.from(byId.values())
  }, [snapshot])

  if (isLoading) {
    return (
      <main>
        <h1>자산 항목 확인/보정</h1>
        <p>불러오는 중...</p>
      </main>
    )
  }

  if (isError) {
    return (
      <main>
        <h1>자산 항목 확인/보정</h1>
        <p role="alert">{error.message}</p>
      </main>
    )
  }

  if (!snapshot) {
    return (
      <main>
        <h1>자산 항목 확인/보정</h1>
        <p>업로드된 잔고 스크린샷이 없습니다.</p>
      </main>
    )
  }

  const hasPendingItems = snapshot.items.some(
    (item) => item.classificationStatus === '보정필요',
  )

  const handleAssetClassChange = (itemId: number, assetClassId: number) => {
    updateItemMutation.mutate({ snapshotId: snapshot.id, itemId, request: { assetClassId } })
  }

  const handleConfirm = () => {
    confirmMutation.mutate(snapshot.id, { onSuccess: () => navigate('/') })
  }

  return (
    <main className="holdings-review-page">
      <h1>자산 항목 확인/보정</h1>

      <div className="holdings-review-page__layout">
        <details className="holdings-review-page__image" open>
          <summary>원본 스크린샷</summary>
          <img src={`${API_BASE_URL}${snapshot.imageUrl}`} alt="업로드한 잔고 스크린샷" />
        </details>

        <div className="holdings-review-page__items">
          <table className="holdings-table">
            <thead>
              <tr>
                <th>종목명</th>
                <th>수량</th>
                <th>평가금액</th>
                <th>자산군</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.items.map((item) => (
                <HoldingItemEditableRow
                  key={item.id}
                  item={item}
                  assetClassOptions={assetClassOptions}
                  onAssetClassChange={handleAssetClassChange}
                  disabled={updateItemMutation.isPending}
                />
              ))}
            </tbody>
          </table>

          {updateItemMutation.isError && <p role="alert">{updateItemMutation.error.message}</p>}
          {hasPendingItems && <p role="alert">보정이 필요한 항목이 있습니다.</p>}
          {confirmMutation.isError && <p role="alert">{confirmMutation.error.message}</p>}

          <Button
            type="button"
            disabled={hasPendingItems || confirmMutation.isPending}
            onClick={handleConfirm}
          >
            확정
          </Button>
        </div>
      </div>
    </main>
  )
}

export default HoldingsReviewPage
