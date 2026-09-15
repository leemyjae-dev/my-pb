import './FeedbackMessage.css'

interface FeedbackMessageProps {
  message: string
  psychologicalBurdenFlag: boolean
}

// 정합/괴리에 따른 피드백 메시지 표시. psychologicalBurdenFlag(심리민감도 '높음' + 괴리 결합)가
// true면 심리적 부담 안내를 별도 박스로 강조한다 (FR-4.3, FR-4.4).
function FeedbackMessage({ message, psychologicalBurdenFlag }: FeedbackMessageProps) {
  return (
    <div className={psychologicalBurdenFlag ? 'feedback-message feedback-message--warning' : 'feedback-message'}>
      <p>{message}</p>
      {psychologicalBurdenFlag && (
        <p role="alert">
          심리적으로 부담을 느끼기 쉬운 상태에서 자산배분 괴리가 함께 발견되었습니다. 신중하게 확인해주세요.
        </p>
      )}
    </div>
  )
}

export default FeedbackMessage
