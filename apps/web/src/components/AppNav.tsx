import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-gray-900 text-white'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  ].join(' ')

export default function AppNav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold tracking-tight text-gray-900">
          DeliveryOps AI
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <nav className="flex flex-wrap gap-1">
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/user-stories" className={navLinkClass}>
              User Stories
            </NavLink>
            <NavLink to="/sprint-analysis" className={navLinkClass}>
              Sprint Analysis
            </NavLink>
            <NavLink to="/refinement" className={navLinkClass}>
              Refinement
            </NavLink>
            <NavLink to="/settings" className={navLinkClass}>
              Settings
            </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <p className="text-sm text-gray-600">
                {user.name}{' '}
                <span className="text-gray-400">({user.email})</span>
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
