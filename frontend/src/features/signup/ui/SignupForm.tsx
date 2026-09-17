import { useState, type FormEvent } from 'react'
import Button from '../../../shared/ui/Button'
import ErrorMessage from '../../../shared/ui/ErrorMessage'
import Input from '../../../shared/ui/Input'
import { useSignup } from '../model/useSignup'

interface SignupFormProps {
  onSuccess: () => void
}

// 와이어프레임 2.1(회원가입 화면) 기준: 이메일/비밀번호 입력, 오류 메시지 영역, 제출 버튼
function SignupForm({ onSuccess }: SignupFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const signupMutation = useSignup()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    signupMutation.mutate({ email, password }, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="signup-email">이메일</label>
        <Input
          id="signup-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="signup-password">비밀번호</label>
        <Input
          id="signup-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>

      {signupMutation.isError && <ErrorMessage>{signupMutation.error.message}</ErrorMessage>}

      <Button type="submit" disabled={signupMutation.isPending} className="w-full">
        회원가입
      </Button>
    </form>
  )
}

export default SignupForm
