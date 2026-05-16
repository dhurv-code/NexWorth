import { ArrowRight, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import Field from '../components/Field.jsx'
import { useAuth } from '../hooks/useAuth.js'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(form)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to sign in. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md p-7">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-300">Welcome back</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Sign in to your portfolio</h2>
      <p className="mt-3 text-sm leading-6 text-slate-400">Use your MyMoney account to access your investment workspace.</p>
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
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          placeholder="Your password"
          required
        />
        <div className="text-right text-sm">
          <Link className="font-semibold text-teal-300 hover:text-teal-200" to="/forgot-password">Forgot Password?</Link>
        </div>
        {error ? <p className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 size={17} className="animate-spin" /> : <ArrowRight size={17} />}
          Sign in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        New here? <Link className="font-semibold text-teal-300 hover:text-teal-200" to="/register">Create an account</Link>
      </p>
    </Card>
  )
}

