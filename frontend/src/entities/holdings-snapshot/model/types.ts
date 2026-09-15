export interface AssetClass {
  id: number
  name: string
}

// 도메인 정의서 3절: 자동분류확정/보정필요/보정완료
export type HoldingItemClassificationStatus = '자동분류확정' | '보정필요' | '보정완료'

export interface HoldingItem {
  id: number
  rawName: string
  quantity: number | null
  amount: number
  assetClass: AssetClass
  classificationStatus: HoldingItemClassificationStatus
}

export interface AssetClassWeight {
  assetClassName: string
  weightPercent: number
}

export interface HoldingsSnapshot {
  id: number
  imageUrl: string
  items: HoldingItem[]
  assetClassWeights: AssetClassWeight[] | null
  confirmedAt: string | null
  createdAt: string
}
