import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Field from '../components/Field.jsx'
import PageHeader from '../components/PageHeader.jsx'
import SelectField from '../components/SelectField.jsx'
import { liabilitiesApi } from '../services/api.js'
import { currency } from '../utils/formatters.js'

const initialForm = { name: '', amount: '', interest_rate: '', type: 'loan' }

export default function Liabilities() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(initialForm)

  const load = () => liabilitiesApi.all().then((res) => setItems(res.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const submit = async (event) => {
    event.preventDefault()
    await liabilitiesApi.add({ ...form, amount: Number(form.amount), interest_rate: Number(form.interest_rate || 0) })
    setForm(initialForm)
    load()
  }

  const remove = async (id) => {
    await liabilitiesApi.remove(id)
    load()
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
            <Field label="Outstanding amount" type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            <Field label="Interest rate" type="number" min="0" step="0.1" value={form.interest_rate} onChange={(e) => setForm({ ...form, interest_rate: e.target.value })} />
            <Button type="submit">Save liability</Button>
          </form>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold text-white">Debt book</h2>
          <div className="mt-5 grid gap-3">
            {items.length ? items.map((item) => (
              <div key={item._id} className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{item.name || item.type || 'Liability'}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.type} {item.interest_rate ? `- ${item.interest_rate}% APR` : ''}</p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xl font-semibold text-rose-100">{currency(item.amount)}</p>
                  <Button variant="danger" className="h-9 w-9 px-0" onClick={() => remove(item._id)}><Trash2 size={16} /></Button>
                </div>
              </div>
            )) : <EmptyState title="No liabilities" text="Track loans, credit, and EMIs to keep net worth honest." />}
          </div>
        </Card>
      </div>
    </>
  )
}

