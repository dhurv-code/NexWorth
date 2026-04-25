export default function MetricCard({ icon: Icon, label, value, tone = 'teal', detail }) {
  const tones = {
    teal: 'from-teal-300/22 text-teal-200',
    blue: 'from-blue-300/22 text-blue-200',
    amber: 'from-amber-300/22 text-amber-200',
    rose: 'from-rose-300/22 text-rose-200',
  }

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        </div>
        <div className={`rounded-lg bg-gradient-to-br ${tones[tone]} to-white/[0.03] p-3`}>
          <Icon size={22} />
        </div>
      </div>
      {detail ? <p className="mt-4 text-sm text-slate-400">{detail}</p> : null}
    </div>
  )
}

