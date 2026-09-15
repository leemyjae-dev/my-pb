import { useState, type FormEvent } from 'react'
import Button from '../../../shared/ui/Button'
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
    <form onSubmit={handleSubmit}>
      <label>
        이메일
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <label>
        비밀번호
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>

      {signupMutation.isError && <p role="alert">{signupMutation.error.message}</p>}

      <Button type="submit" disabled={signupMutation.isPending}>
        회원가입
      </Button>
    </form>
  )
}

export default SignupForm
