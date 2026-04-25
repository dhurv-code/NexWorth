export default function Button({ children, className = '', variant = 'primary', ...props }) {
  const variants = {
    primary:
      'bg-teal-400 text-slate-950 hover:bg-teal-300 shadow-lg shadow-teal-950/30',
    secondary:
      'border border-white/10 bg-white/[0.06] text-slate-100 hover:bg-white/[0.1]',
    danger: 'border border-rose-400/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20',
  }

  return (
    <button
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

