import { useState, type FormEvent } from 'react'
import Button from '../../../shared/ui/Button'
import ErrorMessage from '../../../shared/ui/ErrorMessage'
import Input from '../../../shared/ui/Input'
import { useLogin } from '../model/useLogin'

interface LoginFormProps {
  onSuccess: () => void
}

// 와이어프레임 2.2(로그인 화면) 기준: 이메일/비밀번호 입력, 오류 메시지 영역, 제출 버튼
function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const loginMutation = useLogin()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    loginMutation.mutate({ email, password }, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="login-email">이메일</label>
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="login-password">비밀번호</label>
        <Input
          id="login-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>

      {loginMutation.isError && <ErrorMessage>{loginMutation.error.message}</ErrorMessage>}

      <Button type="submit" disabled={loginMutation.isPending} className="w-full">
        로그인
      </Button>
    </form>
  )
}

export default LoginForm
