import { useMutation, useQueryClient } from '@tanstack/react-query'
import { HOLDINGS_SNAPSHOT_QUERY_KEY } from '../../../entities/holdings-snapshot/model/useHoldingsSnapshot'
import type { HoldingsSnapshot } from '../../../entities/holdings-snapshot/model/types'
import {
  confirmHoldingsSnapshot,
  updateHoldingItem,
  type UpdateHoldingItemRequest,
} from '../api/holdingsReviewApi'

export function useUpdateHoldingItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      snapshotId,
      itemId,
      request,
    }: {
      snapshotId: number
      itemId: number
      request: UpdateHoldingItemRequest
    }) => updateHoldingItem(snapshotId, itemId, request),
    onSuccess: (updatedItem) => {
      queryClient.setQueryData<HoldingsSnapshot | null>(HOLDINGS_SNAPSHOT_QUERY_KEY, (prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((item) =>
                item.id === updatedItem.id ? updatedItem : item,
              ),
            }
          : prev,
      )
    },
  })
}

export function useConfirmHoldingsSnapshot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (snapshotId: number) => confirmHoldingsSnapshot(snapshotId),
    onSuccess: (data) => {
      queryClient.setQueryData(HOLDINGS_SNAPSHOT_QUERY_KEY, data)
    },
  })
}
