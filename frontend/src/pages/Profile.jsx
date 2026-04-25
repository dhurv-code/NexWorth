import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import Field from '../components/Field.jsx'
import PageHeader from '../components/PageHeader.jsx'
import SelectField from '../components/SelectField.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { profileApi } from '../services/api.js'

const initialProfile = {
  name: '',
  age: '',
  monthly_income: '',
  risk_level: 'medium',
  goal_years: '',
  investment_experience: 'intermediate',
}

export default function Profile() {
  const [profile, setProfile] = useState(initialProfile)
  const [saved, setSaved] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    profileApi.me().then((res) => setProfile({ ...initialProfile, ...res.data })).catch(() => {})
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    await profileApi.save({
      ...profile,
      age: Number(profile.age || 0),
      monthly_income: Number(profile.monthly_income || 0),
      goal_years: Number(profile.goal_years || 0),
    })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }

  return (
    <>
      <PageHeader eyebrow="Investor identity" title="Profile">
        <Button form="profile-form"><Save size={17} /> Save profile</Button>
      </PageHeader>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <h2 className="text-xl font-semibold text-white">Financial profile</h2>
          <form id="profile-form" onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Enter your name" />
            <Field label="Age" type="number" min="1" value={profile.age} onChange={(e) => setProfile({ ...profile, age: e.target.value })} />
            <Field label="Monthly income" type="number" min="0" value={profile.monthly_income} onChange={(e) => setProfile({ ...profile, monthly_income: e.target.value })} />
            <Field label="Goal horizon in years" type="number" min="1" value={profile.goal_years} onChange={(e) => setProfile({ ...profile, goal_years: e.target.value })} />
            <SelectField label="Risk level" value={profile.risk_level} onChange={(e) => setProfile({ ...profile, risk_level: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </SelectField>
            <SelectField label="Experience" value={profile.investment_experience} onChange={(e) => setProfile({ ...profile, investment_experience: e.target.value })}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </SelectField>
          </form>
          {saved ? <p className="mt-4 rounded-lg border border-teal-300/20 bg-teal-300/10 px-3 py-2 text-sm text-teal-100">Profile saved successfully.</p> : null}
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-white">Account</h2>
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Email</p>
              <p className="mt-1 font-semibold text-white">{user?.email || 'Authenticated user'}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Risk posture</p>
              <p className="mt-1 font-semibold capitalize text-white">{profile.risk_level}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Planning horizon</p>
              <p className="mt-1 font-semibold text-white">{profile.goal_years || 0} years</p>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}

