// 도메인 정의서 6절 기준 5단계 투자자성향 등급
export type KycRiskGrade = '안정형' | '안정추구형' | '위험중립형' | '적극투자형' | '공격투자형'

export interface KycProfileResult {
  id: number
  answers: number[]
  totalScore: number
  riskGrade: KycRiskGrade
  takenAt: string
}
