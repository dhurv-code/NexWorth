import { ArrowRight, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import Field from '../components/Field.jsx'
import { api } from '../services/api.js'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (success) {
      const timer = window.setTimeout(() => navigate('/login'), 2000)
      return () => window.clearTimeout(timer)
    }
  }, [success, navigate])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!token) {
      setError('Reset token is missing. Please use the link from your email.')
      return
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, new_password: form.password })
      setSuccess('Password updated successfully. Redirecting to login...')
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Unable to update password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md p-7">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-300">Reset password</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Create a new password</h2>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        Enter a strong password and confirm it to finish resetting your account.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field
          label="New Password"
          type="password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          placeholder="New password"
          required
          minLength={8}
        />
        <Field
          label="Confirm Password"
          type="password"
          value={form.confirmPassword}
          onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
          placeholder="Confirm password"
          required
          minLength={8}
        />
        {error ? <p className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p> : null}
        {success ? <p className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{success}</p> : null}
        <Button type="submit" className="w-full" disabled={loading || !!success}>
          {loading ? <Loader2 size={17} className="animate-spin" /> : <ArrowRight size={17} />}
          Update password
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Back to <Link className="font-semibold text-teal-300 hover:text-teal-200" to="/login">Sign in</Link>
      </p>
    </Card>
  )
}
