import {
  Bot,
  BriefcaseBusiness,
  CircleDollarSign,
  Goal,
  Home,
  LogOut,
  Menu,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/Button.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { getInitials } from '../utils/formatters.js'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: Home },
  { label: 'Transactions', path: '/transactions', icon: WalletCards },
  { label: 'Goals', path: '/goals', icon: Goal },
  { label: 'Liabilities', path: '/liabilities', icon: BriefcaseBusiness },
  { label: 'AI Advisor', path: '/advisor', icon: Bot },
  { label: 'Profile', path: '/profile', icon: UserRound },
]

function Sidebar({ onNavigate }) {
  const { user } = useAuth()

  return (
    <aside className="flex h-full flex-col border-r border-white/10 bg-slate-950/70 px-4 py-5 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-300 text-slate-950">
          <CircleDollarSign size={24} />
        </div>
        <div>
          <p className="text-base font-semibold text-white">MyMoney</p>
          <p className="text-xs text-slate-400">Investment Guide</p>
        </div>
      </div>

      <nav className="mt-8 space-y-1">
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-teal-300 text-slate-950 shadow-lg shadow-teal-950/30'
                  : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 text-sm font-semibold text-white">
            {getInitials(user?.email)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user?.email || 'Investor'}</p>
            <p className="text-xs text-slate-400">JWT secured session</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default function AppLayout() {
  const [open, setOpen] = useState(false)
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const current = navItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-72 lg:block">
        <Sidebar />
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-slate-950/70" onClick={() => setOpen(false)} />
          <div className="relative h-full w-72 max-w-[85vw]">
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/72 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="secondary" className="h-10 w-10 px-0 lg:hidden" onClick={() => setOpen(true)}>
                <Menu size={18} />
              </Button>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Workspace</p>
                <p className="text-lg font-semibold text-white">{current}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-white">{user?.email || 'Investor'}</p>
                <p className="text-xs text-slate-500">Connected to FastAPI</p>
              </div>
              <Button variant="secondary" onClick={handleLogout}>
                <LogOut size={17} />
                <span className="hidden sm:inline">Logout</span>
              </Button>
              <Button variant="secondary" className="h-10 w-10 px-0 lg:hidden" onClick={() => setOpen(false)}>
                <X size={18} />
              </Button>
            </div>
          </div>
        </header>
        <main className="soft-grid min-h-[calc(100vh-65px)] px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl animate-rise">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

