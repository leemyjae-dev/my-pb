export type MissingInput = 'kyc' | 'neuroticism' | 'holdings'

// 도메인 정의서 6절 기준 5단계 투자자성향 등급 / 심리민감도 등급
export type RiskGrade = '안정형' | '안정추구형' | '위험중립형' | '적극투자형' | '공격투자형'
export type SensitivityGrade = '보통' | '높음'
export type ComparisonJudgment = '정합' | '괴리(초과)' | '괴리(과소)'

export interface AssetClassComparison {
  assetClassName: string
  targetWeightPercent: number
  actualWeightPercent: number
  judgment: ComparisonJudgment
}

export interface RiskDiagnosisResult {
  id: number
  kycProfileResultId: number
  neuroticismTestResultId: number
  holdingsSnapshotId: number
  riskGrade: RiskGrade
  sensitivityGrade: SensitivityGrade
  comparisonResult: AssetClassComparison[]
  psychologicalBurdenFlag: boolean
  feedbackMessage: string
  diagnosedAt: string
}

export interface DiagnosisIncompleteResponse {
  complete: false
  missingInputs: MissingInput[]
}

// POST /api/diagnosis는 200(입력 누락)/201(완료) 두 상태코드로 응답이 갈리므로,
// api 계층에서 이 판별 유니온 형태로 정규화해 넘긴다.
export type DiagnosisResult =
  | { complete: true; result: RiskDiagnosisResult }
  | { complete: false; missingInputs: MissingInput[] }
