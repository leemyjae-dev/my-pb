import { Route, Routes } from 'react-router-dom'
import DashboardPage from '../pages/dashboard/ui/DashboardPage'
import DiagnosisResultPage from '../pages/diagnosis-result/ui/DiagnosisResultPage'
import SignupPage from '../pages/signup/ui/SignupPage'
import LoginPage from '../pages/login/ui/LoginPage'
import KycSurveyPage from '../pages/kyc-survey/ui/KycSurveyPage'
import NeuroticismTestPage from '../pages/neuroticism-test/ui/NeuroticismTestPage'
import HoldingsUploadPage from '../pages/holdings-upload/ui/HoldingsUploadPage'
import HoldingsReviewPage from '../pages/holdings-review/ui/HoldingsReviewPage'
import ProtectedRoute from './ProtectedRoute'

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/kyc-survey"
        element={
          <ProtectedRoute>
            <KycSurveyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/neuroticism-test"
        element={
          <ProtectedRoute>
            <NeuroticismTestPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/holdings-upload"
        element={
          <ProtectedRoute>
            <HoldingsUploadPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/holdings-review"
        element={
          <ProtectedRoute>
            <HoldingsReviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/diagnosis-result"
        element={
          <ProtectedRoute>
            <DiagnosisResultPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default AppRoutes
