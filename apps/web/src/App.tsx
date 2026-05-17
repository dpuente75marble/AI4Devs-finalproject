import { Navigate, Route, Routes } from 'react-router-dom'
import AppNav from './components/AppNav'
import DashboardPage from './pages/DashboardPage'
import SettingsPage from './pages/SettingsPage'
import UserStoriesPage from './pages/UserStoriesPage'

function App() {
  return (
    <div className="min-h-screen">
      <AppNav />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/user-stories" element={<UserStoriesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default App
