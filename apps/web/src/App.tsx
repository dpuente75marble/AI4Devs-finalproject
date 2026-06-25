import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import ProtectedRoute from './auth/ProtectedRoute'
import AppNav from './components/AppNav'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RefinementPage from './pages/RefinementPage'
import SettingsPage from './pages/SettingsPage'
import SprintAnalysisPage from './pages/SprintAnalysisPage'
import UserStoriesPage from './pages/UserStoriesPage'

function AuthenticatedLayout() {
  return (
    <ProtectedRoute>
      <AppNav />
      <Outlet />
    </ProtectedRoute>
  )
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AuthenticatedLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/user-stories" element={<UserStoriesPage />} />
            <Route path="/sprint-analysis" element={<SprintAnalysisPage />} />
            <Route path="/refinement" element={<RefinementPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
