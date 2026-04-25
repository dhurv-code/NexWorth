export const currency = (value = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

export const percent = (value = 0) => `${Number(value || 0).toFixed(0)}%`

export const today = () => new Date().toISOString().slice(0, 10)

export const getInitials = (email = 'PI') =>
  email
    .split('@')[0]
    .split(/[._-]/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'PI'

