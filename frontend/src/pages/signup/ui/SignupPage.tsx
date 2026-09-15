import { Link, useNavigate } from 'react-router-dom'
import SignupForm from '../../../features/signup/ui/SignupForm'

function SignupPage() {
  const navigate = useNavigate()

  return (
    <main>
      <h1>회원가입</h1>
      <SignupForm onSuccess={() => navigate('/login')} />
      <p>
        이미 계정이 있으신가요? <Link to="/login">로그인으로 이동</Link>
      </p>
    </main>
  )
}

export default SignupPage
