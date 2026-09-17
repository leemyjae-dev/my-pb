import { useState, type FormEvent } from 'react'
import Button from '../../../shared/ui/Button'
import ErrorMessage from '../../../shared/ui/ErrorMessage'
import { useSubmitNeuroticismTest } from '../model/useSubmitNeuroticismTest'
import './NeuroticismTestForm.css'

// 도메인 정의서에 명시된 IPIP 신경성 10문항 원문. 역채점 여부는 서버가 처리하므로 화면에는 노출하지 않는다.
const QUESTIONS = [
  '나는 스트레스를 쉽게 받는 편이다',
  '나는 대체로 느긋하고 편안한 편이다',
  '나는 여러 가지 일들에 대해 걱정하는 편이다',
  '나는 울적함(우울감)을 거의 느끼지 않는다',
  '나는 사소한 일에도 쉽게 마음이 흐트러진다',
  '나는 쉽게 속상해하는 편이다',
  '나는 기분이 자주 바뀌는 편이다',
  '나는 기분 기복이 심한 편이다',
  '나는 쉽게 짜증을 내는 편이다',
  '나는 자주 울적함(우울감)을 느낀다',
] as const

const SCALE = [1, 2, 3, 4, 5]

interface NeuroticismTestFormProps {
  onSuccess: () => void
}

// 와이어프레임 2.5(IPIP 신경성 검사 화면) 기준. KYC 설문 폼(KycSurveyForm)과 동일한 UI 패턴을 사용한다.
function NeuroticismTestForm({ onSuccess }: NeuroticismTestFormProps) {
  const [answers, setAnswers] = useState<Array<number | null>>(
    Array(QUESTIONS.length).fill(null),
  )
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const submitMutation = useSubmitNeuroticismTest()

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
    <form onSubmit={handleSubmit} className="neuroticism-test-form">
      {QUESTIONS.map((question, questionIndex) => (
        <fieldset key={question} className="neuroticism-test-form__question">
          <legend>
            문항 {questionIndex + 1}. {question}
          </legend>
          <div className="neuroticism-test-form__scale">
            <span className="text-xs text-slate-500">전혀 그렇지 않다</span>
            {SCALE.map((value) => (
              <label key={value} className="inline-flex items-center gap-1 text-sm text-slate-700">
                <input
                  type="radio"
                  name={`question-${questionIndex}`}
                  value={value}
                  checked={answers[questionIndex] === value}
                  onChange={() => handleAnswerChange(questionIndex, value)}
                  className="accent-primary-600"
                />
                {value}
              </label>
            ))}
            <span className="text-xs text-slate-500">매우 그렇다</span>
          </div>
        </fieldset>
      ))}

      {validationMessage && <ErrorMessage>{validationMessage}</ErrorMessage>}
      {submitMutation.isError && <ErrorMessage>{submitMutation.error.message}</ErrorMessage>}

      <Button type="submit" disabled={submitMutation.isPending} className="w-full sm:w-auto">
        제출
      </Button>
    </form>
  )
}

export default NeuroticismTestForm
