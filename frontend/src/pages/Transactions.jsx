import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Field from '../components/Field.jsx'
import PageHeader from '../components/PageHeader.jsx'
import SelectField from '../components/SelectField.jsx'
import { transactionsApi } from '../services/api.js'
import { currency, today } from '../utils/formatters.js'

const initialForm = { type: 'expense', category: '', amount: '', date: today(), note: '' }

export default function Transactions() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)

  const load = () => transactionsApi.all().then((res) => setItems(res.data)).catch(() => {})

  useEffect(() => {
    load()
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    await transactionsApi.add({ ...form, amount: Number(form.amount) }).finally(() => setLoading(false))
    setForm(initialForm)
    load()
  }

  const remove = async (id) => {
    await transactionsApi.remove(id)
    load()
  }

  return (
    <>
      <PageHeader eyebrow="Money movement" title="Transactions">
        <Button form="transaction-form"><Plus size={17} /> Add transaction</Button>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.4fr]">
        <Card>
          <h2 className="text-xl font-semibold text-white">New entry</h2>
          <form id="transaction-form" onSubmit={submit} className="mt-5 grid gap-4">
            <SelectField label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </SelectField>
            <Field label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Salary, rent, SIP, food" required />
            <Field label="Amount" type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="25000" required />
            <Field label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            <Field label="Note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Optional memo" />
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save transaction'}</Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-white">Ledger</h2>
          <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
            {items.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.14em] text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {items.map((item) => (
                      <tr key={item._id} className="text-slate-300">
                        <td className="px-4 py-4">{item.date}</td>
                        <td className="px-4 py-4 font-medium text-white">{item.category}</td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.type === 'income' ? 'bg-teal-300/12 text-teal-200' : 'bg-rose-300/12 text-rose-200'}`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right font-semibold text-white">{currency(item.amount)}</td>
                        <td className="px-4 py-4 text-right">
                          <Button variant="danger" className="h-9 w-9 px-0" onClick={() => remove(item._id)}><Trash2 size={16} /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6"><EmptyState title="No transactions" text="Your ledger will fill in as you add income and expenses." /></div>
            )}
          </div>
        </Card>
      </div>
    </>
  )
}

