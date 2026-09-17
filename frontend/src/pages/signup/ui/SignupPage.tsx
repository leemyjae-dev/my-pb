import { Link, useNavigate } from 'react-router-dom'
import SignupForm from '../../../features/signup/ui/SignupForm'

function SignupPage() {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="card w-full max-w-sm space-y-6">
        <h1 className="text-center">회원가입</h1>
        <SignupForm onSuccess={() => navigate('/login')} />
        <p className="text-center text-sm text-slate-600">
          이미 계정이 있으신가요? <Link to="/login">로그인으로 이동</Link>
        </p>
      </div>
    </main>
  )
}

export default SignupPage
