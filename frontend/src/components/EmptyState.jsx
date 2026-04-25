import { Sparkles } from 'lucide-react'

export default function EmptyState({ title, text }) {
  return (
    <div className="rounded-xl border border-dashed border-white/12 bg-white/[0.03] p-8 text-center">
      <Sparkles className="mx-auto text-teal-300" size={28} />
      <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">{text}</p>
    </div>
  )
}

