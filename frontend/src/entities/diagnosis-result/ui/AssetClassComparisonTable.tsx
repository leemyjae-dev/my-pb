import type { AssetClassComparison, ComparisonJudgment } from '../model/types'
import './AssetClassComparisonTable.css'

interface AssetClassComparisonTableProps {
  comparisons: AssetClassComparison[]
}

// 정합=긍정(초록), 괴리=주의(호박색)로 판정 결과가 한눈에 들어오게 한다.
const JUDGMENT_ROW_CLASSES: Record<ComparisonJudgment, string> = {
  정합: 'bg-green-50/60',
  '괴리(초과)': 'bg-amber-50/60',
  '괴리(과소)': 'bg-amber-50/60',
}

const JUDGMENT_BADGE_CLASSES: Record<ComparisonJudgment, string> = {
  정합: 'bg-green-100 text-green-800',
  '괴리(초과)': 'bg-amber-100 text-amber-800',
  '괴리(과소)': 'bg-amber-100 text-amber-800',
}

// 와이어프레임 2.8(종합 진단 결과 화면)의 자산군별 비교 표. 데스크톱=표, 모바일=카드형(반응형 표 CSS).
function AssetClassComparisonTable({ comparisons }: AssetClassComparisonTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
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
            <tr key={comparison.assetClassName} className={JUDGMENT_ROW_CLASSES[comparison.judgment]}>
              <td data-label="자산군" className="font-medium">
                {comparison.assetClassName}
              </td>
              <td data-label="성향기준 비중">{comparison.targetWeightPercent}%</td>
              <td data-label="실보유 비중">{comparison.actualWeightPercent}%</td>
              <td data-label="판정">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${JUDGMENT_BADGE_CLASSES[comparison.judgment]}`}
                >
                  {comparison.judgment}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AssetClassComparisonTable
