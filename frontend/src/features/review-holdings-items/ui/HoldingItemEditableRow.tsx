import type { AssetClass, HoldingItem } from '../../../entities/holdings-snapshot/model/types'

interface HoldingItemEditableRowProps {
  item: HoldingItem
  assetClassOptions: AssetClass[]
  onAssetClassChange: (itemId: number, assetClassId: number) => void
  disabled: boolean
}

// 와이어프레임 2.7(자산 항목 확인/보정 화면)의 표 한 행. 반응형은 부모(HoldingsReviewPage)의
// 표 CSS가 담당한다(데스크톱=표, 모바일=카드형으로 접힘).
function HoldingItemEditableRow({
  item,
  assetClassOptions,
  onAssetClassChange,
  disabled,
}: HoldingItemEditableRowProps) {
  return (
    <tr>
      <td data-label="종목명">{item.rawName}</td>
      <td data-label="수량">{item.quantity ?? '-'}</td>
      <td data-label="평가금액">{item.amount.toLocaleString()}</td>
      <td data-label="자산군">
        <select
          value={item.assetClass.id}
          disabled={disabled}
          onChange={(event) => onAssetClassChange(item.id, Number(event.target.value))}
        >
          {assetClassOptions.map((assetClass) => (
            <option key={assetClass.id} value={assetClass.id}>
              {assetClass.name}
            </option>
          ))}
        </select>
      </td>
      <td data-label="상태">{item.classificationStatus}</td>
    </tr>
  )
}

export default HoldingItemEditableRow
