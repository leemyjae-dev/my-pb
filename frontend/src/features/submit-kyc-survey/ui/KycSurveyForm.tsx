import { useState, type FormEvent } from 'react'
import Button from '../../../shared/ui/Button'
import { useSubmitKycSurvey } from '../model/useSubmitKycSurvey'
import './KycSurveyForm.css'

// 도메인 정의서/PRD에는 KYC 설문의 실제 문항 원문이 없다. 임의로 문항을 창작하지 않고,
// 캡스톤 기획서 별첨1의 10개 평가 항목명을 문항 텍스트로 사용한다.
// (응답 형식은 문서에서 확정된 규칙대로 1~5점 단일 선택)
const QUESTIONS = [
  '연령대',
  '투자 가능 기간',
  '투자 경험',
  '금융상품에 대한 이해도',
  '소득 대비 투자자금 비중',
  '금융자산 대비 투자자금 비중',
  '손실 감내 수준',
  '투자 목적',
  '손실 경험 시 대응',
  '본인의 투자성향에 대한 자기인식',
] as const

const SCALE = [1, 2, 3, 4, 5]

interface KycSurveyFormProps {
  onSuccess: () => void
}

// 와이어프레임 2.4(투자자성향 KYC 설문 화면) 기준
function KycSurveyForm({ onSuccess }: KycSurveyFormProps) {
  const [answers, setAnswers] = useState<Array<number | null>>(
    Array(QUESTIONS.length).fill(null),
  )
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const submitMutation = useSubmitKycSurvey()

  const handleAnswerChange = (questionIndex: number, value: number) => {
    setAnswers((prev) =>
      prev.map((answer, index) => (index === questionIndex ? value : answer)),
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (answers.some((answer) => answer === null)) {
      setValidationMessage('모든 문항에 응답해주세요.')
      return
    }

    setValidationMessage(null)
    submitMutation.mutate({ answers: answers as number[] }, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit} className="kyc-survey-form">
      {QUESTIONS.map((question, questionIndex) => (
        <fieldset key={question} className="kyc-survey-form__question">
          <legend>
            문항 {questionIndex + 1}. {question}
          </legend>
          <div className="kyc-survey-form__scale">
            {SCALE.map((value) => (
              <label key={value}>
                <input
                  type="radio"
                  name={`question-${questionIndex}`}
                  value={value}
                  checked={answers[questionIndex] === value}
                  onChange={() => handleAnswerChange(questionIndex, value)}
                />
                {value}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      {validationMessage && <p role="alert">{validationMessage}</p>}
      {submitMutation.isError && <p role="alert">{submitMutation.error.message}</p>}

      <Button type="submit" disabled={submitMutation.isPending}>
        제출
      </Button>
    </form>
  )
}

export default KycSurveyForm
