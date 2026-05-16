import { ArrowRight, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import Field from '../components/Field.jsx'
import { api } from '../services/api.js'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const { data } = await api.post('/auth/forgot-password', { email })
      setSuccess(data?.message || 'Reset link generated. Check your inbox.')
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Unable to send reset link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md p-7">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-300">Reset password</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Forgot your password?</h2>
      <p className="mt-3 text-sm leading-6 text-slate-400">Enter your email and we’ll send a password reset link to your inbox.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
        />
        {error ? <p className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p> : null}
        {success ? <p className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{success}</p> : null}
        <Button type="submit" className="w-full" disabled={loading || success}>
          {loading ? <Loader2 size={17} className="animate-spin" /> : <ArrowRight size={17} />}
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Remembered your password? <Link className="font-semibold text-teal-300 hover:text-teal-200" to="/login">Sign in</Link>
      </p>
    </Card>
  )
}
