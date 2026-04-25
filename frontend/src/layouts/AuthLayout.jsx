import { BarChart3, Landmark, ShieldCheck, Sparkles } from 'lucide-react'
import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <main className="soft-grid min-h-screen overflow-hidden px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden lg:block">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-slate-300">
            <ShieldCheck size={16} className="text-teal-300" />
            Personal Investment Guide
          </div>
          <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-white">
            Private finance command center for smarter investing.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-400">
            Track cash flow, goals, liabilities, and AI-backed allocation guidance in one focused workspace.
          </p>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {[
              ['Live net worth', BarChart3],
              ['Goal planning', Landmark],
              ['AI signals', Sparkles],
            ].map(([label, Icon]) => (
              <div key={label} className="glass rounded-xl p-4">
                <Icon className="text-teal-300" size={22} />
                <p className="mt-4 text-sm font-medium text-slate-200">{label}</p>
              </div>
            ))}
          </div>
        </section>
        <Outlet />
      </div>
    </main>
  )
}

