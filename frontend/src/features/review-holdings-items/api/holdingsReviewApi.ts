import { httpClient } from '../../../shared/api/httpClient'
import type {
  HoldingItem,
  HoldingsSnapshot,
} from '../../../entities/holdings-snapshot/model/types'

export interface UpdateHoldingItemRequest {
  assetClassId: number
}

// PATCH /api/holdings/{snapshotId}/items/{itemId} — 자산 항목의 자산군 보정 (FR-3.4)
export function updateHoldingItem(
  snapshotId: number,
  itemId: number,
  request: UpdateHoldingItemRequest,
) {
  return httpClient.patch<HoldingItem>(
    `/api/holdings/${snapshotId}/items/${itemId}`,
    request,
  )
}

// POST /api/holdings/{snapshotId}/confirm — 보정 확정, 자산군별 비중 계산 (FR-3.5)
export function confirmHoldingsSnapshot(snapshotId: number) {
  return httpClient.post<HoldingsSnapshot>(`/api/holdings/${snapshotId}/confirm`)
}
