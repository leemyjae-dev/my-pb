import type { AssetClassComparison } from '../model/types'
import './AssetClassComparisonTable.css'

interface AssetClassComparisonTableProps {
  comparisons: AssetClassComparison[]
}

// 와이어프레임 2.8(종합 진단 결과 화면)의 자산군별 비교 표. 데스크톱=표, 모바일=카드형(반응형 표 CSS).
function AssetClassComparisonTable({ comparisons }: AssetClassComparisonTableProps) {
  return (
    <table className="comparison-table">
      <thead>
        <tr>
          <th>자산군</th>
          <th>성향기준 비중</th>
          <th>실보유 비중</th>
          <th>판정</th>
        </tr>
      </thead>
      <tbody>
        {comparisons.map((comparison) => (
          <tr key={comparison.assetClassName}>
            <td data-label="자산군">{comparison.assetClassName}</td>
            <td data-label="성향기준 비중">{comparison.targetWeightPercent}%</td>
            <td data-label="실보유 비중">{comparison.actualWeightPercent}%</td>
            <td data-label="판정">{comparison.judgment}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default AssetClassComparisonTable
