import { Link, useNavigate } from 'react-router-dom'
import LoginForm from '../../../features/login/ui/LoginForm'

function LoginPage() {
  const navigate = useNavigate()

  return (
    <main>
      <h1>로그인</h1>
      {/* 로그인 성공 시 대시보드("/")로 이동한다. */}
      <LoginForm onSuccess={() => navigate('/')} />
      <p>
        아직 계정이 없으신가요? <Link to="/signup">회원가입으로 이동</Link>
      </p>
    </main>
  )
}

export default LoginPage
