import { Link, useNavigate } from 'react-router-dom'
import LoginForm from '../../../features/login/ui/LoginForm'

function LoginPage() {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="card w-full max-w-sm space-y-6">
        <h1 className="text-center">로그인</h1>
        {/* 로그인 성공 시 대시보드("/")로 이동한다. */}
        <LoginForm onSuccess={() => navigate('/')} />
        <p className="text-center text-sm text-slate-600">
          아직 계정이 없으신가요? <Link to="/signup">회원가입으로 이동</Link>
        </p>
      </div>
    </main>
  )
}

export default LoginPage
