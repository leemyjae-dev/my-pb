// 도메인 정의서 6절 기준 심리민감도 등급
export type NeuroticismSensitivityGrade = '보통' | '높음'

export interface NeuroticismTestResult {
  id: number
  answers: number[]
  totalScore: number
  sensitivityGrade: NeuroticismSensitivityGrade
  takenAt: string
}
