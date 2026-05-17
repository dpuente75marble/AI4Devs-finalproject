import { NavLink } from 'react-router-dom'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-gray-900 text-white'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  ].join(' ')

export default function AppNav() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold tracking-tight text-gray-900">
          DeliveryOps AI
        </p>
        <nav className="flex flex-wrap gap-1">
          <NavLink to="/dashboard" className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/user-stories" className={navLinkClass}>
            User Stories
          </NavLink>
          <NavLink to="/settings" className={navLinkClass}>
            Settings
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
