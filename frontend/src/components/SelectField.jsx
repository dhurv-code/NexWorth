export default function SelectField({ label, children, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      <select
        className="h-11 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-teal-300/70 focus:ring-4 focus:ring-teal-300/10"
        {...props}
      >
        {children}
      </select>
    </label>
  )
}

