import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Field from '../components/Field.jsx'
import PageHeader from '../components/PageHeader.jsx'
import { goalsApi } from '../services/api.js'
import { currency } from '../utils/formatters.js'

const initialForm = { name: '', target_amount: '', current_amount: '', deadline: '' }

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [form, setForm] = useState(initialForm)

  const load = () => goalsApi.all().then((res) => setGoals(res.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const submit = async (event) => {
    event.preventDefault()
    await goalsApi.add({
      ...form,
      target_amount: Number(form.target_amount),
      current_amount: Number(form.current_amount || 0),
    })
    setForm(initialForm)
    load()
  }

  const remove = async (id) => {
    await goalsApi.remove(id)
    load()
  }

  return (
    <>
      <PageHeader eyebrow="Future capital" title="Goals">
        <Button form="goal-form"><Plus size={17} /> Add goal</Button>
      </PageHeader>
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.4fr]">
        <Card>
          <h2 className="text-xl font-semibold text-white">Create goal</h2>
          <form id="goal-form" onSubmit={submit} className="mt-5 grid gap-4">
            <Field label="Goal name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Home down payment" required />
            <Field label="Target amount" type="number" min="0" value={form.target_amount} onChange={(e) => setForm({ ...form, target_amount: e.target.value })} required />
            <Field label="Current amount" type="number" min="0" value={form.current_amount} onChange={(e) => setForm({ ...form, current_amount: e.target.value })} />
            <Field label="Deadline" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            <Button type="submit">Save goal</Button>
          </form>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          {goals.length ? goals.map((goal) => {
            const target = Number(goal.target_amount || goal.amount || 0)
            const current = Number(goal.current_amount || 0)
            const progress = target ? Math.min(100, Math.round((current / target) * 100)) : 0
            return (
              <Card key={goal._id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{goal.name || goal.title || 'Investment goal'}</h3>
                    <p className="mt-1 text-sm text-slate-400">{goal.deadline || 'No deadline set'}</p>
                  </div>
                  <Button variant="danger" className="h-9 w-9 px-0" onClick={() => remove(goal._id)}><Trash2 size={16} /></Button>
                </div>
                <p className="mt-5 text-2xl font-semibold text-white">{currency(target)}</p>
                <div className="mt-4 h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-teal-300" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-3 text-sm text-slate-400">{progress}% funded</p>
              </Card>
            )
          }) : <div className="md:col-span-2"><EmptyState title="No goals yet" text="Create a goal to turn future plans into trackable capital targets." /></div>}
        </div>
      </div>
    </>
  )
}

