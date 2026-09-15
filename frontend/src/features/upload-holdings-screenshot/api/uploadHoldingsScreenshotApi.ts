import { httpClient } from '../../../shared/api/httpClient'
import type { HoldingsSnapshot } from '../../../entities/holdings-snapshot/model/types'

// POST /api/holdings — multipart/form-data, 필드명 image (FR-3.1~FR-3.3)
export function uploadHoldingsScreenshot(file: File) {
  const formData = new FormData()
  formData.append('image', file)
  return httpClient.post<HoldingsSnapshot>('/api/holdings', formData)
}
