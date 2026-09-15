import { useState, type FormEvent } from 'react'
import Button from '../../../shared/ui/Button'
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

      {loginMutation.isError && <p role="alert">{loginMutation.error.message}</p>}

      <Button type="submit" disabled={loginMutation.isPending}>
        로그인
      </Button>
    </form>
  )
}

export default LoginForm
