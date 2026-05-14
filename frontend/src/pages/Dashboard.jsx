import { Activity, Landmark, PiggyBank, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Card from '../components/Card.jsx'
import EmptyState from '../components/EmptyState.jsx'
import MetricCard from '../components/MetricCard.jsx'
import PageHeader from '../components/PageHeader.jsx'
import { goalsApi, liabilitiesApi, loanPaymentsApi, transactionsApi } from '../services/api.js'
import { currency } from '../utils/formatters.js'

const colors = ['#2dd4bf', '#60a5fa', '#f59e0b', '#fb7185', '#a78bfa']

export default function Dashboard() {
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 })
  const [networth, setNetworth] = useState({ cash_balance: 0, total_liabilities: 0, net_worth: 0 })
  const [analytics, setAnalytics] = useState({ category_expense: {}, monthly_flow: {} })
  const [goals, setGoals] = useState([])
  const [liabilities, setLiabilities] = useState([])
  const [safeBalance, setSafeBalance] = useState({ current_balance: 0, upcoming_emi: 0, safe_to_spend: 0 })

  const loadDashboard = () => {
    Promise.all([
      transactionsApi.summary(),
      transactionsApi.networth(),
      transactionsApi.analytics(),
      goalsApi.all(),
      liabilitiesApi.all(),
      loanPaymentsApi.safeBalance(),
    ]).then(([summaryRes, networthRes, analyticsRes, goalsRes, liabilitiesRes, safeBalanceRes]) => {
      setSummary(summaryRes.data)
      setNetworth(networthRes.data)
      setAnalytics(analyticsRes.data)
      setGoals(goalsRes.data)
      setLiabilities(liabilitiesRes.data)
      setSafeBalance(safeBalanceRes.data)
    }).catch(() => {})
  }

  useEffect(() => {
    loadDashboard()

    const refreshHandler = () => loadDashboard()
    window.addEventListener('financial-data-updated', refreshHandler)
    return () => window.removeEventListener('financial-data-updated', refreshHandler)
  }, [])

  const monthlyFlow = useMemo(
    () => Object.entries(analytics.monthly_flow || {}).map(([month, amount]) => ({ month, amount })),
    [analytics],
  )

  const categories = useMemo(
    () => Object.entries(analytics.category_expense || {}).map(([name, value]) => ({ name, value })),
    [analytics],
  )

  const goalTarget = goals.reduce((sum, goal) => sum + Number(goal.target_amount || goal.amount || 0), 0)
  const debt = liabilities.reduce((sum, item) => sum + Number(item.remaining_amount || item.amount || 0), 0)

  return (
    <>
      <PageHeader eyebrow="Command center" title="Portfolio dashboard" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={TrendingUp} label="Income" value={currency(summary.income)} tone="teal" detail="Total recorded inflow" />
        <MetricCard icon={TrendingDown} label="Expenses" value={currency(summary.expense)} tone="rose" detail="Total recorded outflow" />
        <MetricCard icon={Wallet} label="Balance" value={currency(summary.balance)} tone="blue" detail="Available cash estimate" />
        <MetricCard icon={PiggyBank} label="Net worth" value={currency(networth.net_worth)} tone="amber" detail="Cash minus liabilities" />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard icon={Wallet} label="Safe balance" value={currency(safeBalance.current_balance)} tone="blue" detail="Available cash after obligations" />
        <MetricCard icon={TrendingDown} label="Upcoming EMI" value={currency(safeBalance.upcoming_emi)} tone="rose" detail="Next due payment" />
        <MetricCard icon={PiggyBank} label="Safe to spend" value={currency(safeBalance.safe_to_spend)} tone="teal" detail="Cash available after EMI" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Monthly flow</h2>
              <p className="text-sm text-slate-400">Transaction movement by month</p>
            </div>
            <Activity className="text-teal-300" size={22} />
          </div>
          <div className="h-80">
            {monthlyFlow.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyFlow}>
                  <defs>
                    <linearGradient id="flow" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8 }} formatter={(v) => currency(v)} />
                  <Area type="monotone" dataKey="amount" stroke="#2dd4bf" strokeWidth={3} fill="url(#flow)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No flow data yet" text="Add income and expenses to see monthly movement." />
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-white">Expense mix</h2>
          <p className="text-sm text-slate-400">Category concentration</p>
          <div className="mt-4 h-80">
            {categories.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categories} dataKey="value" nameKey="name" innerRadius={70} outerRadius={105} paddingAngle={4}>
                    {categories.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8 }} formatter={(v) => currency(v)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No categories yet" text="Expenses will appear here after transactions are added." />
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-semibold text-white">Goal capital</h2>
          <p className="text-sm text-slate-400">Total target across active goals</p>
          <div className="mt-6 flex items-center gap-4">
            <Landmark className="text-blue-300" size={32} />
            <p className="text-3xl font-semibold text-white">{currency(goalTarget)}</p>
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold text-white">Liability exposure</h2>
          <p className="text-sm text-slate-400">Tracked obligations and debt</p>
          <div className="mt-6 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ name: 'Backend networth', amount: networth.total_liabilities }, { name: 'Listed debt', amount: debt }]}>
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} fill="#fb7185" />
                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8 }} formatter={(v) => currency(v)} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </>
  )
}

