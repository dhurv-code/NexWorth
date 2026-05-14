import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  Bot,
  CircleDollarSign,
  PiggyBank,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import EmptyState from '../components/EmptyState.jsx'
import MetricCard from '../components/MetricCard.jsx'
import PageHeader from '../components/PageHeader.jsx'
import { advisorApi } from '../services/api.js'
import { currency } from '../utils/formatters.js'

const colors = ['#2dd4bf', '#60a5fa', '#f59e0b', '#fb7185', '#a78bfa', '#34d399']

const toNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export default function AiAdvisor() {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPlan = async () => {
    setLoading(true)
    try {
      const { data } = await advisorApi.plan()
      setPlan(data)
      setError('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to generate plan. Complete your profile and add transactions first.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadPlan = async () => {
      await fetchPlan()
    }

    loadPlan()
  }, [])

  const summary = useMemo(() => {
    const income = toNumber(plan?.monthly_income)
    const expense = toNumber(plan?.monthly_expense)
    const assets = toNumber(plan?.total_assets)
    const liabilities = toNumber(plan?.total_liabilities)
    const surplus = toNumber(plan?.monthly_surplus)
    return {
      income,
      expense,
      assets,
      liabilities,
      surplus,
      netWorth: assets - liabilities,
    }
  }, [plan])

  const recommendations = useMemo(() => (Array.isArray(plan?.recommendations) ? plan.recommendations : []), [plan])
  const actions = useMemo(() => (Array.isArray(plan?.actions) ? plan.actions : []), [plan])

  const flowData = useMemo(
    () => [
      { name: 'Income', value: summary.income },
      { name: 'Expense', value: summary.expense },
      { name: 'Surplus', value: Math.max(0, summary.surplus) },
    ],
    [summary.expense, summary.income, summary.surplus],
  )

  const networthMix = useMemo(
    () =>
      [
        { name: 'Assets', value: Math.max(0, summary.assets) },
        { name: 'Liabilities', value: Math.max(0, summary.liabilities) },
      ].filter((item) => item.value > 0),
    [summary.assets, summary.liabilities],
  )

  const recommendationMix = useMemo(
    () =>
      recommendations
        .map((item) => ({
          name: item.type || 'Recommendation',
          value: Math.max(0, toNumber(item.amount)),
        }))
        .filter((item) => item.value > 0),
    [recommendations],
  )

  const emergencyReady = plan?.emergency_fund_ready
  const riskLevel = plan?.risk_level || 'unavailable'
  const goalYears = plan?.goal_years ? `${plan.goal_years} yrs` : 'Not set'

  return (
    <>
      <PageHeader eyebrow="AI portfolio guidance" title="AI Advisor">
        <Button onClick={fetchPlan} disabled={loading}>
          <RefreshCw size={17} className={loading ? 'animate-spin' : ''} /> Refresh plan
        </Button>
      </PageHeader>

      {error ? <div className="mb-6 rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">{error}</div> : null}

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.2),transparent_40%),linear-gradient(130deg,rgba(15,23,42,0.9),rgba(2,6,23,0.9))] p-5 md:p-6">
        <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-teal-400/15 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-52 w-52 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-teal-200">Live strategy engine</p>
            <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">Your monthly money action plan</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Personalised from your cashflow, liabilities, assets, and risk profile.
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
              emergencyReady === true
                ? 'border-emerald-300/30 bg-emerald-300/12 text-emerald-100'
                : 'border-amber-300/30 bg-amber-300/12 text-amber-100'
            }`}
          >
            {emergencyReady === true ? <BadgeCheck size={16} /> : <ShieldAlert size={16} />}
            Emergency fund {emergencyReady === true ? 'ready' : 'needs attention'}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={ArrowUpRight} label="Monthly income" value={currency(summary.income)} tone="teal" detail="Incoming cashflow" />
        <MetricCard icon={ArrowDownRight} label="Monthly expense" value={currency(summary.expense)} tone="rose" detail="Recurring outflow" />
        <MetricCard icon={PiggyBank} label="Monthly surplus" value={currency(summary.surplus)} tone="blue" detail="Available for goals" />
        <MetricCard
          icon={Wallet}
          label="Net worth"
          value={currency(summary.netWorth)}
          tone="amber"
          detail={`${currency(summary.assets)} assets vs ${currency(summary.liabilities)} liabilities`}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Cashflow overview</h2>
              <p className="text-sm text-slate-400">Income, expense, and investable surplus this month</p>
            </div>
            <CircleDollarSign className="text-teal-200" size={22} />
          </div>
          <div className="mt-4 h-80">
            {flowData.some((item) => item.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={flowData}>
                  <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                  <XAxis dataKey="name" stroke="#cbd5e1" tickLine={false} axisLine={false} />
                  <YAxis stroke="#cbd5e1" tickLine={false} axisLine={false} tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                  <Tooltip
                    contentStyle={{
                      background: '#0b1220',
                      border: '1px solid rgba(255,255,255,.12)',
                      borderRadius: 10,
                      color: '#f8fafc',
                    }}
                    labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
                    itemStyle={{ color: '#f8fafc' }}
                    formatter={(value) => currency(value)}
                  />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {flowData.map((entry, index) => (
                      <Cell key={entry.name} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No cashflow data yet" text="Add income and expense transactions to unlock cashflow charts." />
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-white">Profile snapshot</h2>
          <p className="text-sm text-slate-400">Key planning attributes used by your advisor</p>
          <div className="mt-5 grid gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Risk appetite</p>
              <p className="mt-2 text-lg font-semibold capitalize text-white">{riskLevel}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Goal horizon</p>
              <p className="mt-2 text-lg font-semibold text-white">{goalYears}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Advisor mode</p>
              <p className="mt-2 text-lg font-semibold text-white">{loading ? 'Recalculating' : 'Live'}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <h2 className="text-xl font-semibold text-white">Recommendation mix</h2>
          <p className="text-sm text-slate-400">How your recommended monthly investment is split</p>
          <div className="mt-4 h-80">
            {recommendationMix.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={recommendationMix} dataKey="value" nameKey="name" innerRadius={68} outerRadius={108} paddingAngle={4}>
                    {recommendationMix.map((entry, index) => (
                      <Cell key={entry.name} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                  <Tooltip
                    contentStyle={{
                      background: '#0b1220',
                      border: '1px solid rgba(255,255,255,.12)',
                      borderRadius: 10,
                      color: '#f8fafc',
                    }}
                    labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
                    itemStyle={{ color: '#f8fafc' }}
                    formatter={(value) => currency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No allocations yet" text="Increase monthly surplus to generate recommendation mix." />
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-white">Net worth structure</h2>
          <p className="text-sm text-slate-400">Balance between total assets and liabilities</p>
          <div className="mt-4 h-80">
            {networthMix.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={networthMix} dataKey="value" nameKey="name" innerRadius={70} outerRadius={108} paddingAngle={4}>
                    {networthMix.map((entry, index) => (
                      <Cell key={entry.name} fill={index === 0 ? '#22c55e' : '#f97316'} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                  <Tooltip
                    contentStyle={{
                      background: '#0b1220',
                      border: '1px solid rgba(255,255,255,.12)',
                      borderRadius: 10,
                      color: '#f8fafc',
                    }}
                    labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
                    itemStyle={{ color: '#f8fafc' }}
                    formatter={(value) => currency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No net worth data yet" text="Add assets and liabilities to unlock net worth insights." />
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="mb-4 flex items-center gap-2">
          <Bot className="text-teal-200" size={20} />
          <h2 className="text-xl font-semibold text-white">AI recommendations</h2>
        </div>
        {recommendations.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recommendations.map((item, index) => (
              <article
                key={`${item.type}-${index}`}
                className="rounded-xl border border-white/10 bg-[linear-gradient(145deg,rgba(30,41,59,0.55),rgba(15,23,42,0.35))] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Recommendation</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">{item.type || 'Allocation'}</h3>
                  </div>
                  <span className="rounded-full border border-teal-300/30 bg-teal-300/10 px-3 py-1 text-xs font-semibold text-teal-100">
                    {currency(item.amount)}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-300">{item.reason || 'Generated by advisor engine.'}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.15em] text-slate-400">Where</p>
                <p className="mt-1 text-sm text-slate-200">{item.where || 'Portfolio allocation bucket'}</p>
              </article>
            ))}
          </div>
        ) : actions.length ? (
          <div className="rounded-xl border border-amber-300/20 bg-amber-300/10 p-5">
            <div className="flex items-center gap-2 text-amber-100">
              <Sparkles size={18} />
              <p className="text-sm font-semibold">{plan?.status || 'No monthly investable surplus'}</p>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-amber-50">
              {actions.map((item, index) => (
                <li key={`${item}-${index}`} className="rounded-md bg-black/20 px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <EmptyState title="No recommendations yet" text="Refresh after completing profile, assets, liabilities, and transactions." />
        )}
      </Card>
    </>
  )
}
