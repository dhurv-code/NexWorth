import { ArrowRight, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import Field from '../components/Field.jsx'
import { useAuth } from '../hooks/useAuth.js'

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register(form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Try a different email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md p-7">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-300">Start investing</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Create your account</h2>
      <p className="mt-3 text-sm leading-6 text-slate-400">Passwords must be 8 to 20 characters to match the backend policy.</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          placeholder="you@example.com"
          required
        />
        <Field
          label="Password"
          type="password"
          minLength={8}
          maxLength={20}
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          placeholder="8 to 20 characters"
          required
        />
        {error ? <p className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 size={17} className="animate-spin" /> : <ArrowRight size={17} />}
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        Already registered? <Link className="font-semibold text-teal-300 hover:text-teal-200" to="/login">Sign in</Link>
      </p>
    </Card>
  )
}

