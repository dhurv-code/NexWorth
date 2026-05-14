import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Field from '../components/Field.jsx'
import PageHeader from '../components/PageHeader.jsx'
import SelectField from '../components/SelectField.jsx'
import { liabilitiesApi, loanPaymentsApi } from '../services/api.js'
import { currency } from '../utils/formatters.js'

const initialForm = { name: '', amount: '', emi_amount: '', interest_rate: '', type: 'loan' }

export default function Liabilities() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(initialForm)
  const [activeLoanId, setActiveLoanId] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [loadingPayment, setLoadingPayment] = useState(false)
  const [error, setError] = useState('')
  const [openHistory, setOpenHistory] = useState({})
  const [historyItems, setHistoryItems] = useState({})
  const [loadingHistory, setLoadingHistory] = useState({})

  const load = () => liabilitiesApi.all().then((res) => setItems(res.data)).catch(() => {})

  useEffect(() => {
    load()
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    await liabilitiesApi.add({
      ...form,
      principal_amount: Number(form.amount),
      remaining_amount: Number(form.amount),
      paid_amount: 0,
      emi_amount: Number(form.emi_amount || form.amount || 0),
      interest_rate: Number(form.interest_rate || 0),
    })
    setForm(initialForm)
    load()
  }

  const remove = async (id) => {
    await liabilitiesApi.remove(id)
    load()
  }

  const pay = async (loanId) => {
    setError('')
    if (!paymentAmount) {
      setError('Please enter a payment amount.')
      return
    }

    setLoadingPayment(true)
    try {
      await loanPaymentsApi.pay(loanId, { amount: Number(paymentAmount) })
      setActiveLoanId(null)
      setPaymentAmount('')
      load()
      window.dispatchEvent(new CustomEvent('financial-data-updated'))
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to process payment.')
    } finally {
      setLoadingPayment(false)
    }
  }

  const loadHistory = async (loanId) => {
    setLoadingHistory((prev) => ({ ...prev, [loanId]: true }))
    try {
      const response = await loanPaymentsApi.history(loanId)
      setHistoryItems((prev) => ({ ...prev, [loanId]: response.data || [] }))
    } catch {
      setHistoryItems((prev) => ({ ...prev, [loanId]: [] }))
    } finally {
      setLoadingHistory((prev) => ({ ...prev, [loanId]: false }))
    }
  }

  const toggleHistory = (loanId) => {
    const isOpen = !!openHistory[loanId]
    setOpenHistory((prev) => ({ ...prev, [loanId]: !prev[loanId] }))
    if (!isOpen && !historyItems[loanId]) {
      loadHistory(loanId)
    }
  }

  return (
    <>
      <PageHeader eyebrow="Debt strategy" title="Liabilities">
        <Button form="liability-form"><Plus size={17} /> Add liability</Button>
      </PageHeader>
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.4fr]">
        <Card>
          <h2 className="text-xl font-semibold text-white">New liability</h2>
          <form id="liability-form" onSubmit={submit} className="mt-5 grid gap-4">
            <Field label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Home loan" required />
            <SelectField label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="loan">Loan</option>
              <option value="credit">Credit</option>
              <option value="emi">EMI</option>
            </SelectField>
            <Field label="Principal amount" type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            <Field label="Monthly EMI" type="number" min="0" value={form.emi_amount} onChange={(e) => setForm({ ...form, emi_amount: e.target.value })} />
            <Field label="Interest rate" type="number" min="0" step="0.1" value={form.interest_rate} onChange={(e) => setForm({ ...form, interest_rate: e.target.value })} />
            <Button type="submit">Save liability</Button>
          </form>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold text-white">Debt book</h2>
          <div className="mt-5 grid gap-3">
            {items.length ? items.map((item) => {
              const principal = Number(item.principal_amount || item.amount || 0)
              const remaining = Number(item.remaining_amount || item.amount || 0)
              const paid = Number(item.paid_amount || 0)
              const progress = principal ? Math.min(100, Math.round((paid / principal) * 100)) : 0
              const isClosed = item.status === 'closed'
              const history = historyItems[item._id] || []
              const paymentDateKey = (entry) => entry.payment_date || entry.date || entry.created_at || ''

              return (
                <div key={item._id} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-lg font-semibold text-white">{item.name || item.type || 'Liability'}</p>
                        {item.status && (
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">{item.status}</span>
                        )}
                        {isClosed && (
                          <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-200">Loan Closed</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">{item.type} {item.interest_rate ? `· ${item.interest_rate}% APR` : ''}</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <p className="text-sm text-slate-300">Principal {currency(principal)}</p>
                        <p className="text-sm text-slate-300">Remaining {currency(remaining)}</p>
                        <p className="text-sm text-slate-300">Paid {currency(paid)}</p>
                        <p className="text-sm text-slate-300">{progress}% repaid</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-3">
                      <Button variant="secondary" type="button" onClick={() => toggleHistory(item._id)}>
                        {openHistory[item._id] ? 'Hide history' : 'View history'}
                      </Button>
                      <Button
                        variant="primary"
                        type="button"
                        disabled={isClosed}
                        onClick={() => {
                          setActiveLoanId(item._id)
                          setPaymentAmount(item.emi_amount ? String(item.emi_amount) : String(remaining))
                        }}
                      >
                        Pay EMI
                      </Button>
                      <Button variant="danger" className="h-9 w-9 px-0" onClick={() => remove(item._id)}><Trash2 size={16} /></Button>
                    </div>
                  </div>

                  {activeLoanId === item._id && (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                      <p className="text-sm text-slate-400">Submit a payment for this loan.</p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                        <Field label="Amount" type="number" min="0" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
                        <Button type="button" onClick={() => pay(item._id)} disabled={loadingPayment}>
                          {loadingPayment ? 'Processing...' : 'Submit payment'}
                        </Button>
                        <Button variant="secondary" type="button" onClick={() => setActiveLoanId(null)}>Cancel</Button>
                      </div>
                      {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
                    </div>
                  )}

                  {openHistory[item._id] && (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">
                      <p className="mb-3 text-sm font-semibold text-white">Payment history</p>
                      {loadingHistory[item._id] ? (
                        <p>Loading history…</p>
                      ) : history.length ? (
                        <div className="grid gap-2">
                          {history.map((entry) => {
                            const dateValue = paymentDateKey(entry)
                            return (
                              <div key={`${entry._id || entry.amount}-${dateValue}`} className="flex items-center justify-between gap-4 rounded-xl bg-white/5 p-3">
                                <span>{currency(entry.amount)}</span>
                                <span className="text-slate-400">{dateValue ? new Date(dateValue).toLocaleDateString() : 'Unknown date'}</span>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-slate-500">No payment history yet.</p>
                      )}
                    </div>
                  )}
                </div>
              )
            }) : <EmptyState title="No liabilities" text="Track loans, credit, and EMIs to keep net worth honest." />}
          </div>
        </Card>
      </div>
    </>
  )
}

